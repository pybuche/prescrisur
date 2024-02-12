angular.module('prescrisurApp.controllers')

.controller("PathologyController", [
	'$scope',
	'$state',
	'$window',
	'$timeout',
	'$location',
	'$stateParams',
	'Flash',
	'PageTitleService',
	'SearchService',
	'PathologyService',
	'PathologyDraftService',

	function($scope, $state, $window, $timeout, $location, $stateParams, Flash, PageTitleService, SearchService, PathologyService, PathologyDraftService) {
		$scope.pathology = null;
		$scope.foldAll = false;

		$scope.recoLabels = {
			alert: 'Substance sous surveillance particulière',
			middle: 'Substance recommandée sous surveillance particulière',
			ok: 'Substance Recommandée'
		};

		var getPathology = function(pathoService) {
			pathoService.get({ id: $stateParams.id }, function(data) {
				$scope.pathology = data.data;
				$scope.pathology.conclu= $scope.pathology.conclu.split("QWERTY")[0]
				PageTitleService.setTitle('Traitement de ' + $scope.pathology.name);
				// Show all specs if on mobile
				if($scope.mobileView) {
					$scope.toggleShowAll();
				}
			}, function(e) {
				if(e.status != 404) {
					return;
				}
				$scope.pathology = false;
				if($scope.draftExists) {
					$state.go('pathologies.read', {id: $stateParams.id, draft: true});
				} else {
					Flash.create('danger', "Cette Pathologie n'existe pas ! Redirection...");
					$timeout(function() {
						$state.go('home');
					}, 4000);
				}
			});
		};

		if($scope.isAuthorized('admin')) {
			if($stateParams.draft) {
				$scope.draftMode = true;
				getPathology(PathologyDraftService);
			} else {
				PathologyDraftService.hasDraft({ id: $stateParams.id }, function(data) {
					$scope.draftExists = data.exists;
					getPathology(PathologyService);
				});
			}
		} else {
			getPathology(PathologyService);
		}

		$scope.search = function($select) {
			var search = '';
			if($select) {
				search = $select.search;
			}
			$scope.results = searchMessage('Recherche en cours...');
			SearchService.get({q: search, searchType: 'pathologies'}, function(data) {
				$scope.results = data.data;
				if ($scope.results.length == 0) {
					$scope.results = searchMessage('Aucun résultat');
				}
			});
		};

		$scope.goTo = function($select) {
			$state.go('pathologies.read', {id: $select.selected._id});
		};

		$scope.validate = function() {
			if(confirm('Voulez-vous passer cette Pathologie en mode public ?')) {
				PathologyService.validate({ id: $stateParams.id }, function() {
					Flash.create('success', 'Pathologie validée !');
					$state.go('pathologies.read', { id: $stateParams.id, draft: null }, { reload: true });
				}, function() {
					Flash.create('danger', 'Un problème est survenu...');
				});
			}
		};

		$scope.unvalidate = function() {
			if(confirm('Voulez-vous invalider cette Pathologie ?')) {
				PathologyService.unvalidate({ id: $stateParams.id }, function() {
					Flash.create('success', 'Pathologie invalidée !');
					$state.go('pathologies.read', { id: $stateParams.id, draft: true }, { reload: true });
				}, function() {
					Flash.create('danger', 'Un problème est survenu...');
				});
			}
		};

		$scope.delete = function() {
			if ($stateParams.draft && confirm('Voulez-vous supprimer ce brouillon de Pathologie ?')) {
				PathologyDraftService.delete({ id: $stateParams.id }, function(data) {
					Flash.create('success', 'Brouillon de Pathologie Supprimée !');
					$state.go('pathologies');
				});
			}
			else if(confirm('Voulez-vous supprimer cette Pathologie ?')) {
				PathologyService.delete({ id: $stateParams.id }, function(data) {
					Flash.create('success', 'Pathologie Supprimée !');
					$state.go('pathologies');
				});
			}
		};

		$scope.duplicateAsFirstIntention = function() {
			PathologyService.duplicateAsFirstIntention({ id: $stateParams.id }, function(data) {
				Flash.create('success', 'Pathologie Dupliquée !');
				$state.go('pathologies.edit', {id: data.data._id});

			});
		};

		$scope.scrollTo = function(rank, $index) {
			var hashToGo = rank+($index+1)+'.';
			$location.hash(hashToGo);
		};

		$scope.entryColspan = function(entry) {
			if(entry.info) {
				return 1;
			}
			return 2;
		};

		$scope.visitorMode = function() {
			$scope.currentUser.visitorMode = true;
		};

		$scope.print = function() {
			var onPrintFinished = function() {
				showAll($scope.pathology, false);
			};

			showAll($scope.pathology, true);
			$timeout(function() {
				onPrintFinished($window.print())
			}, 500);
		};

		$scope.toggleShowAll = function() {
			$scope.foldAll = !$scope.foldAll;
			showAll($scope.pathology, $scope.foldAll);
		};

		var showAll = function(obj, value) {
			if(obj.hasOwnProperty('levels')) {
				obj.levels.forEach(function(l) {
					showAll(l, value);
				});
			} else if(obj.hasOwnProperty('entries')) {
				obj.entries.forEach(function(e) {
					if(e.hasOwnProperty('info')) {
						e.displayInfo = value;
					}
					if(e.product.hasOwnProperty('specialities')) {
						e.displaySpecialities = value;
					}
				});
			}
		};

		var searchMessage = function(msg) {
			return [{
				_id: null,
				name: msg
			}];
		};
	}
]);
