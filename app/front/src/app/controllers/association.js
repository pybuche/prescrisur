angular.module('prescrisurApp.controllers')

.controller("AssociationController", [
	'$scope',
	'$state',
	'$stateParams',
	'Flash',
	'PageTitleService',
	'AssociationService',
	'SearchService',

	function($scope, $state, $stateParams, Flash, PageTitleService, AssociationService, SearchService) {
		PageTitleService.setTitle('Associations de Substances');

		$scope.association = {name: null, substances: []};
		$scope.editMode = false;

		AssociationService.get(function(data) {
			$scope.associations = data.data;
		});

		$scope.delete = function(assoID) {
			AssociationService.delete({id: assoID}, function(data) {
				if (data.success) {
					Flash.create('success', 'Association Supprimée !');
					$state.go('associations', {}, {reload: true})
				}
			});
		};

		$scope.edit = function(asso) {
			$scope.editMode = true;
			delete asso.specialities;
			$scope.association = asso;
		};
		
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

		$scope.addSubstance = function($select) {
			if($scope.association.substances.indexOf($select.selected) == -1) {
				return $scope.association.substances.push($select.selected);
			}
		};
		
		$scope.removeSubstance = function($index) {
			$scope.association.substances.splice($index, 1);
		};

		$scope.submit = function () {
			$scope.disabled = true;
			
			var afterSave = function (msg) {
				return function() {
					$scope.disabled = false;
					Flash.create('success', msg);
					$state.go('associations', {}, {reload: true})
				}
			};
			if($scope.editMode) {
				AssociationService.update({ id: $scope.association._id }, $scope.association, afterSave('Association Modifiée !'));
			} else {
				AssociationService.save($scope.association, afterSave('Association Créée !'), function(data) {
					var msg = 'Une erreur est survenue !';
					if(data.data.already_exist) {
						msg = 'Une association porte déjà ce nom !';
					}
					Flash.create('danger', msg, 10000);
					$scope.disabled = false;
				});
			}
			// console.log($scope.association);
		};
		
		$scope.cancel = function () {
			$scope.association = {name: null, substances: []};
			$scope.editMode = false;
		};

		var searchMessage = function(msg) {
			return [{
				_id: null,
				name: msg
			}];
		};
	}
]);
