angular.module('shipyard').service('Components', ['lodash', 'ComponentsDB', 'ShipsDB', 'ComponentSet', 'Utils',  function (_, C, Ships, ComponentSet, Utils) {

  this.cargoScoop = function() {
    return { name: 'Cargo Hatch', class: 1, rating: 'H', power: 0.6, priority: 1, status: 1};
  };

  this.common = function (typeIndex, componentId) {
    var item = Utils.clone(C.common[typeIndex][componentId]);

    if (item.power) {
      item["priority"] = 1;
      item["status"] = 1;
    }
    return item;
  };

  this.hardpoints = function(id) {
    for (var n in C.hardpoints) {
      var group = C.hardpoints[n];
      for (var i = 0; i < group.length; i++) {
        if (group[i].id == id) {
          var item = Utils.clone(group[i]);
          if (item.power) {
            item["priority"] = 1;
            item["status"] = 1;
            if (!item.passive) {
              item["hardpoint"] = true;
              item.status = 3;
            }
          }
          //console.log(item); DEBUG
          return item;
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
          var item = Utils.clone(group[i]);
          if (item.power) {
            item["priority"] = 1;
            item["status"] = 1;
          }
          //console.log(item); DEBUG
          return item;
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