angular.module('shipyard').service('Components', ['lodash', 'ComponentsDB', 'ShipsDB', 'ComponentSet', function(_, C, Ships, ComponentSet) {

  this.cargoScoop = function() {
    return { name: 'Cargo Hatch', class: 1, rating: 'H', power: 0.6 };
  };

  this.common = function(typeIndex, componentId) {
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

  this.findInternalId = function(groupName, clss, rating, name) {
    var group = C.internal[groupName];

    if (!group) {
      throw 'Invalid internal group: ' + groupName;
    }

    for (var i = 0, l = group.length; i < l; i++) {
      if (group[i].class == clss && group[i].rating == rating && ((!name && !group[i].name) || group[i].name == name)) {
        return group[i].id;
      }
    }

    return 0;
  };

  this.findHardpointId = function(groupName, clss, rating, name, mode, missile) {
    var group = C.hardpoints[groupName];

    if (!group) {
      throw 'Invalid hardpoint group: ' + groupName;
    }

    for (var i = 0, l = group.length; i < l; i++) {
      if (group[i].class == clss && group[i].rating == rating && group[i].mode == mode
          && ((!name && !group[i].name) || group[i].name == name)
          && ((!missile && !group[i].missile) || group[i].missile == missile)
          ) {
        return group[i].id;
      }
    }

    return 0;
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

  this.bulkheadIndex = function(bulkheadName) {
    return ['Lightweight Alloy', 'Reinforced Alloy', 'Military Grade Composite', 'Mirrored Surface Composite', 'Reactive Surface Composite'].indexOf(bulkheadName);
  };

  /**
   * Creates a new ComponentSet that contains all available components
   * that the specified ship is eligible to use.
   *
   * @param  {string} shipId    Unique ship Id/Key
   * @return {ComponentSet}     The set of components the ship can install
   */
  this.forShip = function(shipId) {
    var ship = Ships[shipId];
    var maxInternal = isNaN(ship.slots.internal[0]) ? ship.slots.internal[0].class : ship.slots.internal[0];
    return new ComponentSet(C, ship.minMassFilter || ship.properties.hullMass + 5, ship.slots.common, maxInternal, ship.slots.hardpoints[0]);
  };

}]);
