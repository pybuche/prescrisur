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
		# Load every speciality once, in memory, instead of one DB read per composition line.
		spec_index = {}
		for doc in Speciality.collection.find():
			spec_index[doc['_id']] = Speciality(**doc)
		for line in lines:
			line = line.decode('ISO-8859-1').encode('UTF8').split('\t')
			if not line or len(line) < 4:
				continue
			subst_id = line[2]
			if subst_id not in substances:
				substances[subst_id] = self.create_substance(line)
			substances[subst_id].add_speciality_from_cis(line[0], spec_index)
		# One batched round-trip instead of one (or two) per substance.
		ops = [s.sort_specialities().upsert_op() for s in substances.values() if len(s.specialities) > 0]
		if ops:
			Substance.collection.bulk_write(ops, ordered=False)
		# Only now, once every current substance has been upserted, flag the ones that were not
		# refreshed during this run as deleted. An interruption before this point leaves the
		# catalogue fully visible (only stale) instead of empty.
		return Substance.flag_stale_as_deleted(run_start)

	@staticmethod
	def create_substance(line):
		return Substance(
			_id=line[2],
			name=line[3],
			status=None
		)
