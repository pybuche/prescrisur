import os
import logging
from flask import current_app
from logging.handlers import TimedRotatingFileHandler


class Logger(logging.getLoggerClass()):
	def __init__(self, log_name, level=logging.DEBUG):
		logging.getLoggerClass().__init__(self, log_name, level)
		self.name = log_name
		self.log_dir = os.environ.get('LOG_DIR', '/home/app/logs')
		self.propagate = False
		self.set_handler(level)

	def set_handler(self, level):
		handler = TimedRotatingFileHandler(os.path.join(self.log_dir, self.name + '.log'), when='midnight')
		handler.setLevel(level)
		formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
		handler.setFormatter(formatter)
		self.addHandler(handler)
