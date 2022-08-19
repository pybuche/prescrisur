# coding: utf-8

import re
import datetime

from .base_model import BaseModel


class ANSMObject(BaseModel):
	def __init__(self, created_at=None, updated_at=None, deleted_at=None, **kwargs):
		self.created_at = created_at
		self.updated_at = updated_at
		self.deleted_at = deleted_at

	def save(self, new=False, upsert=True):
		now = datetime.datetime.now().isoformat()
		self.created_at = now
		self.updated_at = now
		if not new:
			delattr(self, 'created_at')
		return super(ANSMObject, self).save(upsert=upsert)

	@classmethod
	def flag_all_as_deleted(cls):
		now = datetime.datetime.now().isoformat()
		return cls.collection.update_many({'deleted_at': None}, {'$set': {'deleted_at': now}})

	@classmethod
	def search_by_name(cls, name, proj='default', search_within_deleted=False):
		name = name.replace("e", "[eéèêë]".decode('UTF-8'))
		name = name.replace("E", "[eéèêë]".decode('UTF-8'))
		regx = re.compile(name, re.IGNORECASE)
		query = {'$or': [{'name': regx}, {'_id': regx}]}
		if not search_within_deleted:
			query = {'$and': [query, {'deleted_at': None}]}
		return cls._search(query, proj, limit=100)
