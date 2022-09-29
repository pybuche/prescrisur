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
	def all(cls, skip = None, limit = None):
		print(limit, skip, 'end2')
		skip = 0 if skip is None else skip
		limit = 100000 if limit is None or limit > 100000 else limit
		objs = cls.collection.find().sort ("email", 1)
		if not objs:
			return []
		users = []
		for u in objs:
			del u['password_hash']
			u['timestamp'] = time.mktime(datetime.datetime.strptime(u['register_date'], "%d/%m/%Y").timetuple())
			users.append(u)
		users.sort(key=lambda x: x['timestamp'], reverse=True)
		users = users[skip:skip+limit]
		date = datetime.date.today()
		stats = {
			"total": cls.collection.find().count(),
			"confirmed": cls.collection.find({"confirmed": True}).count(),
			"newsletter": cls.collection.find({"roles": ["newsletter"]}).count(),
			"month": cls.collection.find({"register_date": {"$regex": str(date.month) + "\/" + str(date.year), "$options" :'i'}}).count()
		}
		if limit > 200:
			time.sleep(30)
		return {"users": users, "stats": stats}

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

	def add_to_newsletter(self):
		self.add_role('newsletter')

	def __eq__(self, other):
		if isinstance(other, User):
			return self.get_id() == other.get_id()
		return NotImplemented

	def __ne__(self, other):
		equal = self.__eq__(other)
		if equal is NotImplemented:
			return NotImplemented
		return not equal
