# coding=utf-8
import datetime

from models import Substance
from .utils import fetch_lines

SUBSTANCE_URI = 'https://base-donnees-publique.medicaments.gouv.fr/download/file/CIS_COMPO_bdpm.txt'


# TODO: Return better KPIs
class SubstanceUpdater(object):

	def execute(self):
		substances = {}
		# Record the run start, then fetch & validate the update file BEFORE touching the DB:
		# a bad/empty response raises here so nothing is upserted and nothing is flagged deleted.
		run_start = datetime.datetime.now().isoformat()
		lines = fetch_lines(SUBSTANCE_URI)
		for line in lines:
			line = line.decode('ISO-8859-1').encode('UTF8').split('\t')
			if not line or len(line) < 4:
				continue
			subst_id = line[2]
			if subst_id not in substances:
				substances[subst_id] = self.create_substance(line)
			substances[subst_id].add_speciality_from_cis(line[0])
		map(lambda x: self.save_if_has_specialities(substances[x]), substances)
		# Only now, once every current substance has been upserted, flag the ones that were not
		# refreshed during this run as deleted. An interruption before this point leaves the
		# catalogue fully visible (only stale) instead of empty.
		return Substance.flag_stale_as_deleted(run_start)

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
