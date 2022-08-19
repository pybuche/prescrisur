angular.module('prescrisurApp.controllers')

.controller("PathologyAdminController", [
	'$scope',
	'$state',
	'Flash',
	'PathologyService',
	'PathologyDraftService',

	function($scope, $state, Flash, PathologyService, PathologyDraftService) {
		PathologyDraftService.get(function(data) {
			$scope.drafts = data.data;
		});

		PathologyService.get(function(data) {
			$scope.pathologies = data.data;
			$scope.pathology.conclu= $scope.pathology.conclu.split("QWERTY")[0]
		});

		$scope.validate = function(pathoID) {
			if(confirm('Voulez-vous passer cette Pathologie en mode public ?')) {
				PathologyService.validate({ id: pathoID }, function() {
					Flash.create('success', 'Pathologie validée !');
					$state.go('pathologies', {}, {reload: true});
				}, function() {
					Flash.create('danger', 'Un problème est survenu...');
				});
			}
		};

		$scope.unvalidate = function(pathoID) {
			if(confirm('Voulez-vous invalider cette Pathologie ?')) {
				PathologyService.unvalidate({ id: pathoID }, function() {
					Flash.create('success', 'Pathologie invalidée !');
					$state.go('pathologies', {}, {reload: true});
				}, function() {
					Flash.create('danger', 'Un problème est survenu...');
				});
			}
		}

		$scope.delete = function(id_patho, draft) {
			if (draft == true && confirm('Voulez-vous supprimer ce brouillon de Pathologie ?')) {
				PathologyDraftService.delete({ id: id_patho }, function(data) {
					Flash.create('success', 'Brouillon de Pathologie Supprimée !');
					$state.reload();
				});
			}
			else if(confirm('Voulez-vous supprimer cette Pathologie ?') && draft == false) {
				PathologyService.delete({ id: id_patho }, function(data) {
					Flash.create('success', 'Pathologie Supprimée !');
					$state.reload();
				});
			}
		};
	}
]);