angular.module('prescrisurApp.modelServices', ['ngResource'])

.factory('PathologyService', ['$resource',
	function($resource){
		return $resource('/api/pathologies/:id/:dest', null, {
			validate: { method: 'PUT', params: { id: '@id', dest: 'validate' } },
			unvalidate: { method: 'PUT', params: { id: '@id', dest: 'unvalidate' } }
		});
	}
])

.factory('PathologyDraftService', ['$resource',
	function($resource){
		return $resource('/api/pathologies/:id/draft', null, {
			update: { method: 'PUT' },
			hasDraft: { method: 'GET', url: '/api/pathologies/:id/draft/exist'}
		});
	}
])
	
.factory('PathologySubstanceService', ['$resource',
	function($resource){
		return $resource('/api/pathologies/substances/:id');
	}
])

.factory('TherapeuticClassService', ['$resource',
	function($resource){
		return $resource('/api/classes/:id');
	}
])

.factory('SubstanceService', ['$resource',
	function($resource){
		return $resource('/api/substances/:id');
	}
])

.factory('SpecialityService', ['$resource',
	function($resource){
		return $resource('/api/specialities');
	}
])

.factory('AssociationService', ['$resource',
	function($resource){
		return $resource('/api/associations/:id', null, {
			update: { method:'PUT' }
		});
	}
])

.factory('SearchService', ['$resource',
	function($resource){
		return $resource('/api/:searchType/search');
	}
])

.factory('PageService', ['$resource',
	function($resource){
		return $resource('/api/pages/:id', null, {
			update: { method:'PUT' }
		});
	}
])

.factory('NewsService', ['$resource',
	function($resource){
		return $resource('/api/news/:id', null, {
			update: { method:'PUT' }
		});
	}
])

.factory('UserService', ['$resource',
	function($resource){
		return $resource('/api/users');
	}
])

.factory('UserSubscriptionService', ['$resource',
	function($resource){
		return $resource('/api/users/:id/subscription', null, {
			subscribe: { method: 'PUT' },
			unsubscribe: { method: 'DELETE' }
		});
	}
])

.factory('UserNewsletterService', ['$resource',
	function($resource){
		return $resource('/api/users/:id/newsletter', null, {
			subscribe: { method: 'PUT' },
			unsubscribe: { method: 'DELETE' }
		});
	}
]);
