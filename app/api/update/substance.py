# coding=utf-8
import requests

from models import Substance

SUBSTANCE_URI = 'http://base-donnees-publique.medicaments.gouv.fr/telechargement.php?fichier=CIS_COMPO_bdpm.txt'


# TODO: Return better KPIs
class SubstanceUpdater(object):

	def execute(self):
		substances = {}
		# Flag every substance as deleted to update others and flag the non-updated as deleted in the end
		Substance.flag_all_as_deleted()
		# Then read the update file
		req = requests.get(SUBSTANCE_URI, stream=True)
		for line in req.iter_lines():
			line = line.decode('ISO-8859-1').encode('UTF8').split('\t')
			if not line or len(line) < 4:
				continue
			subst_id = line[2]
			if subst_id not in substances:
				substances[subst_id] = self.create_substance(line)
			substances[subst_id].add_speciality_from_cis(line[0])
		map(lambda x: self.save_if_has_specialities(substances[x]), substances)

	@staticmethod
	def save_if_has_specialities(subst):
		if len(subst.specialities) > 0:
			saved_subst = subst.sort_specialities().save()
			if saved_subst.upserted_id:
				subst.save(new=True)
		return False

	@staticmethod
	def create_substance(line):
		return Substance(
			_id=line[2],
			name=line[3],
			status=None
		)
