import re
import jsonpickle
from pymongo import ASCENDING

from db.db import DB


class classproperty(object):
	def __init__(self, fget):
		self.fget = fget

	def __get__(self, owner_self, owner_cls):
		return self.fget(owner_cls)


class BaseModel(DB):
	PROJECTION = {'name': 1, 'status': 1}
	ORDER_BY = [('_id', ASCENDING)]

	@classproperty
	def collection(cls):
		return cls.db[cls.__name__]

	@classmethod
	def get(cls, obj_id=None):
		if not obj_id:
			return cls.all()
		obj = cls.collection.find_one({'_id': obj_id})
		if not obj:
			return None
		return cls(**obj)

	@classmethod
	def all(cls, proj=None):
		objs = cls.collection.find({}, proj).sort(cls.ORDER_BY)
		if not objs:
			return []
		return list(objs)

	@classmethod
	def _search(cls, query, proj='default', limit=0):
		if proj == 'default':
			proj = cls.PROJECTION
		objs = cls.collection.find(query, proj, limit=limit).sort(cls.ORDER_BY)
		if not objs:
			return []
		return list(objs)

	@classmethod
	def search_by_name(cls, name, proj='default'):
		regx = re.compile(name, re.IGNORECASE)
		return cls._search({'$or': [{'name': regx}, {'_id': regx}]}, proj, limit=200)

	@classmethod
	def delete(cls, obj_id):
		return cls.collection.delete_one({'_id': obj_id})

	def serialize(self):
		to_string = jsonpickle.encode(self, unpicklable=False)
		return jsonpickle.decode(to_string)

	def create(self):
		return self.collection.insert_one(self.serialize())

	def save(self, upsert=True):
		return self.collection.update_one({'_id': self._id}, {'$set': self.serialize()}, upsert=upsert)

	def save_or_create(self, obj_id):
		if obj_id:
			save = self.save()
			status_code = 200
		else:
			save = self.create()
			status_code = 201
		if not save.acknowledged:
			return 400
		return status_code
