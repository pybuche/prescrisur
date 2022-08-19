angular.module('prescrisurApp.controllers')

.controller("NewsLetterController", [
	'$scope',
	'$state',
	'Flash',
	'UserService',
	'UserNewsletterService',

	function($scope, $state, Flash, UserService, UserNewsletterService) {

		$scope.$watch('currentUser', function(user) {
			if (user === null)
				$scope.me = {name: 'anonymous', roles: []}
			else
			{
				$scope.me = {_id: user._id, name: user.name, email: user.email, roles: user.roles};
			}
		});

		$scope.isAnonymous = function() {
			return $scope.me.name == 'anonymous'
		}

		$scope.hasRole = function(role, userRoles) {
			return userRoles.indexOf(role) > -1;
		};

		$scope.newsletter = function(me, subscribe) {
			var afterSave = function(msg) {
				return function() {
					Flash.create('success', 'OK');
					$state.reload();
				}
			};

			var afterError = function() {
				Flash.create('danger', 'Une erreur est survenue...', 10000);
			};
			
			if (subscribe) {
				UserNewsletterService.subscribe({ id: me._id }, {}, afterSave(me.name + ' abonné à la newsletter !'), afterError);
			} else {
				UserNewsletterService.unsubscribe({ id: me._id }, afterSave(me.name + ' désabonné de la newsletter !'), afterError);
			}
		}

	}
])

