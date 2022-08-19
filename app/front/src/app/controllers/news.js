angular.module('prescrisurApp.controllers')

.controller("NewsController", [
	'$scope',
	'$state',
	'$stateParams',
	'$timeout',
	'Flash',
	'PageTitleService',
	'NewsService',

	function($scope, $state, $stateParams, $timeout, Flash, PageTitleService, NewsService) {

		if ($stateParams.id) {
			NewsService.get({ id: $stateParams.id }, function(data) {
				$scope.news = data.data;
				PageTitleService.setTitle($scope.news.name + ' | PrescriNews');
			}, function() {
				Flash.create('danger', "Cette News n'existe pas ! Redirection...", 1500);
				$timeout(function() {
					$state.go('home');
				}, 1500);
			});
		} else {
			NewsService.get(function(data){
				$scope.news = data.data;
				PageTitleService.setTitle('PrescriNews');
			})
		}

		$scope.delete = function(news_id) {
			if (confirm('Voulez-vous supprimer cette news ? ')) {
				NewsService.delete({ id: news_id }, function() {
					Flash.create('success', 'News supprimée !');
					$state.go('news', {}, {reload: true});
				}, function() {
					Flash.create('danger', 'Une erreur est survenue...', 10000);
				});
			}
		}
	}
])

.controller("NewsEditController", [
	'$scope',
	'$state',
	'$stateParams',
	'Flash',
	'PageTitleService',
	'ConfirmQuitService',
	'NewsService',

	function($scope, $state, $stateParams, Flash, PageTitleService, ConfirmQuitService, NewsService) {
		PageTitleService.setTitle('Nouvelle News');
		ConfirmQuitService.init($scope);

		if($stateParams.id) {
			NewsService.get({ id: $stateParams.id }, function(data) {
				$scope.news = data.data;
				PageTitleService.setTitle('Modifier une News');
			});
		}

		$scope.submit = function () {
			var afterSave = function(msg) {
				return function (data) {
					var savedPage = data.data;
					Flash.create('success', msg);
					$state.go('news.read', { id: savedPage._id });
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
					NewsService.update({id: $stateParams.id}, $scope.news, afterSave('News mise à jour !'), afterError);
				} else {
					NewsService.save($scope.news, afterSave('News créée !'), afterError);
				}
			}
			//console.log($scope.news);
		};
	}
]);