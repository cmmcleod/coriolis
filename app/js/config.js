/**
 * Sets up the routes and handlers before the Angular app is kicked off.
 */
angular.module('app').config(['$provide','$stateProvider', '$urlRouterProvider', '$locationProvider', 'ShipsDB', function ($provide, $stateProvider, $urlRouterProvider, $locationProvider, ships) {
  // Use HTML5 push and replace state if possible
  $locationProvider.html5Mode(true);
  /**
   * Set up all states and their routes.
   */
  $stateProvider
    .state('outfit', {
      url: '/outfit/:shipId/:code?bn',
      params: {
        // TODO: Squash:false not working due to UI-router issue
        shipId: { value: 'sidewinder', squash: false}, // Allow 'shipId' parameter to default to
        code: { value: null, squash: true } // Allow 'code' parameter to be empty/optional
      },
      templateUrl: 'views/page-outfit.html',
      controller: 'OutfitController',
      resolve: {
        shipId: ['$stateParams',function ($p) { // Ensure ship exists before loading controller
          if (!ships[$p.shipId]) {
            throw { type: 'no-ship', message: $p.shipId };
          }
        }]
      }
    })
    .state('shipyard', { url: '/', templateUrl: 'views/page-shipyard.html', controller: 'ShipyardController' })
    .state('comparison', { url: '/comparison', templateUrl: 'views/page-comparison.html', controller: 'ComparisonController' })
    .state('error', { params: {type:null, message:null, details: null }, templateUrl: 'views/page-error.html', controller: 'ErrorController' })

  // Redirects
  $urlRouterProvider.when('/outfit','/outfit/sidewinder/');

  /**
   * 404 Handler - Keep current URL/ do not redirect, change to error state.
   */
  $urlRouterProvider.otherwise(function ($injector, $location) {
    // Go to error state, reload the controller, keep the current URL
    $injector.get('$state').go('error', { type: 404, message: null, details: null }, {location:false, reload:true});
    return $location.path;
  });

  /**
   * Global Error Handler. Decorates the existing error handler such that it
   * redirects uncaught errors to the error page.
   *
   */
  $provide.decorator('$exceptionHandler', ['$delegate', '$injector', function ($delegate, $injector) {
    return function(err, cause) {
      // Go to error state, reload the controller, keep the current URL
      $injector.get('$state').go('error', {type:null, message: err.message, details: err.stack }, {location:false, reload:true});
      $delegate(err, cause);
    };
  }]);

}]);
