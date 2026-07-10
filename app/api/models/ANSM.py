# coding: utf-8

import re
import datetime

from pymongo import UpdateOne

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

	def upsert_op(self):
		# Build a single bulk upsert operation for this document. Stamps updated_at (used by
		# flag_stale_as_deleted) and sets created_at only on insert via $setOnInsert. This replaces
		# the two individual round-trips of save() + save(new=True) with one batched op.
		now = datetime.datetime.now().isoformat()
		self.updated_at = now
		self.deleted_at = None
		data = self.serialize()
		data.pop('created_at', None)
		return UpdateOne(
			{'_id': self._id},
			{'$set': data, '$setOnInsert': {'created_at': now}},
			upsert=True
		)

	@classmethod
	def flag_stale_as_deleted(cls, since):
		# Flag only live rows NOT refreshed during this run (updated_at older than run start).
		# Called at the very end of an update so an interruption never wipes the catalogue.
		now = datetime.datetime.now().isoformat()
		return cls.collection.update_many(
			{'deleted_at': None, '$or': [{'updated_at': {'$lt': since}}, {'updated_at': None}]},
			{'$set': {'deleted_at': now}}
		)

	@classmethod
	def search_by_name(cls, name, proj='default', search_within_deleted=False):
		name = name.replace("e", "[eéèêë]".decode('UTF-8'))
		name = name.replace("E", "[eéèêë]".decode('UTF-8'))
		regx = re.compile(name, re.IGNORECASE)
		query = {'$or': [{'name': regx}, {'_id': regx}]}
		if not search_within_deleted:
			query = {'$and': [query, {'deleted_at': None}]}
		return cls._search(query, proj, limit=100)
