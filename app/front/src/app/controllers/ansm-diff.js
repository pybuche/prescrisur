angular.module('prescrisurApp.controllers')

.controller("ANSMDiffController", [
	'$scope',
	'PageTitleService',
	'SpecialityService',
	'SubstanceService',

	function($scope, PageTitleService, SpecialityService, SubstanceService) {
		PageTitleService.setTitle('Différentiel ANSM');

		$scope.filterQuery = '';

		$scope.showSpecs = true;
		$scope.showSubsts = true;

		$scope.dateFrom = new Date();
		$scope.dateFrom.setDate($scope.dateFrom.getDate() - 7);

		SpecialityService.get(function(data) {
			$scope.specLoaded = true;
			$scope.specialities = data.data;
		});

		SubstanceService.get(function(data) {
			$scope.substLoaded = true;
			$scope.substances = data.data;
		});
	}
]);