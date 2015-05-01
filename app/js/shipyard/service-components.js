angular.module('shipyard').service('Components', ['lodash', 'ComponentSet', function (_, ComponentSet) {
  var C = DB.components;

  this.cargoScoop = function() {
    return { name: 'Cargo Scoop', class: 1, rating: 'H', power: 0.6};
  }

  this.common = function (typeIndex, componentId) {
    return C.common[typeIndex][componentId];
  };

  this.hardpoints = function(id) {
    var c = _.find(C.hardpoints, function(o) {
      return o[id];
    })
    return c[id];
  };

  this.internal = function(id) {
    var c = _.find(C.internal, function(o) {
      return o[id];
    })
    return c[id];
  };

  this.bulkheads = function(shipId, bulkheadsId) {
    return C.bulkheads[shipId][bulkheadsId];
  };

  this.forShip = function (shipId) {
    var ship = DB.ships[shipId];
    return new ComponentSet(C, ship.properties.mass, ship.slots.common, ship.slots.internal[0], ship.slots.hardpoints[0]);
  };

}]);