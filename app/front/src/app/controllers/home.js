angular.module('prescrisurApp.controllers')

.controller("HomeController", [
	'$scope',
	'$state',
	'$stateParams',
	'$timeout',
	'Flash',
	'PageTitleService',
	'SearchService',
	'PageService',
	'AuthService',
	'PathologyService',

	function($scope, $state, $stateParams, $timeout, Flash, PageTitleService, SearchService, PageService, AuthService, PathologyService) {
		PageTitleService.setTitle("Outil d'aide à la Prescription");
		$scope.q = $stateParams.search ? $stateParams.search : null;
		$scope.searchType = 'pathologies';
		$scope.results = [];

		PageService.get({id: 'bienvenue'}, function(data) {
			$scope.welcome = data.data;
		});

		PathologyService.get(function(data) {
			$scope.pathologies = data.data;
		});

		if($stateParams.confirm) {
			AuthService.confirmEmail($stateParams.token)
				.then(function(data) {
					Flash.create('success', 'Votre compte est confirmé ! Connexion en cours...');
					$state.go('home', {}, {reload: true});
				})
				.catch(function() {
					Flash.create('danger', 'Une erreur est survenue, merci de réessayer.');
				});
		} else if($stateParams.updateEmail) {
			AuthService.updateEmail($stateParams.token)
				.then(function(data) {
					Flash.create('success', 'Votre email a été mis à jour !');
				})
				.catch(function() {
					Flash.create('danger', 'Une erreur est survenue, merci de réessayer.');
				});
		}

		$scope.goTo = function($select) {
			var searchType = $scope.searchType;
			if(searchType == 'pathologies') {
				searchType += '.read';
			}
			$state.go(searchType, {id: $select.selected._id});
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
				} else {
				    $scope.results.sort(function (a,b) {return a["name"].localeCompare(b["name"]);});
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

		$timeout(function() {$('.ui-select-container input').after($('<img src="front/assets/img/search.png" id="input_img">'))}, 0)
	}
]);
