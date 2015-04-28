angular.module('app')
.controller('ShipController', ['$rootScope','$scope', '$routeParams', '$location', 'ShipFactory', 'components', function ($rootScope, $scope, $p, $loc, ShipFactory, Components) {
  $scope.shipId = $p.ship;

  // TODO: show 404 if ship not found.
  var ship = ShipFactory($scope.shipId, DB.ships[$scope.shipId], $p.code);
  $scope.ship = ship;
  $scope.pp = ship.common[0]; // Power Plant
  $scope.th = ship.common[1]; // Thruster
  $scope.fsd = ship.common[2]; // Frame Shrift Drive
  $scope.ls = ship.common[3]; // Life Support
  $scope.pd = ship.common[4]; // Power Distributor
  $scope.ss = ship.common[5]; // Sensors
  $scope.ft = ship.common[6]; // Fuel Tank
  $scope.hps = ship.hardpoints;
  $scope.internal = ship.internal;
  $scope.availCS = Components.forShip($scope.shipId);
  $scope.selectedSlot = null;
  // for debugging
  window.ship = ship;
  window.availcs = $scope.availCS;

  $scope.selectSlot = function(e, slot) {
    e.stopPropagation();
    if ($scope.selectedSlot == slot) {
      $scope.selectedSlot = null;
    } else {
      $scope.selectedSlot = slot;
    }
  };

  $scope.selectComponent = function(slot, id, component) {
    ship.use(slot, id, component);
    $scope.selectedSlot = null;
    $loc.path(ship.id + '/' + ship.code, false).replace();
  }

  $scope.hideMenus = function() {
    $scope.selectedSlot = null;
  }

  $rootScope.$on('keyup', function (e, keyEvent) {
    if(keyEvent.keyCode == 27) { // on Escape
      $scope.hideMenus();
      $scope.$apply();
    }
    // TODO: CTRL+S -> Save
  });

  $rootScope.$on('bgClicked', function (e, keyEvent) {
    $scope.hideMenus();
  });

  // TODO: Save build
  // TODO: name build + save
    // Push new url history in this case
  // TODO: delete build
  // TODO: reset to ship defaults
  // TODO: revert to last save

}]);
