angular.module('shipyard').factory('components', ['lodash', 'commonMap','commonArray', function (_, CMap) {
  var C = DB.components;

  function ComponentSet(shipId) {
    var ship = DB.ships[shipId];
    var maxInternal = ship.componentCapacity.internal[0];

    this.mass = ship.mass;
    this.common = {};
    this.internal = {};
    this.hardpoints = filter(C.hardpoints, ship.componentCapacity.hardpoints[0], 0, ship.mass);
    this.bulkheads = C.bulkheads[shipId];
    this.hpClass = {};
    this.intClass = {};

    for (var i = 0; i < C.common.length; i ++) {
      var max = ship.componentCapacity.common[i];
      switch (i) {
        case 3: // Life Support
        case 5: // Sensors
          this.common[i] = filter(C.common[i], max, max, ship.mass);
          break;
        default:
          this.common[i] = filter(C.common[i], max, 0, ship.mass);
      }

    }

    for(var g in C.internal) {
      this.internal[g] = filter(C.internal[g], maxInternal, 0, ship.mass);
    }
  }

  ComponentSet.prototype.getHps = function(c) {
    if(!this.hpClass[c]) {
      this.hpClass[c] = filter(this.hardpoints, c, c? 1 : 0, this.mass);
    }
    return this.hpClass[c];
  };

  ComponentSet.prototype.getInts = function(c) {
    if(!this.intClass[c]) {
      var o = this.intClass[c] =  {};
      for(var key in this.internal) {
        var data = filter(this.internal[key], c, 0, this.mass);
        if(Object.keys(data).length) {
          o[key] = data;
        }
      }
    }
    return this.intClass[c];
  };

  function filter (data, maxClass, minClass, mass) {
    var set = {};
    _.forEach(data, function (c,id) {
      if (c.class <= maxClass && c.class >= minClass
          && (c.maxmass === undefined || mass <= c.maxmass) ) {
          //&& (c.minmass === undefined || mass  >= c.minmass) ) { // Min mass needs fixed
        set[id] = c;
      }
    });
    return set;
  }

  return {
    forShip: function (shipId) {
      return new ComponentSet(shipId);
    }
  };

}]);
