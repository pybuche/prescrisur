# coding=utf-8
import datetime

from models import Substance, Speciality
from .utils import fetch_lines

SUBSTANCE_URI = 'https://base-donnees-publique.medicaments.gouv.fr/download/file/CIS_COMPO_bdpm.txt'


# TODO: Return better KPIs
class SubstanceUpdater(object):

	def execute(self):
		# Non-streaming entry point: drive the progress generator to completion.
		for _ in self.run():
			pass

	def run(self):
		# Generator yielding human-readable progress lines, so the caller can stream them.
		substances = {}
		# Record the run start, then fetch & validate the update file BEFORE touching the DB:
		# a bad/empty response raises here so nothing is upserted and nothing is flagged deleted.
		run_start = datetime.datetime.now().isoformat()
		yield 'Substances: downloading source file...\n'
		lines = fetch_lines(SUBSTANCE_URI)
		# Load every speciality once, in memory, instead of one DB read per composition line.
		yield 'Substances: indexing specialities...\n'
		spec_index = {}
		for doc in Speciality.collection.find():
			spec_index[doc['_id']] = Speciality(**doc)
		yield 'Substances: %d lines fetched, %d specialities indexed, parsing...\n' % (len(lines), len(spec_index))
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
		yield 'Substances: upserting %d entries...\n' % len(ops)
		if ops:
			res = Substance.collection.bulk_write(ops, ordered=False)
			yield 'Substances: %d inserted, %d updated\n' % (res.upserted_count, res.modified_count)
		# Only now, once every current substance has been upserted, flag the ones that were not
		# refreshed during this run as deleted. An interruption before this point leaves the
		# catalogue fully visible (only stale) instead of empty.
		removed = Substance.flag_stale_as_deleted(run_start)
		yield 'Substances: done (%d flagged as removed)\n' % removed.modified_count

	@staticmethod
	def create_substance(line):
		return Substance(
			_id=line[2],
			name=line[3],
			status=None
		)
