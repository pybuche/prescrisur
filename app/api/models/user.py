import time
import requests
import json
import datetime

from slugify import slugify
from pymongo import ASCENDING, DESCENDING
from flask import current_app
from passlib.hash import pbkdf2_sha256
from itsdangerous import TimedJSONWebSignatureSerializer as URLSafeSerializer, BadSignature, SignatureExpired

from .base_model import BaseModel

class User(BaseModel):
	def __init__(self, _id=None, email=None, password=None, password_hash=None, fname=None, name=None, roles=None, confirmed=False, token=None, register_date=None, timestamp=1483228800000.0, **kwargs):
		self._id = _id if _id else slugify(email)
		self.email = email
		self.password_hash = self.hash_password(password, password_hash)
		self.fname = fname
		self.name = name
		self.roles = roles if roles else []
		self.confirmed = confirmed
		self.token = token
		self.register_date = register_date
		self.timestamp = 0

	@property
	def is_active(self):
		return True

	@property
	def is_authenticated(self):
		return True

	@property
	def is_anonymous(self):
		return False

	@classmethod
	def get_by_email(cls, email):
		user = cls.collection.find_one({'email': email})
		if not user:
			return None
		return User(**user)

	@classmethod
	def all(cls):
		objs = cls.collection.find()
		if not objs:
			return []
		users = []
		for u in objs:
			del u['password_hash']
			u['timestamp'] = time.mktime(datetime.datetime.strptime(u['register_date'], "%d/%m/%Y").timetuple())
			users.append(u)
		return users

	def confirm(self):
		self.confirmed = True
		return self.save()

	@staticmethod
	def hash_password(password=None, password_hash=None):
		if password_hash:
			return password_hash
		if password:
			return pbkdf2_sha256.encrypt(password, rounds=20000, salt_size=32)
		return None

	def verify_password(self, password):
		return pbkdf2_sha256.verify(password, self.password_hash)

	def generate_auth_token(self):
		s = URLSafeSerializer(current_app.config['SECRET_KEY'], expires_in=3153600000)
		self.token = s.dumps(self.email, salt=current_app.config['SECURITY_PASSWORD_SALT'])

	def generate_register_date(self):
		str_register_date = time.strftime("%d/%m/%Y")
		self.register_date = str_register_date
		self.timestamp = float((int((time.time() / 100)) * 100000))

	@staticmethod
	def verify_auth_token(token):
		s = URLSafeSerializer(current_app.config['SECRET_KEY'])
		try:
			email = s.loads(token, salt=current_app.config['SECURITY_PASSWORD_SALT'])
		except BadSignature:
			return None # invalid token
		return User.get_by_email(email)

	def clean(self):
		delattr(self, 'password_hash')
		delattr(self, 'token')
		return self

	def add_role(self, role):
		if role not in self.roles:
			self.roles.append(role)
		return self

	def remove_role(self, role):
		if role in self.roles:
			self.roles.remove(role)
		return self

	def get_id(self):
		return self._id

	def get_mail_chimp_members(self):
		headers = {
			'Authorization':current_app.config['MC_API_KEY']
		}
		r = requests.get(current_app.config['MC_URL_LIST_CONTACTS'], headers=headers)
		return r

	def add_mail_chimp(self):
		data = {
			"email_address": self.email,
			"status":"subscribed",
			"merge_fields":{
				"PRENOM":self.name,
				"NOM":self.name,
				"STATUT":"Pharmacien"
			}
		}
		headers = {
			'content-type': 'application/json',
			'Authorization':current_app.config['MC_API_KEY']
		}
		r = requests.post(current_app.config['MC_URL_LIST_CONTACTS'], headers=headers, data=json.dumps(data))
		return r

	def remove_mail_chimp(self):
		r = self.get_mail_chimp_members()
		liste = json.loads(r.text)
		for member in liste['members']:
			if self.email in member['email_address']:
				print >> sys.stderr, member['id']
				id_mail_chimp = member['id']
				url = current_app.config['MC_URL_LIST_CONTACTS'] + '/' + id_mail_chimp
				headers = {
				'content-type': 'application/json',
				'Authorization':current_app.config['MC_API_KEY']
				}
				r = requests.delete(url, headers=headers)
		return r

	def add_to_newsletter(self):
		self.add_role('newsletter')
		self.add_mail_chimp()

	def __eq__(self, other):
		if isinstance(other, User):
			return self.get_id() == other.get_id()
		return NotImplemented

	def __ne__(self, other):
		equal = self.__eq__(other)
		if equal is NotImplemented:
			return NotImplemented
		return not equal
