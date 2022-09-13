import bleach
from flask_mail import Message
from flask import current_app

from config.config import mail


def send_to_default(data):
	subject = '[Prescrisur] ' + bleach.clean(data['subject'])
	body = bleach.clean(data['body'])
	sender = (data['sender']['name'], data['sender']['email'])
	msg = Message(subject=subject, html=body, sender=current_app.config['MAIL_DEFAULT_SENDER'], reply_to=data['sender']['email'], recipients=[current_app.config['DEFAULT_RECIPIENT']])
        with mail.connect() as conn:
	      conn.send(msg)
        return {'success': True, 'to': current_app.config['DEFAULT_RECIPIENT']}

def send_from_default(recipient, subject, body):
	sender = current_app.config['MAIL_DEFAULT_SENDER']
	msg = Message(subject=subject, html=body, sender=sender, recipients=[recipient])
        with mail.connect() as conn:
	      conn.send(msg)
