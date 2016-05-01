var app = angular.module('prescrisurApp', [
	'ui.router',
	'ui.select',
	'ui.bootstrap',
	'ngSanitize',
	'colorpicker.module',
	'yaru22.angular-timeago',
	'textAngular',
	'prescrisurApp.modelServices',
	'prescrisurApp.loginServices',
	'prescrisurApp.directives',
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
		.state('login', {
			url: '/login',
			controller : 'LoginController',
			templateUrl: 'front/app/templates/login.html',
			access: {restricted: false}
		})
		.state('logout', {
			url: '/logout',
			resolve: {controller : 'LogoutService'},
			access: {restricted: true}
		})
		.state('pages-edit', {
			url: '/pages/edit/:id',
			controller: 'PageEditController',
			templateUrl: 'front/app/templates/page-edit.html',
			access: {restricted: true}
		})
		.state('pages-new', {
			url: '/pages/new',
			controller: 'PageEditController',
			templateUrl: 'front/app/templates/page-edit.html',
			access: {restricted: true}
		})
		.state('pages', {
			url: '/pages/:id',
			controller: 'PageController',
			templateUrl: 'front/app/templates/page.html',
			access: {restricted: true}
		})
		.state('news-edit', {
			url: '/news/edit/:id',
			controller: 'NewsEditController',
			templateUrl: 'front/app/templates/news-edit.html',
			access: {restricted: true}
		})
		.state('news-new', {
			url: '/news/new',
			controller: 'NewsEditController',
			templateUrl: 'front/app/templates/news-edit.html',
			access: {restricted: true}
		})
		.state('news', {
			url: '/news/:id',
			controller: 'NewsController',
			templateUrl: 'front/app/templates/news.html',
			access: {restricted: true}
		})
		.state('news-list', {
			url: '/news',
			controller: 'NewsController',
			templateUrl: 'front/app/templates/news.html',
			access: {restricted: true}
		})
		.state('pathologies-edit', {
			url: '/pathologies/edit/:id',
			controller: 'PathologyEditController',
			templateUrl: 'front/app/templates/pathology-edit.html',
			access: {restricted: true}
		})
		.state('pathologies-new', {
			url: '/pathologies/new',
			controller: 'PathologyEditController',
			templateUrl: 'front/app/templates/pathology-edit.html',
			access: {restricted: true}
		})
		.state('pathologies', {
			url: '/pathologies/:id',
			controller: 'PathologyController',
			templateUrl: 'front/app/templates/pathology.html',
			access: {restricted: true}
		})
		.state('specialities', {
			url: '/specialities/:id',
			controller: 'SpecialityController',
			templateUrl: 'front/app/templates/speciality.html',
			access: {restricted: false}
		})
		.state('substances', {
			url: '/substances/:id',
			controller: 'SubstanceController',
			templateUrl: 'front/app/templates/substance.html',
			access: {restricted: true}
		})
});

// On route change
app.run(function ($rootScope, $state, $window, AuthService) {
	var postLoginState, postLoginParams;
	$rootScope.$on('$stateChangeStart',
		function (event, toState, toParams) {
			AuthService.getUser().then(function(user){
				if(toState.access.restricted && !AuthService.isLoggedIn()) {
					postLoginState = $state.current.name;
					postLoginParams = $state.params;
					return $state.go('login');
				} else if(postLoginState && AuthService.isLoggedIn()) {
					$state.go(postLoginState, postLoginParams);
					postLoginState = null;
					postLoginParams = null;
				}
				$rootScope.setCurrentUser(user);
			});
		});
});

// textAngular Setup
app.config(['$provide', function($provide){
	// this demonstrates how to register a new tool and add it to the default toolbar
	$provide.decorator('taOptions', ['$delegate', function(taOptions){
		// $delegate is the taOptions we are decorating
		// here we override the default toolbars and classes specified in taOptions.
		taOptions.forceTextAngularSanitize = true; // set false to allow the textAngular-sanitize provider to be replaced
		taOptions.keyMappings = []; // allow customizable keyMappings for specialized key boards or languages
		taOptions.toolbar = [
			['h2', 'h3', 'h4'],
			['bold', 'italics', 'underline', 'fontColor', 'clear'],
			['justifyLeft','justifyCenter','justifyRight', 'justifyFull'],
			['ul', 'indent', 'outdent'],
			['insertImage', 'insertLink']
		];
		taOptions.classes = {
			focussed: 'focussed',
			toolbar: 'btn-toolbar',
			toolbarGroup: 'btn-group',
			toolbarButton: 'btn btn-default',
			toolbarButtonActive: 'active',
			disabled: 'disabled',
			textEditor: 'form-control',
			htmlEditor: 'form-control'
		};
		return taOptions; // whatever you return will be the taOptions
	}]);

	$provide.decorator('taOptions', ['taRegisterTool', '$delegate', function(taRegisterTool, taOptions){
		// $delegate is the taOptions we are decorating
		// register the tool with textAngular
		taRegisterTool('fontColor', {
			display: "<button colorpicker type='button' class='btn btn-default ng-scope'  title='Font Color'  colorpicker-close-on-select colorpicker-position='bottom' ng-model='fontColor' style='color: {{fontColor}}'><i class='fa fa-font '></i></button>",
			action: function (deferred) {
				var self = this;
				if (typeof self.listener == 'undefined') {
					self.listener = self.$watch('fontColor', function (newValue) {
						self.$editor().wrapSelection('foreColor', newValue);
					});
				}
				self.$on('colorpicker-selected', function () {
					deferred.resolve();
				});
				self.$on('colorpicker-closed', function () {
					deferred.resolve();
				});
				return false;
			}
		});
		//taOptions.toolbar[1].push('fontColor');

		taOptions.setup.textEditorSetup=function($element) {
			$element.attr('ui-codemirror', '');
		};
		return taOptions;
	}]);
}]);