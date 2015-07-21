angular.module('shipyard').factory('ComponentSet', ['lodash', function(_) {

  function filter(data, maxClass, minClass, mass) {
    return _.filter(data, function(c) {
      return c.class <= maxClass && c.class >= minClass && (c.maxmass === undefined || mass <= c.maxmass);
    });
  }

  function getKey(maxClass, eligible) {
    if (eligible) {
      return maxClass + Object.keys(eligible).join('-');
    }
    return maxClass;
  }

  function ComponentSet(components, mass, maxCommonArr, maxInternal, maxHardPoint) {
    this.mass = mass;
    this.common = {};
    this.internal = {};
    this.hardpoints = {};
    this.hpClass = {};
    this.intClass = {};

    this.common[0] = filter(components.common[0], maxCommonArr[0], 0, mass);  // Power Plant
    this.common[2] = filter(components.common[2], maxCommonArr[2], 0, mass);  // FSD
    this.common[4] = filter(components.common[4], maxCommonArr[4], 0, mass);  // Power Distributor
    this.common[6] = filter(components.common[6], maxCommonArr[6], 0, mass);  // Fuel Tank

    // Thrusters, filter components by class only (to show full list of ratings for that class)
    var minThrusterClass = _.reduce(components.common[1], function(minClass, thruster) {
      return (thruster.maxmass >= mass && thruster.class < minClass) ? thruster.class : minClass;
    }, maxCommonArr[1]);
    this.common[1] = filter(components.common[1], maxCommonArr[1], minThrusterClass, 0);  // Thrusters

    // Slots where component class must be equal to slot class
    this.common[3] = filter(components.common[3], maxCommonArr[3], maxCommonArr[3], 0);     // Life Supprt
    this.common[5] = filter(components.common[5], maxCommonArr[5], maxCommonArr[5], mass);  // Sensors

    for (var h in components.hardpoints) {
      this.hardpoints[h] = filter(components.hardpoints[h], maxHardPoint, 0, mass);
    }

    for (var g in components.internal) {
      this.internal[g] = filter(components.internal[g], maxInternal, 0, mass);
    }

    /**
     * Create a memoized function for determining the components that are
     * eligible for an internal slot
     * @param  {integer} c        The max class component that can be mounted in the slot
     * @param  {Object} eligible) The map of eligible internal groups
     * @return {object}           A map of all eligible components by group
     */
    this.getInts = _.memoize(
      function(c, eligible) {
        var o = {};
        for (var key in this.internal) {
          if (eligible && !eligible[key]) {
            continue;
          }
          var data = filter(this.internal[key], c, 0, this.mass);
          if (data.length) {  // If group is not empty
            o[key] = data;
          }
        }
        return o;
      },
      getKey
    );

    /**
     * Create a memoized function for determining the components that are
     * eligible for an hardpoint slot
     * @param  {integer} c        The max class component that can be mounted in the slot
     * @param  {Object} eligible) The map of eligible hardpoint groups
     * @return {object}           A map of all eligible components by group
     */
    this.getHps = _.memoize(
      function(c, eligible) {
        var o = {};
        for (var key in this.hardpoints) {
          if (eligible && !eligible[key]) {
            continue;
          }
          var data = filter(this.hardpoints[key], c, c ? 1 : 0, this.mass);
          if (data.length) {  // If group is not empty
            o[key] = data;
          }
        }
        return o;
      },
      getKey
    );

  }

  return ComponentSet;

}]);
