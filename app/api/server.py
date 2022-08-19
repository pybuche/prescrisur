from flask import Flask
from config import EnvConfig, mail, cors, login_manager
from services.json_encoder import ModelJSONEncoder
from views import api

def create_app(config_module):
	# Create app and set config
	app = Flask(__name__, static_folder='/home/api/front')
	app.json_encoder = ModelJSONEncoder
	app.config.from_object(config_module)
	app.config['JSONIFY_PRETTYPRINT_REGULAR'] = False

	# Import views
	app.register_blueprint(api)

	# Init plugins
	mail.init_app(app)
	cors.init_app(app)
	login_manager.init_app(app)
	return app

app = create_app(EnvConfig)
app.run(host='0.0.0.0', port=8080, debug=True)
