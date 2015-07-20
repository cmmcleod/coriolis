angular.module('app').controller('OutfitController', ['$window', '$rootScope', '$scope', '$state', '$stateParams', 'ShipsDB', 'Ship', 'Components', 'Serializer', 'Persist', 'calcTotalRange', 'calcSpeed', function($window, $rootScope, $scope, $state, $p, Ships, Ship, Components, Serializer, Persist, calcTotalRange, calcSpeed) {
  var win = angular.element($window);   // Angularized window object for event triggering
  var data = Ships[$p.shipId];   // Retrieve the basic ship properties, slots and defaults
  var ship = new Ship($p.shipId, data.properties, data.slots); // Create a new Ship instance
  var retrofitShip = new Ship($p.shipId, data.properties, data.slots); // Create a new Ship for retrofit comparison

  //  Update the ship instance with the code (if provided) or the 'factory' defaults.
  if ($p.code) {
    Serializer.toShip(ship, $p.code);  // Populate components from 'code' URL param
    $scope.code = $p.code;
  } else {
    ship.buildWith(data.defaults);  // Populate with default components
  }

  $scope.buildName = $p.bn;
  $rootScope.title = ship.name + ($scope.buildName ? ' - ' + $scope.buildName : '');
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
  $scope.costList = ship.costList;
  $scope.powerList = ship.powerList;
  $scope.priorityBands = ship.priorityBands;
  $scope.availCS = Components.forShip(ship.id);
  $scope.selectedSlot = null;
  $scope.savedCode = Persist.getBuild(ship.id, $scope.buildName);
  $scope.canSave = Persist.isEnabled();
  $scope.allBuilds = Persist.builds;
  $scope.fuel = 0;
  $scope.pwrDesc = false;
  $scope.pwrPredicate = 'type';
  $scope.retroDesc = false;
  $scope.retroPredicate = 'netCost';
  $scope.costDesc = true;
  $scope.costPredicate = 'c.cost';
  $scope.costTab = Persist.getCostTab() || 'costs';

  if ($scope.savedCode) {
    Serializer.toShip(retrofitShip, $scope.savedCode);  // Populate components from last save
    $scope.retrofitBuild = $scope.buildName;
  } else {
    retrofitShip.buildWith(data.defaults);
    $scope.retrofitBuild = null;
  }

  ship.applyDiscounts($rootScope.discounts.ship, $rootScope.discounts.components);
  retrofitShip.applyDiscounts($rootScope.discounts.ship, $rootScope.discounts.components);
  updateRetrofitCosts();

  $scope.jrSeries = {
    xMin: 0,
    xMax: ship.cargoCapacity,
    yMax: ship.unladenRange,
    yMin: 0,
    func: function(cargo) { // X Axis is Cargo
      return ship.jumpRangeWithMass(ship.unladenMass + $scope.fuel + cargo, $scope.fuel);
    }
  };
  $scope.jrChart = {
    labels: {
      xAxis: {
        title: 'Cargo',
        unit: 'T'
      },
      yAxis: {
        title: 'Jump Range',
        unit: 'LY'
      }
    }
  };

  $scope.trSeries = {
    xMin: 0,
    xMax: ship.cargoCapacity,
    yMax: ship.unladenTotalRange,
    yMin: 0,
    func: function(cargo) { // X Axis is Cargo
      return calcTotalRange(ship.unladenMass + cargo, $scope.fsd.c, $scope.fuel);
    }
  };
  $scope.trChart = {
    labels: {
      xAxis: {
        title: 'Cargo',
        unit: 'T'
      },
      yAxis: {
        title: 'Total Range',
        unit: 'LY'
      }
    }
  };

  $scope.speedSeries = {
    xMin: 0,
    xMax: ship.cargoCapacity,
    yMax: 500,
    yMin: 0,
    series: ['speed', 'boost'],
    func: function(cargo) { // X Axis is Cargo
      return calcSpeed(ship.unladenMass + $scope.fuel + cargo, ship.speed, ship.boost, $scope.th.c);
    }
  };
  $scope.speedChart = {
    labels: {
      xAxis: {
        title: 'Cargo',
        unit: 'T'
      },
      yAxis: {
        title: 'Speed',
        unit: 'm/s'
      }
    }
  };

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
  $scope.select = function(type, slot, e, id) {
    e.stopPropagation();
    id = id || angular.element(e.target).attr('cpid');  // Get component ID

    if (id) {
      if (id == 'empty') {
        ship.use(slot, null, null);
      } else if (type == 'h') {
        ship.use(slot, id, Components.hardpoints(id));
      } else if (type == 'c') {
        ship.use(slot, id, Components.common(ship.common.indexOf(slot), id));
      } else if (type == 'i') {
        ship.use(slot, id, Components.internal(id));
      } else if (type == 'b') {
        ship.useBulkhead(id);
      }
      $scope.selectedSlot = null;
      updateState(Serializer.fromShip(ship));
    }
  };

  /**
   * Reload the build from the last save.
   */
  $scope.reloadBuild = function() {
    if ($scope.buildName && $scope.savedCode) {
      Serializer.toShip(ship, $scope.savedCode);  // Repopulate with components from last save
      updateState($scope.savedCode);
    }
  };

  /**
   * Strip ship to D-class and no other components.
   */
  $scope.stripBuild = function() {
    for (var i = 0, l = ship.common.length - 1; i < l; i++) { // All except Fuel Tank
      var id = ship.common[i].maxClass + 'D';
      ship.use(ship.common[i], id, Components.common(i, id));
    }
    ship.hardpoints.forEach(function(slot) { ship.use(slot, null, null); });
    ship.internal.forEach(function(slot) { ship.use(slot, null, null); });
    ship.useBulkhead(0);
    updateState(Serializer.fromShip(ship));
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
      if ($scope.retrofitBuild === $scope.buildName) {
        Serializer.toShip(retrofitShip, $scope.code);
      }
      updateState($scope.code);
    }
  };

  /**
   * Export the build to detailed JSON
   */
  $scope.exportBuild = function(e) {
    e.stopPropagation();

    if ($scope.buildName) {
      $state.go('modal.export', {
        title: $scope.buildName + ' Export',
        description: 'A detailed JSON export of your build for use in other sites and tools',
        data: Serializer.toDetailedBuild($scope.buildName, ship, $scope.code || Serializer.fromShip(ship))
      });
    }
  };

  /**
   * Permanently delete the current build and redirect/reload this controller
   * with the 'factory' build of the current ship.
   */
  $scope.deleteBuild = function() {
    Persist.deleteBuild(ship.id, $scope.buildName);
    $state.go('outfit', { shipId: ship.id, code: null, bn: null }, { location: 'replace', reload: true });
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
  $scope.toggleCost = function(item) {
    ship.setCostIncluded(item, !item.incCost);
  };

  /**
   * [sortCost description]
   * @param  {[type]} key [description]
   * @return {[type]}     [description]
   */
  $scope.sortCost = function(key) {
    $scope.costDesc = $scope.costPredicate == key ? !$scope.costDesc : $scope.costDesc;
    $scope.costPredicate = key;
  };

  $scope.sortPwr = function(key) {
    $scope.pwrDesc = $scope.pwrPredicate == key ? !$scope.pwrDesc : $scope.pwrDesc;
    $scope.pwrPredicate = key;
  };

  $scope.sortRetrofit = function(key) {
      $scope.retroDesc = $scope.retroPredicate == key ? !$scope.retroDesc : $scope.retroDesc;
      $scope.retroPredicate = key;
  };

  /**
   * Toggle the power on/off for the selected component
   * @param  {object} item The component being toggled
   */
  $scope.togglePwr = function(c) {
    ship.setSlotEnabled(c, !c.enabled);
    updateState(Serializer.fromShip(ship));
  };

  $scope.incPriority = function(c) {
    if (ship.changePriority(c, c.priority + 1)) {
      updateState(Serializer.fromShip(ship));
    }
  };

  $scope.decPriority = function(c) {
    if (ship.changePriority(c, c.priority - 1)) {
      updateState(Serializer.fromShip(ship));
    }
  };

  $scope.fuelChange = function(fuel) {
    $scope.fuel = fuel;
    win.triggerHandler('render');
  };

  $scope.statusRetracted = function(slot) {
    return ship.getSlotStatus(slot, false);
  };

  $scope.statusDeployed = function(slot) {
    return ship.getSlotStatus(slot, true);
  };

  $scope.setRetrofitBase = function() {
    if ($scope.retrofitBuild) {
      Serializer.toShip(retrofitShip, Persist.getBuild(ship.id, $scope.retrofitBuild));
    } else {
      retrofitShip.buildWith(data.defaults);
    }
    updateRetrofitCosts();
  };

  // Utilify functions

  function updateState(code) {
    $scope.code = code;
    $state.go('outfit', { shipId: ship.id, code: $scope.code, bn: $scope.buildName }, { location: 'replace', notify: false });
    $scope.speedSeries.xMax = $scope.trSeries.xMax = $scope.jrSeries.xMax = ship.cargoCapacity;
    $scope.jrSeries.yMax = ship.unladenRange;
    $scope.trSeries.yMax = ship.unladenTotalRange;
    updateRetrofitCosts();
    win.triggerHandler('pwrchange');
  }

  function updateRetrofitCosts() {
    var costs = $scope.retrofitList = [];
    var cName = $rootScope.cName;
    var total = 0, i, l, item;

    if (ship.bulkheads.id != retrofitShip.bulkheads.id) {
      item = {
        buyClassRating: ship.bulkheads.c.class + ship.bulkheads.c.rating,
        buyName: cName(ship.bulkheads),
        sellClassRating: retrofitShip.bulkheads.c.class + retrofitShip.bulkheads.c.rating,
        sellName: cName(retrofitShip.bulkheads),
        netCost: ship.bulkheads.discountedCost - retrofitShip.bulkheads.discountedCost
      };
      costs.push(item);
      total += item.netCost;
    }

    for (var g in { common: 1, internal: 1, hardpoints: 1 }) {
      var retroSlotGroup = retrofitShip[g];
      var slotGroup = ship[g];
      for (i = 0, l = slotGroup.length; i < l; i++) {
        if (slotGroup[i].id != retroSlotGroup[i].id) {
          item = { netCost: 0 };
          if (slotGroup[i].id) {
            item.buyName = cName(slotGroup[i]);
            item.buyClassRating = slotGroup[i].c.class + slotGroup[i].c.rating;
            item.netCost = slotGroup[i].discountedCost;
          }
          if (retroSlotGroup[i].id) {
            item.sellName = cName(retroSlotGroup[i]);
            item.sellClassRating = retroSlotGroup[i].c.class + retroSlotGroup[i].c.rating;
            item.netCost -= retroSlotGroup[i].discountedCost;
          }
          costs.push(item);
          total += item.netCost;
        }
      }
    }
    $scope.retrofitTotal = total;
  }

  $scope.updateCostTab = function(tab) {
    Persist.setCostTab(tab);
    $scope.costTab = tab;
  };

  $scope.pdWarning = function(pd) {
    return pd.enginecapacity < ship.boostEnergy;
  };

  // Hide any open menu/slot/etc if the background is clicked
  $scope.$on('close', function() {
    $scope.selectedSlot = null;
  });

  // Hide any open menu/slot/etc if the background is clicked
  $scope.$on('discountChange', function() {
    ship.applyDiscounts($rootScope.discounts.ship, $rootScope.discounts.components);
    retrofitShip.applyDiscounts($rootScope.discounts.ship, $rootScope.discounts.components);
    updateRetrofitCosts();
  });

}]);
