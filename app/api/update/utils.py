# coding=utf-8
import requests


def fetch_lines(uri, min_lines=100):
	"""Download a tab-delimited ANSM file and return its lines.

	Raises on HTTP error (e.g. 502) or a suspiciously short body, so a bad
	response can never lead to the whole catalogue being swept as 'stale'.
	"""
	req = requests.get(uri)
	req.raise_for_status()
	lines = list(req.iter_lines())
	if len(lines) < min_lines:
		raise ValueError('Unexpected response from %s: only %d lines' % (uri, len(lines)))
	return lines
