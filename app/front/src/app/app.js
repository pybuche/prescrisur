var app = angular.module('prescrisurApp', [
	'ui.router',
	'ui.select',
	'ui.bootstrap',
	'ngFlash',
	'textAngular',
	'ngSanitize',
	'slugifier',
	'prescrisurApp.textEditor',
	'prescrisurApp.commonsServices',
	'prescrisurApp.modelServices',
	'prescrisurApp.loginServices',
	'prescrisurApp.directives',
	'prescrisurApp.filters',
	'prescrisurApp.controllers'
]);

angular.module('prescrisurApp.controllers', []);

// Routing
app.config(function($stateProvider, $urlRouterProvider) {

	$urlRouterProvider.otherwise('/');

	$stateProvider
		.state('home', {
			url: '/',
			controller : 'HomeController',
			templateUrl: 'front/app/templates/home.html',
			access: {restricted: false}
		})

		.state('homesearch', {
			url: '/search/:search',
			controller : 'HomeController',
			templateUrl: 'front/app/templates/home.html',
			access: {restricted: false}
		})

		// Pathologies
		.state('pathologies', {
			url: '/pathologies',
			controller: 'PathologyAdminController',
			templateUrl: 'front/app/templates/pathology-admin.html',
			access: {restricted: true, admin: true}
		})
			.state('pathologies.new', {
				url: '/new',
				views: {
					'@': {
						controller: 'PathologyEditController',
						templateUrl: 'front/app/templates/pathology-edit.html'
					}
				},
				access: {restricted: true, admin: true}
			})
			.state('pathologies.read', {
				url: '/:id?draft',
				views: {
					'@': {
						controller: 'PathologyController',
						templateUrl: 'front/app/templates/pathology.html'
					}
				},
				access: {restricted: true}
			})
			.state('pathologies.edit', {
				url: '/:id/edit?draft',
				views: {
					'@': {
						controller: 'PathologyEditController',
						templateUrl: 'front/app/templates/pathology-edit.html'
					}
				},
				access: {restricted: true, admin: true}
			})
		// Classes
		.state('classes', {
			url: '/classes/:id',
			controller: 'TherapeuticClassController',
			templateUrl: 'front/app/templates/therapeutic-class.html',
			access: {restricted: true}
		})
		// Specialities
		.state('specialities', {
			url: '/specialities/:id',
			controller: 'SpecialityController',
			templateUrl: 'front/app/templates/speciality.html',
			access: {restricted: false}
		})
		// Substances
		.state('substances', {
			url: '/substances/:id',
			controller: 'SubstanceController',
			templateUrl: 'front/app/templates/substance.html',
			access: {restricted: true}
		})
		// Associations
		.state('associations', {
			url: '/associations',
			controller: 'AssociationController',
			templateUrl: 'front/app/templates/association.html',
			params: {msg: null},
			access: {restricted: true, admin: true}
		})
		// Users
		.state('users', {
			url: '/users/:order',
			controller: 'UserAdminController',
			templateUrl: 'front/app/templates/user-admin.html',
			access: {restricted: true, admin: true}
		})
		.state('register', {
			url: '/register',
			controller : 'RegisterController',
			templateUrl: 'front/app/templates/register.html',
			access: {restricted: false}
		})
		.state('login', {
			url: '/login',
			controller : 'LoginController',
			templateUrl: 'front/app/templates/login.html',
			params: {needLogin: false},
			access: {restricted: false}
		})
		.state('profile', {
			url: '/me',
			controller : 'UserController',
			templateUrl: 'front/app/templates/user-edit.html',
			access: {restricted: true}
		})
		.state('logout', {
			url: '/logout',
			controller: 'LogoutController',
			template: '',
			access: {restricted: true}
		})
		.state('confirm-email', {
			url: '/confirm/:token',
			controller : 'HomeController',
			templateUrl: 'front/app/templates/home.html',
			access: {restricted: false},
			params: {confirm: true}
		})
		.state('update-email', {
			url: '/update-email/:token',
			controller : 'HomeController',
			templateUrl: 'front/app/templates/home.html',
			access: {restricted: false},
			params: {updateEmail: true}
		})
		.state('reset-password', {
			url: '/reset/:token',
			controller : 'ResetPasswordController',
			templateUrl: 'front/app/templates/reset-password.html',
			access: {restricted: false}
		})
		// Pages
		.state('pages', {
			url: '/pages',
			controller: 'PageController',
			templateUrl: 'front/app/templates/page-admin.html',
			access: {restricted: true, admin: true}
		})
			.state('pages.new', {
				url: '/new',
				views: {
					'@': {
						controller: 'PageEditController',
						templateUrl: 'front/app/templates/page-edit.html'
					}
				},
				access: {restricted: true, admin: true}
			})
			.state('pages.read', {
				url: '/:id',
				views: {
					'@': {
						controller: 'PageController',
						templateUrl: 'front/app/templates/page.html'
					}
				},
				access: {restricted: false}
			})
			.state('pages.edit', {
				url: '/:id/edit',
				views: {
					'@': {
						controller: 'PageEditController',
						templateUrl: 'front/app/templates/page-edit.html'
					}
				},
				access: {restricted: true, admin: true}
			})
		.state('contact', {
			url: '/contact',
			controller: 'ContactController',
			templateUrl: 'front/app/templates/contact.html',
			access: {restricted: false}
		})
		// News
		.state('news', {
			url: '/news',
			controller: 'NewsController',
			templateUrl: 'front/app/templates/news.html',
			access: {restricted: false}
		})
			.state('news.new', {
				url: '/new',
				views: {
					'@': {
						controller: 'NewsEditController',
						templateUrl: 'front/app/templates/news-edit.html'
					}
				},
				access: {restricted: true, admin: true}
			})
			.state('news.read', {
				url: '/:id',
				views: {
					'@': {
						controller: 'NewsController',
						templateUrl: 'front/app/templates/news.html'
					}
				},
				access: {restricted: false}
			})
			.state('news.edit', {
				url: '/:id/edit',
				views: {
					'@': {
						controller: 'NewsEditController',
						templateUrl: 'front/app/templates/news-edit.html'
					}
				},
				access: {restricted: true, admin: true}
			})

		.state('newsletter', {
			url: '/newsletter',
			controller: 'NewsLetterController',
			templateUrl: 'front/app/templates/newsletter.html',
			access: {restricted: false}
		})
		.state('ansm-diff', {
			url: '/ansm-diff',
			controller : 'ANSMDiffController',
			templateUrl: 'front/app/templates/ansm-diff.html',
			access: {restricted: true, admin: true}
		})
		.state('error', {
			url: '/error',
			controller : 'ErrorController',
			templateUrl: 'front/app/templates/error.html',
			params: {code: null},
			access: {restricted: false}
		})
});


// On route change
app.run(function ($rootScope, $state, $window, ConfirmQuitService, AuthService) {
	var postLoginState, postLoginParams;
	$rootScope.copyright = new Date().getFullYear();
	$rootScope.$on('$stateChangeStart',
		function (event, toState, toParams) {
			// Prevent confirm before quit to run on all pages
			ConfirmQuitService.destroyWindowQuit();

			// Authenticate user
			AuthService.getUser()
				.then(function(user) {
					if(postLoginState && AuthService.isLoggedIn()) {
						$state.go(postLoginState, postLoginParams);
						postLoginState = null;
						postLoginParams = null;
					} else if(toState.access.admin && user.roles.indexOf('admin') == -1) {
						return $state.go('error', {code: 403});
					}
					$rootScope.setCurrentUser(user);
				})
				.catch(function(e) {
					if(e.need_login || toState.access.restricted) {
						postLoginState = $state.current.name;
						postLoginParams = $state.params;
						return $state.go('login', {needLogin: true});
					} else if(e.need_role || toState.access.admin) {
						return $state.go('error', {code: 403});
					}
					$rootScope.setCurrentUser(null);
				});
		});
});


app.config(['$uibTooltipProvider', function ($uibTooltipProvider) {
	if('ontouchstart' in window) {
		$uibTooltipProvider.options({
			trigger: 'none'
		});
	}
}]);
