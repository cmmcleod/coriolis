angular.module('app').controller('OutfitController', ['$rootScope','$scope', '$state', '$stateParams', 'Ship', 'Components', 'Serializer', 'Persist', function ($rootScope, $scope, $state, $p, Ship, Components, Serializer, Persist) {
  var data = DB.ships[$p.shipId];
  var ship = new Ship($p.shipId, data.properties, data.slots); // Create a new Ship instance

  if ($p.code) {
    Serializer.toShip(ship, $p.code);  // Populate components from 'code' URL param
    $scope.code = $p.code;
  } else {
    ship.buildWith(data.defaults);  // Populate with default components
  }

  $scope.buildName = $p.bn;
  $rootScope.title = ship.name + $scope.buildName? ' - ' + $scope.buildName: '';
  $scope.ship = ship;
  $scope.pp = ship.common[0];   // Power Plant
  $scope.th = ship.common[1];   // Thruster
  $scope.fsd = ship.common[2];  // Frame Shrift Drive
  $scope.ls = ship.common[3];   // Life Support
  $scope.pd = ship.common[4];   // Power Distributor
  $scope.ss = ship.common[5];   // Sensors
  $scope.ft = ship.common[6];   // Fuel Tank
  $scope.hps = ship.hardpoints;
  $scope.internal = ship.internal;
  $scope.availCS = Components.forShip(ship.id);
  $scope.selectedSlot = null;
  $scope.lastSaveCode = Persist.getBuild(ship.id, $scope.buildName);

  // for debugging
  window.myScope = $scope;

  $scope.selectSlot = function(e, slot) {
    e.stopPropagation();
    if ($scope.selectedSlot == slot) {
      $scope.selectedSlot = null;
    } else {
      $scope.selectedSlot = slot;
    }
  };

  $scope.select = function(type, slot, e) {
    e.stopPropagation();
    if (e.srcElement.id) {
      if(type == 'h') {
        ship.use(slot, e.srcElement.id, Components.hardpoints(e.srcElement.id));
      } else if (type == 'c') {
        ship.use(slot, e.srcElement.id, Components.common(ship.common.indexOf(slot), e.srcElement.id));
      } else if (type == 'i') {
        ship.use(slot, e.srcElement.id, Components.internal(e.srcElement.id));
      } else if (type == 'b') {
        ship.useBulkhead(slot, e.srcElement.id);
      } else {
        ship.use(slot, null, null);
      }
      $scope.selectedSlot = null;
      $scope.code = Serializer.fromShip(ship);
      $state.go('outfit', {shipId: ship.id, code: $scope.code, bn: $scope.buildName}, {location:'replace', notify:false});
      $scope.canSave = true;
    }
  }

  /**
   * Reload the build from the last save.
   */
  $scope.reloadBuild = function() {
    if ($scope.buildName && $scope.lastSaveCode) {
      Serializer.toShip(ship, $scope.lastSaveCode);  // Repopulate with components from last save
      $scope.code = $scope.lastSaveCode;
      $state.go('outfit', {shipId: ship.id, code: $scope.lastSaveCode, bn: $scope.buildName}, {location:'replace', notify:false});
    }
  };

  $scope.saveBuild = function() {
    if ($scope.code && $scope.code != $scope.lastSaveCode) {
      Persist.saveBuild(ship.id, $scope.buildName, $scope.code);
      $scope.lastSaveCode = $scope.code;
      $rootScope.$broadcast('buildSaved', ship.id, $scope.buildName, $scope.code);
    }
  }

  $scope.deleteBuild = function() {
    Persist.deleteBuild(ship.id, $scope.buildName);
    $rootScope.$broadcast('buildDeleted', $scope.saveName, ship.id);
    $state.go('outfit', {shipId: ship.id, code: null, bn: null}, {location:'replace', reload:true});
  }

  $rootScope.$on('keyup', function (e, keyEvent) {
    if(keyEvent.keyCode == 27) { // on Escape
      $scope.selectedSlot = null;
      $scope.$apply();
    }
    else if(keyEvent.keycode == 83 && keyEvent.ctrlKey){  // CTRL + S
      e.preventDefault();
      $scope.saveBuild();
    }
  });

  $rootScope.$on('bgClicked', function (e, keyEvent) {
    $scope.selectedSlot = null;
  });

}]);
