angular.module('prescrisurApp.directives', [])

.directive('levelTitle', function () {
	return {
		restrict: 'E',
		templateUrl: 'front/app/templates/partials/level-title.html',
		scope: {
			depth: '@',
			rank: '@',
			title: '@'
		}
	};
})

.directive('specStatus', function () {
	return {
		restrict: 'E',
		templateUrl: 'front/app/templates/partials/spec-status.html',
		scope: {
			status: '@'
		},
		link: function (scope, elem, attr) {
			var status = attr.status.toLowerCase();
			var statusLabels = {
				g: 'Générique',
				r: 'Princeps'
			};

			scope.label = statusLabels[status];
		}
	};
})

.directive("ngBindHtmlCompile", function($compile, $sce){
	return {
		restrict: "A",
		link: function(scope, element, attrs){
			scope.$watch($sce.parseAsHtml(attrs.ngBindHtmlCompile), function(html){
				var el = angular.element("<div>").html(html);
				element.empty();
				element.append(el.children());
				$compile(element.contents())(scope);
			})
		}
	};
})

.directive("colorPicker", function($compile, $sce){
	return {
		restrict: "E",
		templateUrl: 'front/app/templates/partials/color-picker.html',
		link: function(scope, element){
			var colorButton = element.find('.color-button');

			colorButton.on('click', function(evt) {
				scope.$emit('color-picked', evt.target.attributes.value.value);
			});
		}
	};
})

.directive("imagePicker", function(){
	return {
		restrict: "E",
		templateUrl: 'front/app/templates/partials/image-picker.html',
		link: function(scope, element){
			var imgButton = element.find('.image-button');

			imgButton.on('click', function(evt) {
				var src = evt.target.src;
				var domainRgx = /http:\/\/[^\/]+/;
				src = src.replace('.png', '_mini.png').replace(domainRgx, '');
				scope.$emit('image-picked', src);
			});
		}
	};
});