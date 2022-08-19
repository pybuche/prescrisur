angular.module('prescrisurApp.controllers')

.controller("PageController", [
	'$scope',
	'$window',
	'$location',
	'$state',
	'$stateParams',
	'$timeout',
	'Flash',
	'PageTitleService',
	'PageService',

	function($scope, $window, $location, $state, $stateParams, $timeout, Flash, PageTitleService, PageService) {
		$scope.page = null;

		// Highlight element if anchor is given
		var hash = $location.hash();
		var textLoaded = false;
		if(hash) {
			$scope.$watch(
				function () { return angular.element('#'+hash); },
				function (newValue, oldValue) {
					if(newValue.length && !textLoaded) {
						newValue.addClass('highlighted');
						textLoaded = true;
					}
				}
			);
		}


		if ($stateParams.id) {
			PageService.get({ id: $stateParams.id }, function(data) {
				$scope.page = data.data;
				PageTitleService.setTitle($scope.page.name);
			}, function() {
				Flash.create('danger', "Cette Page n'existe pas ! Redirection...", 1500);
				$timeout(function() {
					$state.go('home');
				}, 1500);
			});
		} else {
			PageService.get(function(data) {
				$scope.pages = data.data;
				PageTitleService.setTitle('Administration des Pages');
			});
		}

		$scope.print = function() {
			showAllTexts(true);
			$timeout(function() {
				onPrintFinished($window.print());
			}, 100);
		};

		var showAllTexts = function(value) {
			$scope.pages.forEach(function(p) {
				p.showText = value;
			});
		};

		var onPrintFinished = function(printed) {
			showAllTexts(false);
		}
	}
])

.controller("PageEditController", [
	'$scope',
	'$state',
	'$stateParams',
	'Flash',
	'PageTitleService',
	'ConfirmQuitService',
	'PageService',

	function($scope, $state, $stateParams, Flash, PageTitleService, ConfirmQuitService, PageService) {
		PageTitleService.setTitle('Nouvelle Page');
		ConfirmQuitService.init($scope);

		if($stateParams.id) {
			PageService.get({ id: $stateParams.id }, function(data) {
				$scope.page = data.data;
				PageTitleService.setTitle('Modifier une Page');
			});
		}

		$scope.submit = function () {
			var afterSave = function(msg) {
				return function (data) {
					var savedPage = data.data;
					Flash.create('success', msg);
					$state.go('pages.read', {id: savedPage._id});
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
				if ($stateParams.id) {
					PageService.update({id: $stateParams.id}, $scope.page, afterSave('Page mise à jour !'), afterError);
				} else {
					PageService.save($scope.page, afterSave('Page créée !'), afterError);
				}
			}
			//console.log($scope.page);
		};
	}
]);