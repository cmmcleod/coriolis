angular.module('shipyard').service('Components', ['lodash', 'ComponentsDB', 'ShipsDB', 'ComponentSet', function (_, C, Ships, ComponentSet) {

  this.cargoScoop = function() {
    return { name: 'Cargo Scoop', class: 1, rating: 'H', power: 0.6};
  }

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

  this.bulkheads = function(shipId, bulkheadsId) {
    return C.bulkheads[shipId][bulkheadsId];
  };

  this.forShip = function (shipId) {
    var ship = Ships[shipId];
    return new ComponentSet(C, ship.properties.mass, ship.slots.common, ship.slots.internal[0], ship.slots.hardpoints[0]);
  };

}]);