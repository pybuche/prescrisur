angular.module('prescrisurApp.controllers')

.controller("ContactController", [
	'$scope',
	'Flash',
	'PageTitleService',
	'PageService',
	'MailService',

	function($scope, Flash, PageTitleService, PageService, MailService) {
		PageTitleService.setTitle('Contact');

		$scope.contactForm = {};

		if($scope.currentUser) {
			$scope.contactForm.sender = {name: $scope.currentUser.name, email: $scope.currentUser.email};
		}
		
		// Load texts
		PageService.get({id: 'contact-presentation-prescrisur'}, function(data) {
			$scope.textPrescrisur = data.data;
		});
		PageService.get({id: 'contact-presentation-nicole'}, function(data) {
			$scope.textNicole = data.data;
		});

		$scope.submit = function() {
			$scope.disabled = true;

			MailService.send($scope.contactForm, function() {
				Flash.create('success', 'Message Envoyé !');
			}, function() {
				var msg = 'Une erreur est survenue. Réessayez ou envoyez directement un mail à <a href="mailto:prescrisur@gmail.com">prescrisur@gmail.com</a>';
				Flash.create('danger', msg, 10000);
				$scope.disabled = false;
			});
			// console.log($scope.contactForm);
		}
	}
]);