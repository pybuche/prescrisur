angular.module('prescrisurApp.controllers')

.controller("MainController", [
	'$scope',
	'$state',
	'$rootScope',
	'PageTitleService',

	function($scope, $state, $rootScope, PageTitleService) {
		$scope.PageTitleService = PageTitleService;

		$scope.currentUser = null;

		$rootScope.setCurrentUser = function(user) {
			$scope.currentUser = user;
		};

		$scope.isAuthorized = function(role) {
			if($scope.currentUser && $scope.currentUser.roles.indexOf(role) > -1) {
				return true;
			}
			return false;
		};

		$scope.checkPageInfoState = function() {
			if($state.current.name == 'pages') {
				var pagesArray = ['pourquoi-prescrisur', 'presentation'];
				if (pagesArray.indexOf($state.params.id) != -1) {
					return true;
				}
			}
			return false;
		}
	}
])

.controller("ErrorController", [
	'$scope',
	'$state',
	'$stateParams',

	function($scope, $state, $stateParams) {
		$scope.code = $stateParams.code;

		setTimeout(function() { $state.go('home'); }, 2000);
	}
]);