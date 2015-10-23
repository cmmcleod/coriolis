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

  function ComponentSet(components, mass, maxStandardArr, maxInternal, maxHardPoint) {
    this.mass = mass;
    this.standard = {};
    this.internal = {};
    this.hardpoints = {};
    this.hpClass = {};
    this.intClass = {};

    this.standard[0] = filter(components.standard[0], maxStandardArr[0], 0, mass);  // Power Plant
    this.standard[2] = filter(components.standard[2], maxStandardArr[2], 0, mass);  // FSD
    this.standard[4] = filter(components.standard[4], maxStandardArr[4], 0, mass);  // Power Distributor
    this.standard[6] = filter(components.standard[6], maxStandardArr[6], 0, mass);  // Fuel Tank

    // Thrusters, filter components by class only (to show full list of ratings for that class)
    var minThrusterClass = _.reduce(components.standard[1], function(minClass, thruster) {
      return (thruster.maxmass >= mass && thruster.class < minClass) ? thruster.class : minClass;
    }, maxStandardArr[1]);
    this.standard[1] = filter(components.standard[1], maxStandardArr[1], minThrusterClass, 0);  // Thrusters

    // Slots where component class must be equal to slot class
    this.standard[3] = filter(components.standard[3], maxStandardArr[3], maxStandardArr[3], 0);     // Life Supprt
    this.standard[5] = filter(components.standard[5], maxStandardArr[5], maxStandardArr[5], mass);  // Sensors

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

  ComponentSet.prototype.lightestPowerDist = function(boostEnergy) {
    var pds = this.standard[4];
    var pd = pds[0];

    for (var i = 1; i < pds.length; i++) {
      if (pds[i].mass < pd.mass && pds[i].enginecapacity >= boostEnergy) {
        pd = pds[i];
      }
    }
    return pd.class + pd.rating;
  };

  ComponentSet.prototype.lightestThruster = function(ladenMass) {
    var ths = this.standard[1];
    var th = ths[0];

    for (var i = 1; i < ths.length; i++) {
      if (ths[i].mass < th.mass && ths[i].maxmass >= ladenMass) {
        th = ths[i];
      }
    }
    return th.class + th.rating;
  };

  ComponentSet.prototype.lightestShieldGenerator = function(hullMass) {
    var sg = null;

    _.forEach(this.internal.sg, function(s) {
      if (sg == null || (s.mass < sg.mass && s.minmass <= hullMass && s.maxmass > hullMass)) {
        sg = s;
      }
    });
    return sg.id;
  };

  ComponentSet.prototype.lightestPowerPlant = function(powerUsed, rating) {
    var pps = this.standard[0];
    var pp = null;

    for (var i = 0; i < pps.length; i++) {
      if (pp == null || (pps[i].mass < pp.mass && pps[i].pGen >= powerUsed)) {
        pp = pps[i];
      }
    }
    return pp.class + (pp.rating != 'D' || rating == 'A' ? 'A' : 'D'); // Use A rated if C,E
  };

  return ComponentSet;

}]);
