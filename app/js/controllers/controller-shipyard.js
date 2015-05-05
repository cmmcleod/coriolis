angular.module('app').controller('ShipyardController', ['$rootScope', 'ShipsDB', function ($rootScope, ships) {
  $rootScope.title = 'Coriolis';
  $rootScope.bodyClass = 'docking-bay';
  $rootScope.ships = ships;
}]);