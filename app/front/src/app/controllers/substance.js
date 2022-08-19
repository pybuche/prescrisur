angular.module('prescrisurApp.controllers')

.controller("SubstanceController", [
	'$scope',
	'$state',
	'$stateParams',
	'$timeout',
	'Flash',
	'PageTitleService',
	'SearchService',
	'SubstanceService',
	'PathologySubstanceService',

	function($scope, $state, $stateParams, $timeout, Flash, PageTitleService, SearchService, SubstanceService, PathologySubstanceService) {
		$scope.substance = null;
		$scope.pathologies = [];

		SubstanceService.get({ id: $stateParams.id }, function(data) {
			$scope.substance = data.data;
			PageTitleService.setTitle($scope.substance.name + ' | Substance');
		}, function() {
			Flash.create('danger', "Cette Substance n'existe pas ! Redirection...", 1500);
			$timeout(function() {
				$state.go('home');
			}, 1500);
		});

		PathologySubstanceService.get({ id: $stateParams.id }, function(data) {
			$scope.pathologies = data.data;
		});

		$scope.search = function($select) {
			var search = '';
			if($select) {
				search = $select.search;
			}
			$scope.results = searchMessage('Recherche en cours...');
			SearchService.get({q: search, searchType: 'substances'}, function(data) {
				$scope.results = data.data;
				if ($scope.results.length == 0) {
					$scope.results = searchMessage('Aucun résultat');
				}
			});
		};

		$scope.goTo = function($select) {
			$state.go('substances', {id: $select.selected._id});
		};

		var searchMessage = function(msg) {
			return [{
				_id: null,
				name: msg
			}];
		};
	}
]);
