angular.module('prescrisurApp.commonsServices', ['ngResource'])

.factory('MailService', ['$resource',
	function($resource){
		return $resource('/api/mail', null, {
			send: { method: 'POST' }
		});
	}
])

.factory('PageTitleService', function() {
	var title = 'Prescrisur';
	return {
		title: function() { return title; },
		setTitle: function(newTitle) { title = newTitle }
	};
})

.factory('ConfirmQuitService', ['$window',
	function($window) {
		var stateChangeCheck = true;
		
		var init= function($scope) {
			// On quit page
			$window.onbeforeunload = function (event) {
				var message = "Vous n'avez pas enregistré vos modifications !";
				if (typeof event == 'undefined') {
					event = window.event;
				}
				if (event) {
					event.returnValue = message;
				}
				return message;
			};

			// On route change
			stateChangeCheck = true;
			$scope.$on('$stateChangeStart', function(event) {
				if(stateChangeCheck) {
					var answer = confirm("Vous n'avez pas enregistré vos modifications ! \n\r Voulez-vous vraiment quitter cette page ?");
					if (!answer) {
						event.preventDefault();
					}
				}
			});
		};
		
		var destroy = function() {
			destroyWindowQuit();
			stateChangeCheck = false;
		};
		
		var destroyWindowQuit = function() {
			$window.onbeforeunload = undefined;
		};

		return {
			init: init,
			destroy: destroy,
			destroyWindowQuit: destroyWindowQuit
		}
	}
]);