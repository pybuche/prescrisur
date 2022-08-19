from functools import wraps
from datetime import datetime
from flask import jsonify, abort
from flask_login import current_user

from services.logger import Logger


def required_role(role):
	def wrapper(f):
		@wraps(f)
		def wrapped(*args, **kwargs):
			if not current_user.is_authenticated:
				abort(401)
			elif role not in current_user.roles:
				return jsonify(role_needed=role), 403
			return f(*args, **kwargs)
		return wrapped
	return wrapper


def monitored(f):
	logger = Logger('prescrisur.monitor')
	msg = "%s %s %s:%s %d"

	def get_func_arg(func_arg, kwargs):
		if kwargs:
			func_arg = kwargs.values()[0]
		return func_arg

	def get_uid(uid):
		if current_user.is_authenticated:
			uid = current_user._id
		return uid

	def log(func_arg, timestarted, uid):
		dt = ((datetime.utcnow() - timestarted).total_seconds() * 1000)
		logger.info(msg % (timestarted.time().isoformat(), uid, f.func_name, func_arg, dt))

	@wraps(f)
	def decorated_view(*args, **kwargs):
		uid = 'anonymous'
		func_arg = None
		uid = get_uid(uid)
		timestarted = datetime.utcnow()
		func_arg = get_func_arg(func_arg, kwargs)
		try:
			res = f(*args, **kwargs)
			log(func_arg, timestarted, uid)
			return res
		except:
			log(func_arg, timestarted, uid)
			raise

	return decorated_view
