/**
 * Sets up the routes and handlers before the Angular app is kicked off.
 */
angular.module('app').config(['$provide', '$stateProvider', '$urlRouterProvider', '$locationProvider', 'ShipsDB', function($provide, $stateProvider, $urlRouterProvider, $locationProvider, ships) {
  // Use HTML5 push and replace state if possible
  $locationProvider.html5Mode({ enabled: true, requireBase: false });
  /**
   * Set up all states and their routes.
   */
  $stateProvider
    .state('outfit', {
      url: '/outfit/:shipId/:code?bn',
      params: {
        shipId: { value: 'sidewinder', squash: false }, // Allow 'shipId' parameter to default to sidewinder
        code: { value: null, squash: true }             // Allow 'code' parameter to be empty/optional
      },
      templateUrl: 'views/page-outfit.html',
      controller: 'OutfitController',
      resolve: {
        shipId: ['$stateParams', function($p) { // Ensure ship exists before loading controller
          if (!ships[$p.shipId]) {
            throw { type: 'no-ship', message: $p.shipId };
          }
        }]
      },
      sticky: true
    })
    .state('compare', {
      url: '/compare/:name',
      params: {
        name: { value: null, squash: true }
      },
      templateUrl: 'views/page-comparison.html',
      controller: 'ComparisonController',
      sticky: true
    })
    .state('comparison', {
      url: '/comparison/:code',
      templateUrl: 'views/page-comparison.html',
      controller: 'ComparisonController',
      sticky: true
    })
    .state('shipyard', { url: '/', templateUrl: 'views/page-shipyard.html', controller: 'ShipyardController', sticky: true })
    .state('error', { params: { type: null, message: null, details: null }, templateUrl: 'views/page-error.html', controller: 'ErrorController', sticky: true })

    // Modal States and views
    .state('modal', { abstract: true, views: { 'modal': { templateUrl: 'views/_modal.html', controller: 'ModalController' } } })
    .state('modal.about', { views: { 'modal-content': { templateUrl: 'views/modal-about.html' } } })
    .state('modal.export', { params: { title: null, data: null, promise: null, description: null }, views: { 'modal-content': { templateUrl: 'views/modal-export.html', controller: 'ExportController' } } })
    .state('modal.import', { params: { obj: null }, views: { 'modal-content': { templateUrl: 'views/modal-import.html', controller: 'ImportController' } } })
    .state('modal.link', { params: { url: null }, views: { 'modal-content': { templateUrl: 'views/modal-link.html', controller: 'LinkController' } } })
    .state('modal.delete', { views: { 'modal-content': { templateUrl: 'views/modal-delete.html', controller: 'DeleteController' } } });


  // Redirects
  $urlRouterProvider.when('/outfit', '/outfit/sidewinder');

  /**
   * 404 Handler - Keep current URL/ do not redirect, change to error state.
   */
  $urlRouterProvider.otherwise(function($injector, $location) {
    // Go to error state, reload the controller, keep the current URL
    $injector.get('$state').go('error', { type: 404, message: null, details: null }, { location: false, reload: true });
    return $location.path;
  });

  /**
   * Global Error Handler. Decorates the existing error handler such that it
   * redirects uncaught errors to the error page.
   *
   */
  $provide.decorator('$exceptionHandler', ['$delegate', '$injector', function($delegate, $injector) {
    return function(err, cause) {
      // Go to error state, reload the controller, keep the current URL
      $injector.get('$state').go('error', { type: null, message: err.message, details: err.stack }, { location: false, reload: true });
      $delegate(err, cause);
    };
  }]);

}]);
