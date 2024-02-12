# coding=utf-8
from .pathology import Pathology


class PathologyDraft(Pathology):
	def duplicate_as_first_intention(self):
		fist_intention_levels = [decrement_level(level) for level in self.levels[0]["levels"]]
		return PathologyDraft(
			name=self.name + " (1ere intention)",
			levels=fist_intention_levels,
		)


def decrement_level(level):
	level['depth'] = level['depth'] - 1
	level['rank'] = level['rank'][2:]
	if 'levels' in level:
		level['levels'] = map(lambda l: decrement_level(l), level['levels'])
	return level

