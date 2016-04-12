import re
import jsonpickle
from pymongo import MongoClient


client = MongoClient()
db = client.Prescrisur


class classproperty(object):
	def __init__(self, fget):
		self.fget = fget

	def __get__(self, owner_self, owner_cls):
		return self.fget(owner_cls)


class BaseModel(object):
	@classproperty
	def collection(cls):
		return db[cls.__name__]

	@classmethod
	def get(cls, obj_id):
		obj = cls.collection.find_one({'_id': obj_id})
		if not obj:
			return None
		return cls(**obj)

	@classmethod
	def search(cls, query):
		regx = re.compile('^' +query, re.IGNORECASE)
		objs = cls.collection.find({'name': regx})
		if not objs:
			return []
		# return map(lambda o: cls(**o), objs)
		return list(objs)

	def serialize(self):
		to_string = jsonpickle.encode(self, unpicklable=False)
		return jsonpickle.decode(to_string)

	def save(self):
		self.collection.save(self.serialize())
