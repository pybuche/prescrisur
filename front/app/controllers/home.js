angular.module('prescrisurApp.controllers')

.controller("HomeController", [
	'$scope',
	'$state',
	'SearchService',
	'NewsService',
	'PathologyService',

	function($scope, $state, SearchService, NewsService, PathologyService) {
		$scope.q = null;
		$scope.searchType = 'pathologies';
		$scope.results = [];

		NewsService.get(function(data) {
			$scope.news = data.data;
		});
		
		PathologyService.get(function(data) {
			$scope.pathologies = data.data;
		});
		
		$scope.goTo = function($select) {
			$state.go($scope.searchType, {id: $select.selected._id})
		};

		$scope.search = function($select) {
			var search = '';
			if($select) {
				search = $select.search;
			}
			$scope.results = searchMessage('Recherche en cours...');
			SearchService.get({q: search, searchType: $scope.searchType}, function(data) {
				$scope.results = data.data;
				if ($scope.results.length == 0) {
					$scope.results = searchMessage('Aucun résultat');
				}
			});
		};

		$scope.$watch('searchType', function(newValue, oldValue) {
			if(newValue == oldValue) { return; }
			$scope.results = [];
			$scope.search();
		});

		var searchMessage = function(msg) {
			return [{
				_id: null,
				name: msg
			}];
		};
	}
]);