# -*- coding: utf-8 -*-
import re
import urllib2
import requests

from models import Speciality

SPECIALITIES_URI = 'https://base-donnees-publique.medicaments.gouv.fr/download/file/CIS_bdpm.txt'
SPEC_STATUS_URI = 'https://base-donnees-publique.medicaments.gouv.fr/download/file/CIS_GENER_bdpm.txt'
REG_NAME = r"([a-zA-Z0-9.()'\"\-\/ ]+)(\s([0-9,.\/-]+(\s[0-9])?\s?(bar|G|M|m|µ|n|g|I|%|U|u|POUR|pour|microgramme|gramme).*))"
REG_TYPE = r" et\s?"


class SpecialityUpdater(object):

	def execute(self):
		# Flag every speciality as deleted to update others and flag the non-updated as deleted in the end
		Speciality.flag_all_as_deleted()
		# Then read the update file
		req = requests.get(SPECIALITIES_URI, stream=True)
		for line in req.iter_lines():
			line = line.decode('ISO-8859-1').encode('UTF8').split('\t')
			if not line or len(line) < 5 or not self.is_valid(line[4], line[6]):
				continue
			spec, saved_spec = self.update_one(line)
			if saved_spec.upserted_id:
				spec.save(new=True)
		return self.update_spec_status()

	def update_spec_status(self):
		req = urllib2.urlopen(SPEC_STATUS_URI)
		bulk = Speciality.collection.initialize_ordered_bulk_op()
		for line in req.readlines():
			line = line.decode('ISO-8859-1').encode('UTF8').split('\t')
			spec_status = self.get_spec_status(line[3])
			if spec_status:
				bulk.find({'_id': line[2]}).update({'$set': {'status': spec_status}})
		return bulk.execute()

	def update_one(self, line):
		name, dosage = self.parse_name(line[1])
		spec_type = self.get_spec_type(line[2])
		treatment_type = self.get_treatment_type(line[3])
		full_name = self.get_full_name(name, dosage, spec_type)
		spec = Speciality(
			_id=line[0],
			short_name=name,
			name=full_name,
			dosage=dosage,
			spec_type=spec_type,
			treatment_type=treatment_type,
			status=None
		)
		return spec, spec.save()

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
