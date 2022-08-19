# coding=utf-8
from slugify import slugify

from .base_model import BaseModel


class TherapeuticClass(BaseModel):
	PROJECTION = {'name': 1, 'pathology': 1}

	def __init__(self, pathology, name, text=None, levels=None, entries=None, _id=None, **kwargs):
		self._id = _id if _id else slugify(name)
		self.pathology = pathology
		self.name = name
		self.text = text
		self.levels = levels
		self.entries = entries
