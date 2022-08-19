angular.module('prescrisurApp.filters', [])

.filter('gradify', ['$state', '$sce', 'Slug',
	function($state, $sce, Slug) {
		return function(input) {
			// Grade A/B/C + Accord d'experts
			var regxABC = /(Grade (?:A|B|C|D)|(?:\s|\()AE|Accords d'experts)/gi;
			var matches = regxABC.exec(input);

			var labels = {
				"grade-a": "Preuve scientifique établie",
				"grade-b": "Présomption scientifique",
				"grade-c": "Faible niveau de preuve scientifique",
				"accords-d-experts": "Approbation, en l’absence de données scientifiques disponibles, d’au moins 80 % des membres du groupe de travail"
			};

			if (matches) {
				var match = Slug.slugify(matches[1].toLowerCase());
				var tooltip = labels[match];
				var link = "pages.read({id: 'presentation', '#': '" + match + "'})";
				input = input.replace(regxABC, '<a uib-tooltip="'+tooltip+'" id="'+match+'" class="grade" ui-sref="'+link+'">$1</a>');
			}

			// Grade D/X..
			var regxX = /(Grade (?:D|X[a-z0-9]{2}))/gi;
			input = input.replace(regxX, '<a class="grade">[$1]</a>');

			return $sce.trustAsHtml(input);
		};
	}
])

.filter("dateFromFilter", function() {
	return function(items, attr, from) {
		if(!items) return [];

		var df = from;
		var result = [];
		for (var i=0; i<items.length; i++){
			var tf = new Date(items[i][attr]);
			if (tf > df)  {
				result.push(items[i]);
			}
		}
		return result;
	};
});