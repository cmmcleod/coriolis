angular.module('app')
.controller('ShipController', ['$scope', '$routeParams','ShipFactory', 'components', function ($scope, $p, ShipFactory, Components) {
  $scope.shipId = $p.ship;
  $scope.ship = ShipFactory($scope.shipId, DB.ships[$scope.shipId]);
  $scope.availCS = Components.forShip($scope.shipId);

  // for debugging
  //window.ship = $scope.ship;
  //window.availcs = $scope.availCS;
}]);