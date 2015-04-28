angular.module('app', ['ngRoute', 'shipyard', 'ngLodash', 'n3-line-chart', 'app.templates'])
.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
  $locationProvider.html5Mode(true);
  $routeProvider
    .when('/:ship', { templateUrl: 'views/ship.html', controller: 'ShipController' })
    .when('/:ship/:code', { templateUrl: 'views/ship.html', controller: 'ShipController' })
    .when('/', { templateUrl: 'views/ships.html', controller: 'ShipyardController' });

}])
.run(['$rootScope','$document','$location','$route','commonArray','shipPurpose','shipSize','hardPointClass','internalGroupMap', function ($rootScope, $doc, $loc, $route, CArr, shipPurpose, sz, hpc, igMap) {
  // Allow URL changes without reloading controllers/view
  var original = $loc.path;
  $loc.path = function (path, reload) {
      if (reload === false) {
          var lastRoute = $route.current;
          var un = $rootScope.$on('$locationChangeSuccess', function () {
              $route.current = lastRoute;
              un();
          });
      }
      return original.apply($loc, [path]);
  };

  // Global Reference variables
  $rootScope.CArr = CArr;
  $rootScope.SP = shipPurpose;
  $rootScope.SZ = sz;
  $rootScope.HPC = hpc;
  $rootScope.igMap = igMap;
  $rootScope.ships = DB.ships;

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
