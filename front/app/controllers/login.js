angular.module('prescrisurApp.controllers')

.controller("LoginController", [
	'$scope',
	'$location',
	'Auth',

	function($scope, $location, Auth) {

		$scope.login = function () {
			// initial values
			$scope.error = false;
			$scope.disabled = true;

			// call login from service
			Auth.login($scope.loginForm.email, $scope.loginForm.passwd)
				// handle success
				.then(function (user) {
					$location.path('/');
					$scope.disabled = false;
					$scope.loginForm = {};
				})
				// handle error
				.catch(function () {
					$scope.error = true;
					$scope.errorMessage = "Invalid username and/or password";
					$scope.disabled = false;
					$scope.loginForm = {};
				});
		};
	}
])

.controller("LogoutController", [
	'$scope',
	'$location',
	'Auth',

	function($scope, $location, Auth) {
		Auth.logout().then(function () {
			$location.path('/');
		});
	}
]);