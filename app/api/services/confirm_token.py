# coding=utf-8
from flask import current_app, render_template, url_for
from itsdangerous import URLSafeTimedSerializer

from services import mail as mail_service


def generate_confirmation_token(email):
	serializer = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
	return serializer.dumps(email, salt=current_app.config['SECURITY_PASSWORD_SALT'])


def confirm_token(token, expiration=3600):
	serializer = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
	try:
		email = serializer.loads(
			token,
			salt=current_app.config['SECURITY_PASSWORD_SALT'],
			max_age=expiration
		)
	except Exception as e:
		return False
	return email


def send_confirm_email(email):
	token = generate_confirmation_token(email)
	confirm_url = "https://" + current_app.config['APP_URL'] + '#/confirm/' + token
	email_body = render_template('confirm-email.html', confirm_url=confirm_url)
	subject = "Prescrisur - Activation"
	return mail_service.send_from_default(email, subject, email_body)


def send_update_email(new_email, old_email):
	key = '+'.join([new_email, old_email])
	token = generate_confirmation_token(key)
	confirm_url = "https://" + current_app.config['APP_URL'] + '#/update-email/' + token
	email_body = render_template('update-email.html', confirm_url=confirm_url)
	subject = "Prescrisur - Changement d'adresse mail"
	return mail_service.send_from_default(new_email, subject, email_body)


def send_reset_password_email(email):
	token = generate_confirmation_token(email)
	confirm_url = "https://" + current_app.config['APP_URL'] + '#/reset/' + token
	email_body = render_template('reset-password.html', confirm_url=confirm_url)
	subject = "Prescrisur - Réinitialisation du mot de passe"
	return mail_service.send_from_default(email, subject, email_body)
