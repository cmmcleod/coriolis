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

  $scope.jrSeries = {
    xMin: 0,
    xMax: ship.cargoCapacity,
    // Slightly higher than actual based bacuse components are excluded
    yMax: ship.jumpRangeWithMass(ship.unladenMass),
    yMin: 0,
    func: function(cargo) { // X Axis is Cargo
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
  $scope.bnChange = function(){
    $scope.savedCode = Persist.getBuild(ship.id, $scope.buildName);
  };

  /**
   * Toggle cost of the selected component
   * @param  {object} item The component being toggled
   */
  $scope.toggleCost = function(item) {
    item.incCost = !item.incCost;
    ship.updateTotals();
  };

  /**
   * Toggle the power on/off for the selected component
   * @param  {object} item The component being toggled
   */
  $scope.togglePwr = function(item) {
    item.enabled = !item.enabled;
    if (item.hardpoint) {
      if (item.deployed && item.enabled)
        item.status = 2;
      else if (!item.enabled)
        item.status = 0;
      else
        item.status = 3
    }
    else if (item.enabled)
      item.status = 2;
    else
      item.status = 0;
    ship.updateTotals();
    $scope.updatePriority();
  };

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
    $scope.updatePriority();
  }

  $scope.toggleHardpoint = function () {
    $scope.ship.deployed = !$scope.ship.deployed;

    for (var i = 0; i < $scope.ship.hardpoints.length; i++) {
      var item = $scope.ship.hardpoints[i];

       item.deployed = $scope.ship.deployed;
       if (item.enabled && item.deployed)
         item.status = 2;
       else if (!item.enabled)
          item.status = 0;
       else
         item.status = 3;
    };

    $scope.updatePriority();
  };

  $scope.upPriority = function (item) {
    if (item.priority == 5)
      return;
    item.priority += 1;
    $scope.updatePriority();
  }

  $scope.downPriority = function (item) {
    if (item.priority == 1)
      return;
    item.priority -= 1;
    $scope.updatePriority();
  }

  function collectPowered() {
    var items = [];

    // STANDARD
    for (var i = 0; i < $scope.ship.common.length; i++) {
      var item = $scope.ship.common[i];

      if (item.enabled && item.c.power) {
        items.push(item);
      }
    };

    // CARGO SCOOP
    if ($scope.ship.cargoScoop.enabled)
      items.push($scope.ship.cargoScoop);

    // HARDPOINTS
    for (var i = 0; i < $scope.ship.hardpoints.length; i++) {
      var item = $scope.ship.hardpoints[i];

      if (item.enabled && item.hardpoint == true && item.deployed == true && item.c.power)
        items.push(item);
    };

    // INTERNAL
    for (var i = 0; i < $scope.ship.internal.length; i++) {
      var item = $scope.ship.internal[i];

      if (item.enabled && item.c.power)
        items.push(item);
    };

    return items;
  }

  $scope.updatePriority = function () {
    var priorityArray = [0, 0, 0, 0, 0];
    var poweredArray = collectPowered();
    var minimal = 0;

    for (var i = 0; i < poweredArray.length; i++) {
      var item = poweredArray[i];

      priorityArray[item.priority - 1] += item.c.power;
    };

    priorityArray[1] += priorityArray[0];
    priorityArray[2] += priorityArray[1];
    priorityArray[3] += priorityArray[2];
    priorityArray[4] += priorityArray[3];

    for (var i = 0; i < priorityArray.length; i++) {
      if (priorityArray[i] <= $scope.pp.c.pGen)
        minimal = i + 1;
      else
        break;
    };

    for (var i = 0; i < poweredArray.length; i++) {
      var item = poweredArray[i];

      if (item.priority > minimal)
        item.status = 1;
      else
        item.status = 2;
    };

    console.log(priorityArray);
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
