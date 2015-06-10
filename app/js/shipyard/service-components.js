angular.module('shipyard').service('Components', ['lodash', 'ComponentsDB', 'ShipsDB', 'ComponentSet', function (_, C, Ships, ComponentSet) {

  this.cargoScoop = function() {
    return { name: 'Cargo Hatch', class: 1, rating: 'H', power: 0.6};
  };

  this.common = function (typeIndex, componentId) {
    return C.common[typeIndex][componentId];
  };

  this.hardpoints = function(id) {
    for (var n in C.hardpoints) {
      var group = C.hardpoints[n];
      for (var i = 0; i < group.length; i++) {
        if (group[i].id == id) {
          return group[i];
        }
      }
    }
    return null;
  };

  this.internal = function(id) {
    for (var n in C.internal) {
      var group = C.internal[n];
      for (var i = 0; i < group.length; i++) {
        if (group[i].id == id) {
          return group[i];
        }
      }
    }
    return null;
  };

  /**
   * Looks up the bulkhead component for a specific ship and bulkhead
   * @param  {string} shipId       Unique ship Id/Key
   * @param  {number} bulkheadsId  Id/Index for the specified bulkhead
   * @return {object}             The bulkhead component object
   */
  this.bulkheads = function(shipId, bulkheadsId) {
    return C.bulkheads[shipId][bulkheadsId];
  };

  /**
   * Creates a new ComponentSet that contains all available components
   * that the specified ship is eligible to use.
   *
   * @param  {string} shipId    Unique ship Id/Key
   * @return {ComponentSet}     The set of components the ship can install
   */
  this.forShip = function (shipId) {
    var ship = Ships[shipId];
    return new ComponentSet(C, ship.properties.mass + 5, ship.slots.common, ship.slots.internal[0], ship.slots.hardpoints[0]);
  };

}]);