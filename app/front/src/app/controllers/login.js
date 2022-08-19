angular.module('prescrisurApp.controllers')

.controller("LogoutController", [
	'$state',
	'Flash',
	'AuthService',

	function($state, Flash, AuthService) {
		AuthService.logout().then(function () {
			Flash.create('success', 'Déconnecté !');
			$state.go('home', {}, {reload: true});
		});
	}
])


.controller("LoginController", [
	'$scope',
	'$state',
	'$stateParams',
	'Flash',
	'PageTitleService',
	'AuthService',

	function($scope, $state, $stateParams, Flash, PageTitleService, AuthService) {
		PageTitleService.setTitle('Connexion');

		$scope.loginForm = {remember: true};

		if($stateParams.needLogin) {
			Flash.create('danger', 'Vous devez vous connecter pour accéder à cette page !', 10000);
		}

		if($scope.currentUser) {
			Flash.create('danger', 'Vous êtes déjà connecté avec '+ $scope.currentUser.name +' ! Redirection...');
			setTimeout(function() { $state.go('home'); }, 1500);
		}
		
		$scope.sendConfirmation = function() {
			AuthService.sendConfirmEmail($scope.loginForm.email)
				.then(function() {
					var msg = 'Un mail vient de vous êtes envoyé. Confirmez votre adresse email : '+ $scope.loginForm.email +', puis <a ui-sref="login">Connectez-vous</a>';
					Flash.create('success', msg, 0);
					$scope.confirmAgain = false;
				})
				.catch(function() {
					Flash.create('danger', 'Problème dans l\'envoi de la confirmation...', 10000);
					$scope.confirmAgain = true;
				});
		};

		$scope.login = function () {
			// initial values
			$scope.error = false;
			$scope.disabled = true;

			// call login from service
			AuthService.login($scope.loginForm)
				// handle success
				.then(function (user) {
					Flash.create('success', 'Connecté !');
					$state.go('home');
				})
				// handle error
				.catch(function (error) {
					var msg = 'Echec de la connexion. Réessayez.';
					if(error.error) {
						msg = error.error;
					} else if (error.no_user) {
						msg = 'Aucun utilisateur ne correspond à cette adresse mail !';
					} else if (error.bad_password) {
						msg = 'Mauvais login/mot de passe !';
					} else if (error.not_confirmed) {
						msg = 'Votre compte n\'a pas été confirmé !';
						$scope.confirmAgain = true;
					}
					Flash.create('danger', msg, 10000);
					$scope.disabled = false;
				});
		};
	}
])
	

.controller("ResetPasswordController", [
	'$scope',
	'$state',
	'$stateParams',
	'$timeout',
	'Flash',
	'AuthService',

	function($scope, $state, $stateParams, $timeout, Flash, AuthService) {
		$scope.resetForm = {};
		
		if($stateParams.token) {
			AuthService.checkResetPassword($stateParams.token)
				.then(function (data) {
					$scope.resetConfirmed = true;
					$scope.resetForm.email = data.email;
				})
				// handle error
				.catch(function (error) {
					if(error.error) {
						Flash.create('danger', "Le code de confirmation est erroné. Merci de recommencer.", 10000)
					}
				});
		}

		$scope.checkPassword = function() {
			var password = $scope.resetForm.passwd;
			var confirm = $scope.resetForm.confirmPasswd;
			if (password != '' && password != confirm) {
				$scope.badConfirmPasswd = true;
				$scope.disabled = true;
			} else {
				$scope.badConfirmPasswd = false;
				$scope.disabled = false;
			}
			return !$scope.badConfirmPasswd;
		};

		$scope.resetPassword = function() {
			// initial values
			$scope.error = false;
			$scope.disabled = true;

			AuthService.resetPassword($scope.resetForm.email, $scope.resetForm.passwd)
				.then(function () {
					Flash.create('success', 'Votre mot de passe a bien été changé ! Redirection...');
					$timeout(function () { $state.go('login'); }, 1500);
				})
				// handle error
				.catch(function (error) {
					if(error.error) {
						Flash.create('danger', "Aucun utilisateur avec cette adresse n'est enregistré !", 10000);
					}
				});
		};

		$scope.sendReset = function() {
			// initial values
			$scope.error = false;
			$scope.disabled = true;

			AuthService.sendPasswordResetMail($scope.resetForm.email)
			// handle success
				.then(function () {
					Flash.create('success', 'Un mail vient de vous êtes envoyé à '+ $scope.resetForm.email +'. Suivez le lien pour réinitialiser votre mot de passe.');
					$scope.disabled = false;
				})
				// handle error
				.catch(function (error) {
					var msg = 'Une erreur est survenue...';
					if(error.no_user) {
						msg = "Aucun utilisateur avec cette adresse n'est enregistré !";
					} else if(error.not_confirmed) {
						msg = "Cet utilisateur n'a pas confirmé son adresse email, merci de confirmer l'adresse : " + $scope.resetForm.email;
					}
					Flash.create('danger', msg, 10000);
					$scope.disabled = false;
				});
		}
	}
])
	
	
.controller("RegisterController", [
	'$scope',
	'$state',
	'Flash',
	'PageTitleService',
	'PageService',
	'AuthService',

	function($scope, $state, Flash, PageTitleService, PageService, AuthService) {
		PageTitleService.setTitle('Inscription');

		$scope.registerForm = {};

		if($scope.currentUser) {
			Flash.create('danger', 'Vous êtes déjà connecté avec '+ $scope.currentUser.name +' ! Redirection...');
			setTimeout(function() { $state.go('home'); }, 1500);
		}
		
		PageService.get({id : 'inscription'}, function(data) {
			$scope.text = data.data;
		});

		$scope.checkPassword = function() {
			var password = $scope.registerForm.passwd;
			var confirm = $scope.registerForm.confirmPasswd;
			if (password != '' && password != confirm) {
				$scope.badConfirmPasswd = true;
				$scope.disabled = true;
			} else {
				$scope.badConfirmPasswd = false;
				$scope.disabled = false;
			}
			return !$scope.badConfirmPasswd;
		};

		$scope.register = function () {
			// initial values
			$scope.error = false;
			$scope.disabled = true;
			
			if($scope.checkPassword()) {
				// call login from service
				AuthService.register($scope.registerForm.name, $scope.registerForm.email, $scope.registerForm.passwd, $scope.registerForm.newsletter)
					// handle success
					.then(function () {
						var msg = 'Inscription effectuée ! Un mail vient de vous êtes envoyé. Confirmez votre adresse email : '+ $scope.registerForm.email +', puis <a ui-sref="login">Connectez-vous</a>';
						Flash.create('success', msg, 10000);
						$scope.disabled = false;
					})
					// handle error
					.catch(function (error,a,b,c) {
						var msg;
						if(error.error) {
							msg = error.error;
						} else if (error.already_exist) {
							msg = 'Un compte existe déjà avec cette adresse mail !';
						}
						Flash.create('danger', msg, 10000);
						$scope.disabled = false;
					});
			} else {
				Flash.create('danger', 'La confirmation du mot de passe est invalide !', 10000);
				$scope.disabled = false;
			}
		};
	}
]);