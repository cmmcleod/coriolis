angular.module('app', ['ngRoute','shipyard','ngLodash','app.templates'])
.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
  //$locationProvider.html5Mode(true);
  $routeProvider
    .when('/:ship', { templateUrl: 'views/ship.html', controller: 'ShipController' })
    .when('/', { templateUrl: 'views/ships.html', controller: 'ShipyardController' })

}])
.run(['$rootScope','commonArray','shipPurpose', 'shipSize', 'hardPointClass', 'internalGroupMap', function ($rootScope, CArr, shipPurpose, sz, hpc, igMap) {

  // Global Reference variables
  $rootScope.CArr = CArr;
  $rootScope.SP = shipPurpose;
  $rootScope.SZ = sz;
  $rootScope.HPC = hpc;
  $rootScope.igMap = igMap;
  $rootScope.ships = DB.ships;

  // Formatters
  $rootScope.credits = d3.format(',.0f');
  $rootScope.power = d3.format(',.2f');
  $rootScope.percent = d3.format(',.2%');

  $rootScope.calcJumpRange = function(mass, fsd, fuel) {
    return Math.pow( (fuel || fsd.maxfuel) / fds.fuelmul, 1 / fsd.fuelpower ) * fsd.optmass / mass;
  };

  // TODO: Load Saved Ships List from Local Storage

  // TODO: Save Ship

  // TODO: Load Ship

  // TODO: Generate Link for Ship

}]);
