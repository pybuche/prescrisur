# coding=utf-8
from pymongo import ASCENDING

from .ANSM import ANSMObject
from .speciality import Speciality


class Substance(ANSMObject):
	ORDER_BY = [('name', ASCENDING)]

	def __init__(self, _id, name, status=None, specialities=None, created_at=None, updated_at=None, deleted_at=None, **kwargs):
		super(Substance, self).__init__(created_at, updated_at, deleted_at)

		self._id = _id
		self.name = name
		self.status = status
		self.specialities = []
		if specialities:
			self.add_specialities(specialities)

	def __eq__(self, other):
		return self._id == other._id

	def add_specialities(self, specs):
		for s in specs:
			self.specialities.append(Speciality(**s))

	def add_speciality_from_cis(self, cis, spec_index=None):
		# spec_index (a {cis: Speciality} dict) lets callers avoid a DB read per composition line;
		# falls back to a direct DB lookup when not provided.
		spec = spec_index.get(cis) if spec_index is not None else Speciality.get(cis)
		if spec:
			if spec.status == 'R':
				self.status = 'G'
			if spec not in self.specialities:
				self.specialities.append(spec)

	def sort_specialities(self):
		self.specialities.sort(key=lambda s: s.name)
		return self
