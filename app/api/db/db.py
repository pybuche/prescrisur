from pymongo import MongoClient


class classproperty(object):
	def __init__(self, fget):
		self.fget = fget

	def __get__(self, owner_self, owner_cls):
		return self.fget(owner_cls)


class DB(object):
	DB_NAME = 'Prescrisur'
	client = MongoClient('db')

	@classproperty
	def db(cls):
		return cls.client[cls.DB_NAME]
