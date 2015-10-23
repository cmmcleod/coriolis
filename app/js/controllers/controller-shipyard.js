  angular.module('app').controller('ShipyardController', ['$rootScope', '$scope', 'ShipsDB', 'Ship', 'Components', function($rootScope, $scope, ShipsDB, Ship, Components) {
  $rootScope.title = 'Coriolis - Shipyard';
  $scope.shipPredicate = 'properties.name';
  $scope.shipDesc = false;

  function countHp(slot) {
    this.hp[slot.maxClass]++;
    this.hpCount++;
  }

  function countInt(slot) {
    var crEligible = !slot.eligible || slot.eligible.cr;
    this.int[slot.maxClass - 1]++;  // Subtract 1 since there is no Class 0 Internal compartment
    this.intCount++;
    this.maxCargo += crEligible ? Components.findInternal('cr', slot.maxClass, 'E').capacity : 0;
  }

  function shipSummary(shipId, shipData) {
    var summary = angular.copy(shipData.properties);
    var ship = new Ship(shipId, shipData.properties, shipData.slots);
    summary.id = s;
    summary.hpCount = 0;
    summary.intCount = 0;
    summary.maxCargo = 0;
    summary.hp = [0, 0, 0, 0, 0]; // Utility, Small, Medium, Large, Huge
    summary.int = [0, 0, 0, 0, 0, 0, 0, 0]; // Sizes 1 - 8
    // Build Ship
    ship.buildWith(shipData.defaults);              // Populate with stock/default components
    ship.hardpoints.forEach(countHp.bind(summary)); // Count Hardpoints by class
    ship.internal.forEach(countInt.bind(summary));  // Count Internal Compartments by class
    summary.retailCost = ship.totalCost;            // Record Stock/Default/retail cost
    ship.optimizeMass({ pd: '1D' });                // Optimize Mass with 1D PD for maximum possible jump range
    summary.maxJumpRange = ship.unladenRange;          // Record Jump Range
    ship.optimizeMass({ th: ship.standard[1].maxClass + 'A' }); // Optmize mass with Max Thrusters
    summary.topSpeed = ship.topSpeed;
    summary.topBoost = ship.topBoost;

    return summary;
  }

  /* Initialization */

  if (!$rootScope.shipsOverview) {  // Only generate this once
    $rootScope.shipsOverview = [];
    for (var s in ShipsDB) {
      $scope.shipsOverview.push(shipSummary(s, ShipsDB[s]));
    }
  }

  /**
   * Sort ships
   * @param  {object} key Sort predicate
   */
  $scope.sortShips = function(key) {
    $scope.shipDesc = $scope.shipPredicate == key ? !$scope.shipDesc : $scope.shipDesc;
    $scope.shipPredicate = key;
  };

}]);
