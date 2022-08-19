# coding=utf-8
import bleach
from slugify import slugify

from .base_model import BaseModel
from services import commons

bleach.ALLOWED_TAGS += ['h2', 'h3', 'h4', 'p', 'br', 'span', 'div', 'img', 'i', 'u', 'font']
bleach.ALLOWED_ATTRIBUTES.update({
	'a': ['href', 'title', 'target'],
	'img': ['src', 'alt', 'title'],
	'span': ['id', 'class'],
	'font': ['color']
})


class Page(BaseModel):
	PROJECTION = {'name': 1}

	def __init__(self, name, text, _id=None, **kwargs):
		self._id = _id if _id else slugify(name)
		self.name = name
		self.text = text

	def check(self):
		self.name = bleach.clean(self.name)
		self.text = commons.remove_blank_br(bleach.clean(self.text))
		return self
