// Text Angular setup
angular.module('prescrisurApp.textEditor', [])

.config(['$provide', function($provide){
	// this demonstrates how to register a new tool and add it to the default toolbar
	$provide.decorator('taOptions', ['$delegate', function(taOptions){
		// $delegate is the taOptions we are decorating
		// here we override the default toolbars and classes specified in taOptions.
		taOptions.forceTextAngularSanitize = true; // set false to allow the textAngular-sanitize provider to be replaced
		taOptions.keyMappings = []; // allow customizable keyMappings for specialized key boards or languages
		taOptions.toolbar = [
			['undo', 'redo'],
			['h2', 'h3', 'h4', 'small'],
			['bold', 'italics', 'underline', 'colorPicker', 'clear'],
			['justifyLeft','justifyCenter','justifyRight', 'justifyFull'],
			['ul', 'indent', 'outdent'],
			['imagePicker', 'insertImage', 'insertLink', 'html']
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

	$provide.decorator('taOptions', ['$rootScope', 'taRegisterTool', '$delegate', function($rootScope, taRegisterTool, taOptions){
		taRegisterTool('small', {
			buttontext: "small",
			action: function(){
				this.$editor().wrapSelection('fontsize', '1');
			}
		});

		taRegisterTool('colorPicker', {
			display: "<color-picker></color-picker>",
			action: function(deferred){
				var self = this;

				if(!self.$$listenerCount['color-picked']) {
					self.$on('color-picked', function (event, color) {
						self.$editor().wrapSelection('foreColor', color);
						deferred.resolve();
					});
				}

				return false;
			}
		});

		taRegisterTool('imagePicker', {
			display: "<image-picker></image-picker>",
			action: function(deferred){
				var self = this;

				if(!self.$$listenerCount['image-picked']) {
					self.$on('image-picked', function (event, img) {
						self.$editor().wrapSelection('insertimage', img);
						deferred.resolve();
					});
				}

				return false;
			}
		});

		taOptions.setup.textEditorSetup=function($element) {
			$element.attr('ui-codemirror', '');
		};
		return taOptions;
	}]);
}]);