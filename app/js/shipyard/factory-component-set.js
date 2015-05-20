angular.module('shipyard').factory('ComponentSet', ['lodash', function (_) {

  function ComponentSet(components, mass, maxCommonArr, maxInternal, maxHardPoint) {
    this.mass = mass;
    this.common = {};
    this.internal = {};
    this.hardpoints = {};
    this.hpClass = {};
    this.intClass = {};

    for (var i = 0; i < components.common.length; i ++) {
      var max = maxCommonArr[i];
      switch (i) {
        // Slots where component class must be equal to slot class
        case 3: // Life Support
        case 5: // Sensors
          this.common[i] = filter(components.common[i], max, max, this.mass);
          break;
        // Other slots can have a component of class lower than the slot class
        default:
          this.common[i] = filter(components.common[i], max, 0, this.mass);
      }
    }

    for(var h in components.hardpoints) {
      this.hardpoints[h] = filter(components.hardpoints[h], maxHardPoint, 0, this.mass);
    }

    for(var g in components.internal) {
      this.internal[g] = filter(components.internal[g], maxInternal, 0, this.mass);
    }
  }

  ComponentSet.prototype.getHps = function(c) {
    if(!this.hpClass[c]) {
      var o = this.hpClass[c] =  {};
      for(var key in this.hardpoints) {
        var data = filter(this.hardpoints[key], c, c? 1 : 0, this.mass);
        if(data.length) {  // If group is not empty
          o[key] = data;
        }
      }
    }
    return this.hpClass[c];
  };

  ComponentSet.prototype.getInts = function(c) {
    if(!this.intClass[c]) {
      var o = this.intClass[c] =  {};
      for(var key in this.internal) {
        var data = filter(this.internal[key], c, 0, this.mass);
        if(data.length) {  // If group is not empty
          o[key] = data;
        }
      }
    }
    return this.intClass[c];
  };

  function filter (data, maxClass, minClass, mass) {
    return _.filter(data, function (c) {
      return c.class <= maxClass && c.class >= minClass && (c.maxmass === undefined || mass <= c.maxmass);
    });
  }

  return ComponentSet;

}]);
