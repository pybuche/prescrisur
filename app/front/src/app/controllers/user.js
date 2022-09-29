angular.module('prescrisurApp.controllers')


.controller("UserController", [
	'$scope',
	'Flash',
	'AuthService',

	function($scope, Flash, AuthService) {
		$scope.$watch('currentUser', function(user) {
			$scope.me = {name: user.name, email: user.email};
		});

		$scope.checkPassword = function() {
			var password = $scope.me.newPasswd;
			var confirm = $scope.me.confirmNewPasswd;
			if (password != '' && password != confirm) {
				$scope.badConfirmPasswd = true;
				$scope.disabled = true;
			} else {
				$scope.badConfirmPasswd = false;
				$scope.disabled = false;
			}
			return !$scope.badConfirmPasswd;
		};

		$scope.submit = function() {
			$scope.error = false;
			$scope.disabled = true;

			AuthService.updateUser($scope.me)
				.then(function (data) {
					if(data.updated_mail) {
						Flash.create('info', "Un mail de confirmation vient d'être envoyé à "+ data.updated_mail +" pour valider le changement d'adresse email", 0);
					}
					Flash.create('success', 'Profil mis à jour !');
					$scope.disabled = false;
					$scope.currentUser = data.user;
				})
				.catch(function (error) {
					var msg = 'Une erreur est survenue...';
					if(error.bad_password) {
						msg = 'Le mot de passe est incorrect';
					}
					Flash.create('danger', msg, 10000);
					$scope.disabled = false;
				});
		};
	}
])


.controller("UserAdminController", [
	'$scope',
	'$state',
	'$stateParams',
	'Flash',
	'filterFilter',
	'PageTitleService',
	'UserService',
	'UserSubscriptionService',
	'UserNewsletterService',
	'UserDeleteService',

	function($scope, $state, $stateParams, Flash, filterFilter, PageTitleService, UserService, UserSubscriptionService, UserNewsletterService, UserDeleteService) {
		PageTitleService.setTitle('Administration des Utilisateurs');

    		var tri = $stateParams.order && $stateParams.order.split('@')[1] ? $stateParams.order.split('@')[0] : $stateParams.order;
		$scope.url = $stateParams.order && tri[2] == '-' ? $stateParams.order.split('@')[1]? "#/users/" + $stateParams.order.split('@')[0] : "#/users/" + $stateParams.order + "@true" : ($stateParams.order && $stateParams.order.split('@')[1] ) ?"#/users/" : "#/users/@true";
    		$scope.dontshow = $stateParams.order && $stateParams.order.split('@')[1] ? true : false;
		$scope.page = 0;
		var page = window.location.href.split('users/#');
		if (page.length > 1){
			$scope.page = page[1] - 1;
			$scope.page += 1;
		}
		$scope.users = [];
		$scope.confirmed = 0;
		$scope.thismonth = 0;
		$scope.newsletters = 0;
		$scope.total = 0;
		$scope.mult = 100000;
		$scope.devmod = false;
		if ($scope.page > 0){
			$scope.mult = 100;
			$scope.devmod = true;
		}

		$scope.page_update = function(number){
			number = parseInt(number);
			if ($scope.total > 0){
				if ((number - 1) * $scope.mult > $scope.total){
					return
				}

			}
			if (number < 0){
				return
			}
			$scope.page = number;
			window.location.href = "/#/users/#" + number;
			
			$scope.users = [];
			UserService.get({skip: ($scope.page * $scope.mult), limit: $scope.mult}, function(data) {
			  	var date = new Date();
	      			var limite = new Date(date.getFullYear(), date.getMonth(), 1).getTime()/1000;
				$scope.users = data.data["users"];
				$scope.confirmed = data.data["stats"]["confirmed"];
				$scope.thismonth = data.data["stats"]["month"];
				$scope.newsletters = data.data["stats"]["newsletter"];
				$scope.total = data.data["stats"]["total"];
			});
		}
		
		$scope.devmod_switch = function(){
			$scope.devmod = !$scope.devmod;
			if ($scope.devmod){
				$scope.mult = 100;
				$scope.page_update($scope.page);
			}
			else
			{
				$scope.mult = 100000;
				$scope.page_update(0);
			}
			
		}
		
		$scope.page_update($scope.page);

		$scope.hasRole = function(role, userRoles) {
			return userRoles.indexOf(role) > -1;
		};

		$scope.subscribe = function(user, subscribe) {
			var afterSave = function(msg) {
				return function() {
					Flash.create('success', msg);
					$state.go('users', {}, {reload: true});
				}
			};

			var afterError = function() {
				Flash.create('danger', 'Une erreur est survenue...', 10000);
			};

			if (subscribe) {
				UserSubscriptionService.subscribe({ id: user._id }, {}, afterSave(user.name + ' abonné premium !'), afterError);
			} else {
				UserSubscriptionService.unsubscribe({ id: user._id }, afterSave(user.name + ' désabonné premium !'), afterError);
			}
		}


		$scope.newsletter = function(user, subscribe) {
			var afterSave = function(msg) {
				return function() {
					Flash.create('success', msg);
					$state.go('users', {}, {reload: true});
				}
			};

			var afterError = function() {
				Flash.create('danger', 'Une erreur est survenue...', 10000);
			};

			if (subscribe) {
				UserNewsletterService.subscribe({ id: user._id }, {}, afterSave(user.name + ' abonné à la newsletter !'), afterError);
			} else {
				UserNewsletterService.unsubscribe({ id: user._id }, afterSave(user.name + ' désabonné de la newsletter !'), afterError);
			}
		}
		
		$scope.delete = function(user) {
			var afterSave = function(msg) {
				return function() {
					Flash.create('success', msg);
					$state.go('users', {}, {reload: true});
				}
			};

			var afterError = function() {
				Flash.create('danger', 'Une erreur est survenue...', 10000);
			};

			UserDeleteService.delete({ id: user._id }, {}, afterSave(user.name + ' supprimé'), afterError);
		}
	}
]);
