def remove_blank_br(text):
	if text.endswith('<p></p>'):
		text = text[:-7]
	while text.endswith('<p><br></p>'):
		text = text[:-11]
	return text
