from flask.json import JSONEncoder


class ModelJSONEncoder(JSONEncoder):
	def default(self, obj):
		if isinstance(obj, object):
			return obj.serialize()
		return super(ModelJSONEncoder, self).default(obj)
