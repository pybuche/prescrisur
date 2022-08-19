angular.module('prescrisurApp.controllers')

	.controller("TherapeuticClassController", [
		'$scope',
		'$state',
		'$stateParams',
		'Flash',
		'PageTitleService',
		'SearchService',
		'TherapeuticClassService',

		function($scope, $state, $stateParams, Flash, PageTitleService, SearchService, TherapeuticClassService) {
			$scope.therapeuticClass = null;
			
			TherapeuticClassService.get({id: $stateParams.id}, function(data) {
				$scope.therapeuticClass = data.data;
				PageTitleService.setTitle($scope.therapeuticClass.name + '| Classe Pharmaco-Thérapeutique');
			});

			$scope.delete = function() {
				if(confirm('Voulez-vous supprimer cette Classe ?')) {
					TherapeuticClassService.delete({ id: $stateParams.id }, function(data) {
						Flash.create('success', 'Classe Supprimée !');
						$state.go('home');
					});
				}
			};

			$scope.entryColspan = function(entry) {
				if(entry.info) {
					return 1;
				}
				return 2;
			};

			$scope.search = function($select) {
				var search = '';
				if($select) {
					search = $select.search;
				}
				$scope.results = searchMessage('Recherche en cours...');
				SearchService.get({q: search, searchType: 'classes'}, function(data) {
					$scope.results = data.data;
					if ($scope.results.length == 0) {
						$scope.results = searchMessage('Aucun résultat');
					}
				});
			};

			$scope.goTo = function($select) {
				$state.go('classes', {id: $select.selected._id});
			};

			var searchMessage = function(msg) {
				return [{
					_id: null,
					name: msg
				}];
			};
		}
	]);
