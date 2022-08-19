angular.module('prescrisurApp.controllers')

.controller("PathologyEditController", [
	'$scope',
	'$state',
	'$stateParams',
	'Flash',
	'PageTitleService',
	'ConfirmQuitService',
	'SearchService',
	'PathologyService',
	'PathologyDraftService',

	function($scope, $state, $stateParams, Flash, PageTitleService, ConfirmQuitService, SearchService, PathologyService, PathologyDraftService) {
		PageTitleService.setTitle('Nouvelle Pathologie');
		ConfirmQuitService.init($scope);

		$scope.results = [];
		$scope.recommandations = ['none', 'alert', 'middle', 'ok'];
		$scope.productTypes = [
			{_id: 'specialities', name: 'Specialité'},
			{_id: 'substances', name: 'Substance'},
			{_id: 'associations', name: 'Association'}
		];

		var getPathology = function(pathoService) {
			pathoService.get({ id: $stateParams.id }, function(data) {
				$scope.pathology = data.data;
				$scope.pathology.remarque = $scope.pathology.conclu.split("QWERTY")[1];
				$scope.pathology.conclu= $scope.pathology.conclu.split("QWERTY")[0];
				$scope.displayAllInfo = true;
				PageTitleService.setTitle('Modifier une Pathologie');
			});
		};

		var pathoService = PathologyService;
		if($stateParams.draft) {
			pathoService = PathologyDraftService;
		}



		if($stateParams.id) {
			PathologyDraftService.hasDraft({ id: $stateParams.id }, function(data) {
				if(data.exists) {
					pathoService = PathologyDraftService;
				}
				getPathology(pathoService);
			});
		}
		else {
			$scope.pathology = {
				name: null,
				conclu: '<p><strong>Pour en savoir plus :</strong></p>',
				levels: [
					{rank: '', depth: 1}
				]
			};
		}

		$scope.filterResults = function(r) {
			var res = {name: r.name, _id: r._id, status: r.status};
			if(r.specialities) {
				res.specialities = r.specialities;
			}
			return res;
		};

		$scope.search = function($select, searchType, force) {
			var search = '';
			if($select) {
				search = $select.search;
			}

			var payload = {q: search, searchType: searchType};
			if (searchType == 'substances') {
				payload.specialities = true;
			}

			$scope.results = searchMessage('Recherche en cours...');
			if(force || search.length > 0) {
				SearchService.get(payload, function(data) {
					$scope.results = data.data;
					if ($scope.results.length == 0) {
						$scope.results = searchMessage('Aucun résultat');
					}
				});
			}
		};

		$scope.displaySpecialities = function(specialities) {
			if(!specialities[0].hasOwnProperty('enabled')) {
				$scope.checkAllSpecialities(specialities);
			}
		};

		$scope.checkAllSpecialities = function(specialities, checkValue) {
			checkValue = (checkValue != undefined) ? checkValue : true;
			specialities.forEach(function(spec) {
				spec.enabled = checkValue;
			});
		};

		$scope.checkChildren = function(level) {
			if(!level.hasOwnProperty('levels')) {
				return;
			}
			level.levels.forEach(function(l) {
				l.is_class = level.is_class;
				$scope.checkChildren(l);
			});
		};

		var findLevel = function(data, $index) {
			var levelName = getRank(data.rank, $index);
			var splitLevel = levelName.split('.');
			splitLevel = splitLevel.slice(0, -1);
			splitLevel.pop();
			var levelToGo = $scope.pathology.levels;
			splitLevel.forEach(function(i) {
				levelToGo = levelToGo[i-1].levels;
			});
			return levelToGo;
		};

		var changeRank = function(data, newIndex) {
			if(data.hasOwnProperty('levels')) {
				data.levels.forEach(function(l, levelIndex) {
					l.rank = data.rank + (newIndex + 1) + '.';
					changeRank(l, levelIndex);
				});
			}
		};

		$scope.goUp = function(data, $index) {
			var levelToGo = findLevel(data, $index);
			levelToGo[$index] = levelToGo[$index - 1];
			levelToGo[$index - 1] = data;
			changeRank(data, $index - 1);
			changeRank(levelToGo[$index], $index);
		};

		$scope.goDown = function(data, $index) {
			var levelToGo = findLevel(data, $index);
			levelToGo[$index] = levelToGo[$index + 1];
			levelToGo[$index + 1] = data;
			changeRank(data, $index + 1);
			changeRank(levelToGo[$index], $index);
		};

		$scope.removeLevel= function(data, $index) {
			if(confirm('Voulez-vous supprimer ce niveau ?')) {
				var levelName = getRank(data.rank, $index);
				var splitLevel = levelName.split('.');
				splitLevel = splitLevel.slice(0, -1);
				var toDel = splitLevel.pop() - 1;
				var levelToGo = $scope.pathology.levels;
				var supLevelToGo = $scope.pathology;
				splitLevel.forEach(function(i) {
					supLevelToGo = levelToGo[i-1];
					levelToGo = supLevelToGo.levels;
				});
				if(levelToGo.length == 1) {
					delete supLevelToGo.levels;
					return;
				}
				levelToGo.splice(toDel, 1);
			}
		};

		$scope.removeEntry = function(level, $index) {
			if(level.entries.length == 1) {
				delete level.entries;
				return;
			}
			level.entries.splice($index, 1);
		};

		$scope.addSubLevel = function(data, $index) {
			var rank = getRank(data.rank, $index);
			var depth = data.depth + 1;
			if(data.entries) {
				delete data.entries;
			}
			if(!data.levels) {
				data.levels = [];
			}
			data.levels.push({rank: rank, depth: depth});
		};

		$scope.addEntry = function(data) {
			if(!data.entries) {
				data.entries = [];
			}
			data.entries.push({reco: {_id: 'none'}, type: 'substances'});
		};

		$scope.addRootLevel = function() {
			$scope.pathology.levels.push({rank: '', depth: 1});
		};

		$scope.setStatus = function(product) {
			if(!product.status) {
				product.status = 'G';
			} else {
				product.status = null;
			}
		};

		$scope.submit = function() {
			var afterSave = function(msg) {
				return function(data) {
					var savedPatho = data.data;
					Flash.create('success', msg);
					$state.go('pathologies.read', {id: savedPatho._id, draft: true});
				}
			};

			var afterError = function() {
				$scope.disabled = false;
				Flash.create('danger', 'Une erreur est survenue...', 10000);
				ConfirmQuitService.init($scope);
			};

			if(confirm('Enregistrer les modifications ?')) {
				$scope.disabled = true;
				ConfirmQuitService.destroy();
				$scope.pathology.conclu = $scope.pathology.conclu + "QWERTY" + $scope.pathology.remarque;
				console.log($scope.pathology);
				if($stateParams.id) {
					PathologyDraftService.update({ id: $stateParams.id }, $scope.pathology, afterSave('Pathologie mise à jour !'), afterError);
				} else {
					PathologyDraftService.save($scope.pathology, afterSave('Pathologie créée !'), afterError);
				}
			}
		     console.log($scope.pathology);
		};

		var getRank = function(parentRank, $index) {
			return parentRank + ($index + 1) + '.';
		};

		var searchMessage = function(msg) {
			return [{
				_id: null,
				name: msg
			}];
		};

		// Function to display or not action buttons
		$scope.canAddRootLevel = function(data, $index) {
			return data.depth == 1 && $index == 0;
		};

		$scope.canAddSubLevel = function(data) {
			return data.depth < 4 && (!data.hasOwnProperty('entries') || data.entries.length == 0);
		};

		$scope.canAddEntry = function(data) {
			return !data.levels || data.levels.length == 0;
		};

		$scope.canRemoveLevel = function(data) {
			if(data.depth == 1) {
				return $scope.pathology.levels.length > 1;
			}
			return !data.levels;
		};

		$scope.isSubstance = function(entry) {
			return entry.type == 'substances' && entry.hasOwnProperty('product') && entry.product._id && entry.product._id != '';
		};

		$scope.isSubstanceOrAsso = function(entry) {
			return (entry.type == 'substances' || entry.type == 'associations') && entry.hasOwnProperty('product') && entry.product._id && entry.product._id != '';
		};

		$scope.showInfo = function(entry) {
			return entry.displayInfo || ($scope.displayAllInfo && entry.info);
		};
	}
]);
