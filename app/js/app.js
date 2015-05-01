angular.module('app', ['ui.router', 'shipyard', 'ngLodash', 'app.templates'])
.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider) {
  $locationProvider.html5Mode(true);
  $stateProvider
    .state('outfit', {
      url: '/outfit/:shipId/:code?bn',
      params: {
        // TODO: fix below, default, squash false not working
        //shipId: { value: 'sidewinder', squash: false }, // Allow 'shipId' parameter to default to
        code: { value: null, squash: true } // Allow 'code' parameter to be empty/optional
      },
      templateUrl: 'views/page-outfit.html',
      controller: 'OutfitController',
      resolve: {
        shipId: ['$stateParams',function ($p) { // Ensure ship exists before loading controller
          if (!DB.ships[$p.shipId]) {
            throw { type: 404, message: 'Ship "' + $p.shipId  + '" does not exist'};
          }
        }]
      }
    })
    .state('shipyard', { url: '/', templateUrl: 'views/page-shipyard.html', controller: 'ShipyardController' })
    .state('error', { params: {type:null, message:null, details: null }, templateUrl: 'views/page-error.html', controller: 'ErrorController' })
    .state('notfound', { url: '*path', templateUrl: 'views/page-error.html', controller: 'ErrorController' });

}])
.config(['$provide',function($provide) {
  // Global Error Handler, redirects uncaught errors to the error page
  $provide.decorator('$exceptionHandler', ['$delegate', '$injector', function ($delegate, $injector) {
    return function(exception, cause) {
      $injector.get('$state').go('error', { details: exception }, {location:false, reload:true});  // Go to error state, reload the controller, keep the current URL
      $delegate(exception, cause);
    };
  }]);
}])
.run(['$rootScope','$document','$state','commonArray','shipPurpose','shipSize','hardPointClass','internalGroupMap','hardpointsGroupMap', function ($rootScope, $doc, $state, CArr, shipPurpose, sz, hpc, igMap, hgMap) {

  // Redirect any state transition errors to the error controller/state
  $rootScope.$on('$stateChangeError', function(e, toState, toParams, fromState, fromParams, error){
    e.preventDefault();
    $state.go('error',error, {location:false, reload:true});  // Go to error state, reload the controller, keep the current URL
  });

  // Global Reference variables
  $rootScope.CArr = CArr;
  $rootScope.SP = shipPurpose;
  $rootScope.SZ = sz;
  $rootScope.HPC = hpc;
  $rootScope.igMap = igMap;
  window.hgmap = $rootScope.hgMap = hgMap;
  $rootScope.ships = DB.ships;
  $rootScope.title = 'Coriolis';

  // Formatters
  $rootScope.fCrd = d3.format(',.0f');
  $rootScope.fPwr = d3.format(',.2f');
  $rootScope.fRound = function(d) { return d3.round(d, 2) };
  $rootScope.fPct = d3.format('.2%');
  $rootScope.fRPct = d3.format('%');
  $rootScope.fTime = function(d) { return Math.floor(d/60) + ":" + ("00" + (d%60)).substr(-2,2); };

  // Global Event Listeners
  $doc.bind('keyup', function (e) {
    $rootScope.$broadcast('keyup', e);
  });

  $rootScope.bgClicked = function (e) {
    $rootScope.$broadcast('bgClicked', e);
  }

}]);
