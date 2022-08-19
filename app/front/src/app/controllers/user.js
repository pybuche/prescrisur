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
	
	function($scope, $state, $stateParams, Flash, filterFilter, PageTitleService, UserService, UserSubscriptionService, UserNewsletterService) {
		PageTitleService.setTitle('Administration des Utilisateurs');
		
            var tri = $stateParams.order && $stateParams.order.split('@')[1] ? $stateParams.order.split('@')[0] : $stateParams.order;
		    $scope.url = $stateParams.order && tri[2] == '-' ? $stateParams.order.split('@')[1]? "#/users/" + $stateParams.order.split('@')[0] : "#/users/" + $stateParams.order + "@true" : ($stateParams.order && $stateParams.order.split('@')[1] ) ?"#/users/" : "#/users/@true";
            $scope.dontshow = $stateParams.order && $stateParams.order.split('@')[1] ? true : false;
            
		UserService.get(function(data) {
		    var date = new Date();
            var limite = new Date(date.getFullYear(), date.getMonth(), 1).getTime()/1000;
            $scope.selected = "Mois";
		    if($stateParams.order && tri[2] != '-')
		    {$scope.order = tri;
		    }
		    else{
		        $scope.order = "-timestamp";
		        if ($stateParams.order && tri[2] == '-'){
		            var ref = new Date(tri);
		            $scope.limit_d = ref.getTime()/1000;
		            $scope.limit_u = new Date(ref.getFullYear(), ref.getMonth() + 1, 1).getTime()/1000;
		            limite =  $scope.limit_u;
		            var number = parseInt(tri.split('-')[0]) - 1;
		            var months = ['janvier', 'fevrier', 'mars', 'avril', 'mai', 'juin', 'juillet', 'aout', 'septembre', 'octobre', 'novembre', 'décembre'];
		            $scope.selected = months[number] + ' ' + tri.split('-')[2]; 
		        }
		    }
			$scope.users = data.data;
			$scope.subscribers = filterFilter(data.data, { roles: 'subscriber' });
			$scope.lastmonthnews = 0;
			$scope.lastmonth = 0;
			var news = filterFilter(data.data, { roles: 'newsletter' });
			$scope.totalnews = news.length;
			if ($scope.limit_d && $scope.limit_u){
			    for (var i3 = 0; i3 < news.length; i3++) {
			        if(news[i3].timestamp >= $scope.limit_d && news[i3].timestamp < $scope.limit_u){
                      $scope.lastmonthnews += 1;
			        }
                }
                for (var i4 = 0; i4 < $scope.users.length; i4++) {
			        if($scope.users[i4].timestamp >= $scope.limit_d && $scope.users[i4].timestamp < $scope.limit_u){
                        $scope.lastmonth += 1;
			        }
                }
			}else{
			    for (var i2 = 0; i2 < news.length; i2++) {
			        if(news[i2].timestamp >= limite){
                      $scope.lastmonthnews += 1;
			        }
                }
                for (var i = 0; i < $scope.users.length; i++) {
			        if($scope.users[i].timestamp >= limite){
                        $scope.lastmonth += 1;
			        }
                }
			}
		});

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
	}
]);
