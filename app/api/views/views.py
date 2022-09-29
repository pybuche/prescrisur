# coding=utf-8
from flask import *
from flask_login import login_required, login_user, logout_user, current_user
from pymongo.errors import DuplicateKeyError

from config.config import login_manager
from models import *
from decorators.decorators import required_role, monitored
from services import mail as mail_service
from services.confirm_token import *
from update import SpecialityUpdater, SubstanceUpdater

api = Blueprint('api', __name__)


@api.route('/')
def index():
	return current_app.send_static_file('index.html')


@api.route('/api/specialities')
@required_role('admin')
@monitored
def get_all_specialities():
	return jsonify(data=Speciality.all(proj={'name': 1, 'created_at': 1, 'updated_at': 1, 'deleted_at': 1}))


@api.route('/api/specialities/search')
def search_speciality():
	q = request.args.get('q')
	return jsonify(data=Speciality.search_by_name(q))


@api.route('/api/substances')
@required_role('admin')
@monitored
def substances():
	return jsonify(data=Substance.all(proj={'name': 1, 'created_at': 1, 'updated_at': 1, 'deleted_at': 1}))


@api.route('/api/substances/<subst_id>')
@login_required
@monitored
def substance(subst_id=None):
	subst = Substance.get(subst_id)
	if not subst:
		abort(404)
	return jsonify(data=subst)


@api.route('/api/substances/search')
def search_substance():
	q = request.args.get('q')
	with_spec = request.args.get('specialities')
	if not with_spec or with_spec == 'false':
		return jsonify(data=Substance.search_by_name(q))
	else:
		return jsonify(data=Substance.search_by_name(q, {'name': 1, 'status': 1, 'specialities': 1}))


@api.route('/api/pathologies/<patho_id>/draft', methods=['DELETE'])
@required_role('admin')
@monitored
def delete_pathology_draft(patho_id):
	success = False
	remove = PathologyDraft.delete(patho_id)
	if remove.acknowledged:
		success = True
	return jsonify(success=success)


@api.route('/api/pathologies/draft', methods=['GET'], endpoint='pathologies_drafts')
@api.route('/api/pathologies/<patho_id>/draft', methods=['GET'])
@required_role('admin')
@monitored
def pathology_draft(patho_id=None):
	patho = PathologyDraft.get(patho_id)
	if not patho:
		abort(404)
	return jsonify(data=patho)


@api.route('/api/pathologies/<patho_id>/draft/exist', methods=['GET'])
@required_role('admin')
def pathology_has_draft(patho_id):
	patho = PathologyDraft.get(patho_id)
	if patho:
		return jsonify(exists=True)
	return jsonify(exists=False)


@api.route('/api/pathologies/draft', methods=['POST'])
@api.route('/api/pathologies/<patho_id>/draft', methods=['PUT'], endpoint='update_pathology_draft')
@required_role('admin')
@monitored
def edit_pathology_draft(patho_id=None):
	data = request.get_json()
	patho = PathologyDraft(**data).check().refresh_update_date()
	status_code = patho.save_or_create(patho_id)
	return jsonify(data=patho), status_code


@api.route('/api/pathologies/<patho_id>/validate', methods=['PUT'])
@required_role('admin')
@monitored
def validate_pathology(patho_id):
	draft = PathologyDraft.get(patho_id)
	patho = Pathology(**draft.serialize())
	patho.refresh_update_date()
	patho.save_therapeutic_classes()
	saved = patho.save()
	if not saved.acknowledged:
		abort(400)
	PathologyDraft.delete(patho_id)
	return jsonify(data=patho)


@api.route('/api/pathologies/<patho_id>/unvalidate', methods=['PUT'])
@required_role('admin')
@monitored
def unvalidate_pathology(patho_id):
	patho = Pathology.get(patho_id)
	draft = PathologyDraft(**patho.serialize())
	saved = draft.save()
	if not saved.acknowledged:
		abort(400)
	Pathology.delete(patho_id)
	return jsonify(data=draft)


@api.route('/api/pathologies/<patho_id>', methods=['DELETE'])
@required_role('admin')
@monitored
def delete_pathology(patho_id):
	success = False
	remove = Pathology.delete(patho_id)
	if remove.acknowledged:
		success = True
	return jsonify({'success': success})


@api.route('/api/pathologies/<patho_id>', methods=['GET'])
@login_required
@monitored
def pathology(patho_id=None):
	patho = Pathology.get(patho_id)
	if not patho:
		abort(404)
	return jsonify(data=patho)


@api.route('/api/pathologies', methods=['GET'])
def pathologies():
	patho = Pathology.all()
	if not patho:
		abort(404)
	return jsonify(data=patho)


@api.route('/api/pathologies/substances/<subst_id>')
@login_required
def search_pathologies_from_substance(subst_id):
	return jsonify(data=Pathology.search_by_substance(subst_id))


@api.route('/api/pathologies/search')
def search_pathology():
	q = request.args.get('q')
	return jsonify(data=Pathology.search_by_name(q))


@api.route('/api/classes/<class_id>', methods=['GET'])
@login_required
@monitored
def therapeutic_class(class_id=None):
	t_class = TherapeuticClass.get(class_id)
	if not t_class:
		abort(404)
	return jsonify(data=t_class)


@api.route('/api/classes/search')
def search_therapeutic_class():
	q = request.args.get('q')
	return jsonify(data=TherapeuticClass.search_by_name(q))


@api.route('/api/classes/<class_id>', methods=['DELETE'])
@required_role('admin')
@monitored
def delete_therapeutic_class(class_id):
	remove = TherapeuticClass.delete(class_id)
	return jsonify(success=remove.acknowledged)


@api.route('/api/pages', methods=['POST'])
@api.route('/api/pages/<page_id>', methods=['PUT'], endpoint='update_page')
@required_role('admin')
@monitored
def edit_page(page_id=None):
	data = request.json
	p = Page(**data).check()
	status_code = p.save_or_create(page_id)
	return jsonify(data=p), status_code


@api.route('/api/pages', methods=['GET'])
@api.route('/api/pages/<page_id>', methods=['GET'])
@monitored
def page(page_id=None):
	p = Page.get(page_id)
	if not p:
		abort(404)
	return jsonify(data=p)


@api.route('/api/news', methods=['POST'])
@api.route('/api/news/<news_id>', methods=['PUT'], endpoint='update_news')
@required_role('admin')
@monitored
def edit_news(news_id=None):
	data = request.get_json()
	n = News(**data).check().refresh_update_date().set_author(current_user)
	status_code = n.save_or_create(news_id)
	return jsonify(data=n), status_code


@api.route('/api/news/<news_id>', methods=['DELETE'])
@required_role('admin')
@monitored
def delete_news(news_id):
	success = False
	remove = News.delete(news_id)
	if remove.acknowledged:
		success = True
	return jsonify({'success': success})


@api.route('/api/news', methods=['GET'])
@api.route('/api/news/<news_id>', methods=['GET'])
@monitored
def news(news_id=None):
	n = News.get(news_id)
	if not n:
		abort(404)
	return jsonify(data=n)


@api.route('/api/associations', methods=['POST'])
@api.route('/api/associations/<asso_id>', methods=['PUT'], endpoint='update_association')
@required_role('admin')
@monitored
def edit_association(asso_id=None):
	data = request.json
	asso = Association(**data)
	status_code = asso.save_or_create(asso_id)
	return jsonify(data=asso), status_code


@api.route('/api/associations/<asso_id>', methods=['DELETE'])
@required_role('admin')
@monitored
def delete_association(asso_id):
	success = False
	remove = Association.delete(asso_id)
	if remove.acknowledged:
		success = True
	return jsonify(success=success)


@api.route('/api/associations', methods=['GET'])
@required_role('admin')
@monitored
def associations():
	asso = Association.get()
	if not asso:
		abort(404)
	return jsonify(data=asso)


@api.route('/api/associations/search')
def search_association():
	q = request.args.get('q')
	return jsonify(data=Association.search_by_name(q, proj={'name': 1, 'status': 1, 'specialities': 1}))


@api.route('/api/users', methods=['GET'])
@required_role('admin')
@monitored
def users():
	skip = request.args.get('skip', None)
	limit = request.args.get('limit', None)
	return jsonify(data=User.all(skip, limit))

@api.route('/api/users/<user_id>', methods=['PUT', 'DELETE'])
@required_role('admin')
@monitored
def delete_users(user_id):
	User.delete(user_id)
	return jsonify({'success': True})


@api.route('/api/users/<user_id>/subscription', methods=['PUT', 'DELETE'])
@required_role('admin')
@monitored
def subscribe(user_id):
	u = User.get(user_id)
	if not u:
		abort(404)
	if request.method == 'PUT':
		u.add_role('subscriber').save()
	elif request.method == 'DELETE':
		u.remove_role('subscriber').save()
	return jsonify({'success': True})


@api.route('/api/users/<user_id>/newsletter', methods=['PUT', 'DELETE'])
def newsletter(user_id):
	u = User.get(user_id)
	if not u:
		abort(404)
	if request.method == 'PUT':
		u.add_role('newsletter').save()
	elif request.method == 'DELETE':
		u.remove_role('newsletter').save()
	return jsonify({'success': True})


@api.route('/api/mail', methods=['POST'])
@monitored
def send_mail():
	data = json.loads(request.data)
	return jsonify(mail_service.send_to_default(data))


###############
# Login
###############


@login_manager.user_loader
def user_loader(email):
	return User.get(email)


@login_manager.request_loader
def load_user_from_request(request):
	api_key = request.args.get('api_key')
	if api_key:
		user = User.verify_auth_token(api_key)
		if user and user.confirmed:
			return user
	return None


@login_manager.unauthorized_handler
def unauthorized_handler():
	return jsonify(need_login=True), 401


@api.route('/api/register', methods=['POST'])
@monitored
def register():
	data = json.loads(request.data)
	user = User(**data)
	user.generate_auth_token()
	user.generate_register_date()
	user.add_to_newsletter()
	user.create()
	send_confirm_email(user.email)
	return jsonify(success=True)


@api.route('/api/confirm/send', methods=['POST'])
def send_confirm():
	email = request.get_json()['email']
	send_confirm_email(email)
	return jsonify(success=True)


@api.route('/api/confirm/<token>')
@monitored
def confirm_email(token):
	try:
		email = confirm_token(token)
	except Exception as e:
		return 'Lien non valide'
	user = User.get_by_email(email)
	if not user:
		abort(404)
	if not user.confirmed:
		user.confirm()
	login_user(user)
	return jsonify(user=user.clean(), confirmed_email=True)


@api.route('/api/reset/send', methods=['POST'])
@monitored
def send_reset_password():
	email = request.get_json()['email']
	user = User.get_by_email(email)
	if not user:
		return jsonify(no_user=True), 404
	if not user.confirmed:
		return jsonify(not_confirmed=True), 400
	send_reset_password_email(email)
	return jsonify(success=True)


@api.route('/api/reset', methods=['POST'])
@monitored
def reset_password():
	data = request.get_json()
	user = User.get_by_email(data['email'])
	if not user:
		abort(404)
	user.password_hash = user.hash_password(data['passwd'])
	user.save()
	return jsonify(success=True)


@api.route('/api/reset/<token>')
@monitored
def validate_reset_password(token):
	try:
		email = confirm_token(token)
	except Exception as e:
		return jsonify(error=True), 400
	return jsonify(email=email)


@api.route('/api/login', methods=['POST'])
@monitored
def login():
	data = json.loads(request.data)
	remember = data['remember'] if 'remember' in data else False
	user = User.get_by_email(data['email'])
	if not user:
		return jsonify(no_user=True), 401
	if not user.verify_password(data['passwd']):
		return jsonify(bad_password=True), 400
	elif not user.confirmed:
		return jsonify(not_confirmed=True), 400
	login_user(user, remember=remember)
	return jsonify(data=user.clean())


@api.route('/api/logout')
@login_required
@monitored
def logout():
	logout_user()
	return jsonify(success=True)


@api.route('/api/me', methods=['GET'])
def get_user_status():
	if not current_user.is_authenticated:
		return jsonify(user=False)
	return jsonify(user=current_user.clean())


@api.route('/api/me', methods=['PUT'])
@login_required
@monitored
def update_user_profile():
	data = request.get_json()
	# Set name
	current_user.name = data['name']
	# Set email
	updated_mail = False
	if data['email'] != '' and data['email'] != current_user.email:
		send_update_email(data['email'], current_user.email)
		updated_mail = data['email']
	# Check password
	if all(p in data for p in ['currentPasswd', 'newPasswd', 'confirmNewPasswd']):
		if current_user.verify_password(data['currentPasswd']) and data['newPasswd'] == data['confirmNewPasswd']:
			current_user.password_hash = current_user.hash_password(data['newPasswd'])
		else:
			return jsonify(bad_password=True), 400
	current_user.save()
	return jsonify(user=current_user.clean(), updated_mail=updated_mail)


@api.route('/api/update-email/<token>')
@monitored
def update_user_email(token):
	try:
		key = confirm_token(token)
	except Exception as e:
		return 'Lien non valide'
	split = key.split('+')
	new_email = split[0]
	old_email = split[1]
	user = User.get_by_email(old_email)
	if not user:
		abort(404)
	else:
		user.email = new_email
		user.save()
		logout_user()
		login_user(user)
	return jsonify(user=user.clean(), updated_email=True)


# ANSM Update
@api.route('/api/update/ansm', methods=['POST'])
@required_role('admin')
@monitored
def update_ansm():
	SpecialityUpdater().execute()
	SubstanceUpdater().execute()
	return jsonify(success=True)


# Errors
@api.errorhandler(DuplicateKeyError)
def duplicate_key(error):
	return jsonify(already_exist=True), 400


@api.errorhandler(Exception)
def unhandled_error(error):
	return jsonify(error=repr(error)), 500
