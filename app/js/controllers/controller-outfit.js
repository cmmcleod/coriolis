angular.module('app').controller('OutfitController', ['$window','$rootScope','$scope', '$state', '$stateParams', 'ShipsDB', 'Ship', 'Components', 'Serializer', 'Persist', function ($window, $rootScope, $scope, $state, $p, Ships, Ship, Components, Serializer, Persist) {
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
  $rootScope.title = ship.name + ($scope.buildName? ' - ' + $scope.buildName : '');
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
  $scope.canSave = Persist.isEnabled();
  $scope.fuel = 0;
  $scope.priority = [0, 0, 0, 0, 0];
  $scope.totalPriority = [0, 0, 0, 0];

  $scope.jrSeries = {
    xMin: 0,
    xMax: ship.cargoCapacity,
    // Slightly higher than actual based bacuse components are excluded
    yMax: ship.jumpRangeWithMass(ship.unladenMass),
    yMin: 0,
    func: function (cargo) { // X Axis is Cargo
      return ship.jumpRangeWithMass(ship.unladenMass + $scope.fuel + cargo, $scope.fuel);
    }
  };
  $scope.jrChart = {
    labels: {
      xAxis: {
        title:'Cargo',
        unit: 'T'
      },
      yAxis: {
        title:'Jump Range',
        unit: 'LY'
      }
    },
    watch: $scope.fsd
  };

  updatePriority();

  /**
   * 'Opens' a select for component selection.
   *
   * @param  {[type]} e    The event object
   * @param  {[type]} slot The slot that is being 'opened' for selection
   */
  $scope.selectSlot = function (e, slot) {
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
  $scope.select = function (type, slot, e) {
    e.stopPropagation();
    var id = angular.element(e.target).attr('cpid');  // Get component ID

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
  };

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
  };

  /**
   * Permanently delete the current build and redirect/reload this controller
   * with the 'factory' build of the current ship.
   */
  $scope.deleteBuild = function() {
    Persist.deleteBuild(ship.id, $scope.buildName);
    $state.go('outfit', {shipId: ship.id, code: null, bn: null}, {location:'replace', reload:true});
  };

  /**
   * On build name change, retrieve the existing saved code if there is one
   */
  $scope.bnChange = function() {
    $scope.savedCode = Persist.getBuild(ship.id, $scope.buildName);
  };

  /**
   * Toggle cost of the selected component
   * @param  {object} item The component being toggled
   */
  $scope.toggleCost = function (item) {
    item.incCost = !item.incCost;
    ship.updateTotals();
  };

  /**
   * Toggle the power on/off for the selected component
   * @param  {object} item The component being toggled
   */
  $scope.togglePwr = function (item) {
    // Update serialize code
    // updateState();
    var c = item.c;

    item.enabled = !item.enabled;
    if (item.enabled) {
      if (c.hardpoint && !$scope.ship.deployed)
        c.status = 3;
      else
        c.status = 1;
    }
    else
      c.status = 0;

    ship.updateTotals();
    updatePriority();
  };

  $scope.toggleHardpoints = function() {
    $scope.ship.deployed = !$scope.ship.deployed;

    for (var i = 0; i < ship.hardpoints.length; i++) {
      var item = ship.hardpoints[i];
      var c = item.c;

      if (c.passive)
        continue;

      if (!item.enabled)
        c.status = 0;
      else if ($scope.ship.deployed && item.enabled)
        c.status = 1;
      else
        c.status = 3;
    };

    updatePriority();
  }

  $scope.downPriority = function (c) {
    if (c.priority) {
      if (c.priority > 1)
        --c.priority;
    }

    updatePriority();
  }

  $scope.upPriority = function (c) {
    if (c.priority) {
      if (c.priority < 5)
        ++c.priority;
    }

    updatePriority();
  }

  $scope.fuelChange = function (fuel) {
    $scope.fuel = fuel;
    angular.element($window).triggerHandler('render');
  };

  // Utilify functions
  function updateState() {
    $state.go('outfit', {shipId: ship.id, code: $scope.code, bn: $scope.buildName}, {location:'replace', notify:false});
    $scope.jrSeries.xMax = ship.cargoCapacity;
    $scope.jrSeries.yMax = ship.jumpRangeWithMass(ship.unladenMass);
    $scope.jrSeries.mass = ship.unladenMass;

    updatePriority();
  }

  function updatePriority() {
    var poweredItems = collectPowered();

    $scope.totalPriority[0] = $scope.priority[0];
    $scope.totalPriority[1] = $scope.totalPriority[0] + $scope.priority[1];
    $scope.totalPriority[2] = $scope.totalPriority[1] + $scope.priority[2];
    $scope.totalPriority[3] = $scope.totalPriority[2] + $scope.priority[3];
    $scope.totalPriority[4] = $scope.totalPriority[3] + $scope.priority[4];
    floatTable($scope.totalPriority);

    var minimal = (function () {
      for (var i = $scope.totalPriority.length - 1; i >= 0; i--) {
        if ($scope.totalPriority[i] > $scope.ship.powerAvailable)
          continue;
        else
          return (i + 1);
      };
      return 0;
    })();

    for (var i = 0; i < poweredItems.length; i++) {
      var item = poweredItems[i];
      var c = item.c;

      if (c.priority > minimal)
        c.status = 2;
      else
        c.status = 1;
    };
  }

  function collectPowered() {
    var items = [];
    $scope.priority = [0, 0, 0, 0, 0];

    // Standard
    for (var i = 0; i < $scope.ship.common.length; i++) {
      var item = $scope.ship.common[i];
      var c = item.c;

      if (item.enabled) {
        $scope.priority[c.priority - 1] = $scope.priority[c.priority - 1] + c.power;
        items.push(item);
      }
    };
    // Cargo scoop
    if ($scope.ship.cargoScoop.enabled) {
      $scope.priority[$scope.ship.cargoScoop.c.priority - 1] = $scope.priority[$scope.ship.cargoScoop.c.priority - 1] + $scope.ship.cargoScoop.c.power;
      items.push($scope.ship.cargoScoop);
    }
    // Hardpoints && Utility
    for (var i = 0; i < $scope.ship.hardpoints.length; i++) {
      var item = $scope.ship.hardpoints[i];

      if (item.c == null)
        continue;

      var c = item.c;

      if (item.enabled) {
        if ((c.hardpoint && $scope.ship.deployed) || !c.hardpoint) {
          $scope.priority[c.priority - 1] = $scope.priority[c.priority - 1] + c.power;
          items.push(item);
        }
      }
    };
    // Internal
    for (var i = 0; i < $scope.ship.internal.length; i++) {
      var item = $scope.ship.internal[i];

      if (item.c == null)
        continue;

      var c = item.c;

      if (item.enabled) {
        $scope.priority[c.priority - 1] = $scope.priority[c.priority - 1] + c.power;
        items.push(item);
      }
    };

    floatTable($scope.priority);

    return items;
  }

  function floatTable (table) {
    for (var i = 0; i < table.length; i++) {
      table[i] = (table[i]).toFixed(2);
      table[i] = parseFloat(table[i]);
    };
  }

  // Hide any open menu/slot/etc if escape key is pressed
  $scope.$on('escape', function () {
    $scope.selectedSlot = null;
    $scope.$apply();
  });
  // Hide any open menu/slot/etc if the background is clicked
  $scope.$on('close', function () {
    $scope.selectedSlot = null;
  });

}]);
