# -*- coding: utf-8 -*-
import re
import datetime

from models import Speciality
from .utils import fetch_lines

SPECIALITIES_URI = 'https://base-donnees-publique.medicaments.gouv.fr/download/file/CIS_bdpm.txt'
SPEC_STATUS_URI = 'https://base-donnees-publique.medicaments.gouv.fr/download/file/CIS_GENER_bdpm.txt'
REG_NAME = r"([a-zA-Z0-9.()'\"\-\/ ]+)(\s([0-9,.\/-]+(\s[0-9])?\s?(bar|G|M|m|µ|n|g|I|%|U|u|POUR|pour|microgramme|gramme).*))"
REG_TYPE = r" et\s?"


class SpecialityUpdater(object):

	def execute(self):
		# Record the run start, then fetch & validate the update file BEFORE touching the DB:
		# a bad/empty response raises here so nothing is upserted and nothing is flagged deleted.
		run_start = datetime.datetime.now().isoformat()
		lines = fetch_lines(SPECIALITIES_URI)
		ops = []
		for line in lines:
			line = line.decode('ISO-8859-1').encode('UTF8').split('\t')
			if not line or len(line) < 5 or not self.is_valid(line[4], line[6]):
				continue
			ops.append(self.build_speciality(line).upsert_op())
		# One batched round-trip instead of one (or two) per speciality.
		if ops:
			Speciality.collection.bulk_write(ops, ordered=False)
		self.update_spec_status()
		# Only now, once every current speciality has been upserted, flag the ones that were not
		# refreshed during this run as deleted. An interruption before this point leaves the
		# catalogue fully visible (only stale) instead of empty.
		return Speciality.flag_stale_as_deleted(run_start)

	def update_spec_status(self):
		lines = fetch_lines(SPEC_STATUS_URI)
		bulk = Speciality.collection.initialize_ordered_bulk_op()
		has_ops = False
		for line in lines:
			line = line.decode('ISO-8859-1').encode('UTF8').split('\t')
			if len(line) < 4:
				continue
			spec_status = self.get_spec_status(line[3])
			if spec_status:
				bulk.find({'_id': line[2]}).update({'$set': {'status': spec_status}})
				has_ops = True
		if not has_ops:
			return None
		return bulk.execute()

	def build_speciality(self, line):
		name, dosage = self.parse_name(line[1])
		spec_type = self.get_spec_type(line[2])
		treatment_type = self.get_treatment_type(line[3])
		full_name = self.get_full_name(name, dosage, spec_type)
		return Speciality(
			_id=line[0],
			short_name=name,
			name=full_name,
			dosage=dosage,
			spec_type=spec_type,
			treatment_type=treatment_type,
			status=None
		)

	@staticmethod
	def is_valid(authorization, marketing):
		if authorization == 'Autorisation active' and 'non comm' not in marketing.lower():
			return True
		return False

	@staticmethod
	def parse_name(name):
		parsed_name = name.split(', ')[0]
		match = re.match(REG_NAME, parsed_name)
		if not match:
			return parsed_name, None
		return match.group(1), match.group(3)

	@staticmethod
	def get_spec_type(spec_type):
		parsed_spec_type = re.split(REG_TYPE, spec_type)
		stripped_types = map(lambda x: x.strip(), parsed_spec_type)
		return list(set(filter(None, stripped_types)))

	@staticmethod
	def get_treatment_type(treatment_type):
		return treatment_type.split(';')

	@staticmethod
	def get_full_name(name, dosage, spec_type):
		if dosage:
			name += ', ' + dosage
		if spec_type:
			spec_types = '/'.join(spec_type)
			name += ' (' + spec_types + ')'
		return name

	@staticmethod
	def get_spec_status(status):
		if status == '0':
			return 'R'
		elif status in ['1', '2', '4']:
			return 'G'
		return None
