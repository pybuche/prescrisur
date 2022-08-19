# coding=utf-8
from pymongo import ASCENDING

from .ANSM import ANSMObject


class Speciality(ANSMObject):
	ORDER_BY = [('name', ASCENDING)]

	def __init__(self, _id=None, short_name=None, name=None, dosage=None, spec_type=None, treatment_type=None, status=None, enabled=True, created_at=None, updated_at=None, deleted_at=None, **kwargs):
		super(Speciality, self).__init__(created_at, updated_at, deleted_at)

		self._id = _id
		self.short_name = short_name
		self.name = name
		self.dosage = dosage
		self.spec_type = spec_type
		self.treatment_type = treatment_type
		self.status = status
		self.enabled = enabled

	def __eq__(self, other):
		return self._id == other._id
