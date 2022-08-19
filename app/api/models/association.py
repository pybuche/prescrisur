# coding=utf-8
from slugify import slugify

from .base_model import BaseModel
from .substance import Substance


class Association(BaseModel):
	def __init__(self, name, _id=None, status=None, substances=None, specialities=None, **kwargs):
		self._id = _id if _id else slugify(name)
		self.name = name
		self.substances = self.add_substances(substances) if substances else []
		self.specialities = specialities if specialities else self.add_specialities(self.substances)
		self.status = status if status else self.get_status(self.substances)

	@staticmethod
	def add_substances(substances):
		subst = []
		for s in substances:
			subst.append(Substance(**s))
		subst.sort(key=lambda x: x.name)
		return subst

	@staticmethod
	def add_specialities(substances):
		specs = []
		for s in substances:
			subst = Substance.get(s._id)
			specs += subst.specialities
		specs.sort(key=lambda x: x.name)
		return specs

	@staticmethod
	def get_status(substances):
		for subst in substances:
			if subst.status == 'G':
				return 'G'
		return None
