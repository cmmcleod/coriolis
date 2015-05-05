angular.module('app').controller('OutfitController', ['$rootScope','$scope', '$state', '$stateParams', 'ShipsDB', 'Ship', 'Components', 'Serializer', 'Persist', function ($rootScope, $scope, $state, $p, Ships, Ship, Components, Serializer, Persist) {
  var data = Ships[$p.shipId];   // Retrieve the basic ship properties, slots and defaults
  var ship = new Ship($p.shipId, data.properties, data.slots); // Create a new Ship instance

  //  Update the ship instance with the code (if provided) or the 'factory' defaults.
  if ($p.code) {
    Serializer.toShip(ship, $p.code);  // Populate components from 'code' URL param
    $scope.code = $p.code;
  } else {
    ship.buildWith(data.defaults);  // Populate with default components
  }

  $scope.buildName = $p.bn;
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
  $scope.savedCode = Persist.getBuild(ship.id, $scope.buildName);
  $rootScope.title = ship.name + ($scope.buildName? ' - ' + $scope.buildName: '');
  $rootScope.bodyClass = 'docking-bay';

  // for debugging
  window.myScope = $scope;

  /**
   * 'Opens' a select for component selection.
   *
   * @param  {[type]} e    The event object
   * @param  {[type]} slot The slot that is being 'opened' for selection
   */
  $scope.selectSlot = function(e, slot) {
    e.stopPropagation();
    if ($scope.selectedSlot == slot) {
      $scope.selectedSlot = null;
    } else {
      $scope.selectedSlot = slot;
    }
  };

  /**
   * Updates the ships build with the selected component for the
   * specified slot. Prevents the click event from propagation.
   *
   * @param  {string} type Shorthand key/string for identifying the slot & component type
   * @param  {[type]} slot The slot object belonging to the ship instance
   * @param  {[type]} e    The event object
   */
  $scope.select = function(type, slot, e) {
    e.stopPropagation();
    var id = angular.element(e.srcElement).attr('cpid');  // Get component ID
    if (id) {
      if (id == 'empty') {
        ship.use(slot, null, null);
      } else if(type == 'h') {
        ship.use(slot, id, Components.hardpoints(id));
      } else if (type == 'c') {
        ship.use(slot, id, Components.common(ship.common.indexOf(slot), id));
      } else if (type == 'i') {
        ship.use(slot, id, Components.internal(id));
      } else if (type == 'b') {
        ship.useBulkhead(id);
      }
      $scope.selectedSlot = null;
      $scope.code = Serializer.fromShip(ship);
      updateState();
    }
  }

  /**
   * Reload the build from the last save.
   */
  $scope.reloadBuild = function() {
    if ($scope.buildName && $scope.savedCode) {
      Serializer.toShip(ship, $scope.savedCode);  // Repopulate with components from last save
      $scope.code = $scope.savedCode;
      updateState();
    }
  };

  /**
   * Save the current build. Will replace the saved build if there is one
   * for this ship & with the exact name.
   */
  $scope.saveBuild = function() {
    if (!$scope.buildName) {
      return;
    }
    // No change hav been made, i.e. save ship default build under a name
    if (!$scope.code) {
      $scope.code = Serializer.fromShip(ship);
    }
    // Only save if there a build name and a change has been made or the build has never been saved
    if ($scope.code != $scope.savedCode) {
      Persist.saveBuild(ship.id, $scope.buildName, $scope.code);
      $scope.savedCode = $scope.code;
      updateState();
    }
  }

  /**
   * Permanently delete the current build and redirect/reload this controller
   * with the 'factory' build of the current ship.
   */
  $scope.deleteBuild = function() {
    Persist.deleteBuild(ship.id, $scope.buildName);
    $rootScope.$broadcast('buildDeleted', $scope.saveName, ship.id);
    $state.go('outfit', {shipId: ship.id, code: null, bn: null}, {location:'replace', reload:true});
  }

  $scope.bnChange = function(){
    $scope.savedCode = Persist.getBuild(ship.id, $scope.buildName);
  }

  $scope.toggleCost = function(item) {
    item.incCost = !item.incCost;
    ship.updateTotals();
  };

  $scope.togglePwr = function(item) {
    item.enabled = !item.enabled;
    ship.updateTotals();
  };

  // Utilify functions
  function updateState() {
    $state.go('outfit', {shipId: ship.id, code: $scope.code, bn: $scope.buildName}, {location:'replace', notify:false});
  }

  // Event listeners
  $rootScope.$on('keyup', function (e, keyEvent) {
    // CTRL + S or CMD + S will override the default and save the build is possible
    if (keyEvent.keycode == 83 && keyEvent.ctrlKey) {
      e.preventDefault();
      $scope.saveBuild();
    }
  });

  // Hide any open menu/slot/etc if escape key is pressed
  $rootScope.$on('escape', function (e, keyEvent) {
    $scope.selectedSlot = null;
    $scope.$apply();
  });
  // Hide any open menu/slot/etc if the background is clicked
  $rootScope.$on('close', function (e, keyEvent) {
    $scope.selectedSlot = null;
  });

}]);
