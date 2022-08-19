import bleach
from flask_mail import Message
from flask import current_app

from config.config import mail


def send_to_default(data):
	subject = '[Prescrisur] ' + bleach.clean(data['subject'])
	body = bleach.clean(data['body'])
	sender = (data['sender']['name'], data['sender']['email'])
	msg = Message(subject=subject, html=body, sender=sender, reply_to=data['sender']['email'], recipients=[current_app.config['DEFAULT_RECIPIENT']])
	mail.send(msg)


def send_from_default(recipient, subject, body):
	sender = current_app.config['MAIL_DEFAULT_SENDER']
	msg = Message(subject=subject, html=body, sender=sender, recipients=[recipient])
	mail.send(msg)
