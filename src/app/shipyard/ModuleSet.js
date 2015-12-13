

function filter(arr, maxClass, minClass, mass) {
  return arr.filter(m => m.class <= maxClass && m.class >= minClass && (m.maxmass === undefined || mass <= m.maxmass));
}

function filterToArray(data, maxClass, minClass, mass) {
  let arr = [];

  for (let id in data) {
    let m = data[id];
    if (m.class <= maxClass && m.class >= minClass && (m.maxmass === undefined || mass <= m.maxmass)) {
      arr.push(m);
    }
  }

  return arr;
}

export default class ModuleSet {

  constructor(modules, mass, maxStandardArr, maxInternal, maxHardPoint) {
    this.mass = mass;
    this.standard = {};
    this.internal = {};
    this.hardpoints = {};
    this.hpClass = {};
    this.intClass = {};

    this.standard[0] = filterToArray(modules.standard[0], maxStandardArr[0], 0, mass);  // Power Plant
    this.standard[2] = filterToArray(modules.standard[2], maxStandardArr[2], 0, mass);  // FSD
    this.standard[4] = filterToArray(modules.standard[4], maxStandardArr[4], 0, mass);  // Power Distributor
    this.standard[6] = filterToArray(modules.standard[6], maxStandardArr[6], 0, mass);  // Fuel Tank

    // Thrusters, filter modules by class only (to show full list of ratings for that class)
    let ths = modules.standard[1];
    let minThrusterClass = Object.keys(modules.standard[1]).reduce(
      (clazz, thId) => (ths[thId].maxmass >= mass && ths[thId].class < clazz) ? ths[thId].class : clazz,
      maxStandardArr[1]
    );
    this.standard[1] = filterToArray(modules.standard[1], maxStandardArr[1], minThrusterClass, 0);  // Thrusters

    // Slots where module class must be equal to slot class
    this.standard[3] = filterToArray(modules.standard[3], maxStandardArr[3], maxStandardArr[3], 0);     // Life Supprt
    this.standard[5] = filterToArray(modules.standard[5], maxStandardArr[5], maxStandardArr[5], mass);  // Sensors

    for (let h in modules.hardpoints) {
      this.hardpoints[h] = filter(modules.hardpoints[h], maxHardPoint, 0, mass);
    }

    for (let g in modules.internal) {
      this.internal[g] = filter(modules.internal[g], maxInternal, 0, mass);
    }
  }

  /**
   * Determine the modules that areeligible for an internal slot
   * @param  {integer} c        The max class module that can be mounted in the slot
   * @param  {Object} eligible) The map of eligible internal groups
   * @return {object}           A map of all eligible modules by group
   */
  getInts(c, eligible) {
    let o = {};
    for (let key in this.internal) {
      if (eligible && !eligible[key]) {
        continue;
      }
      let data = filter(this.internal[key], c, 0, this.mass);
      if (data.length) {  // If group is not empty
        o[key] = data;
      }
    }
    return o;
  }

  /**
   * Determining the modules that are eligible for an hardpoint slot
   * @param  {integer} c        The max class module that can be mounted in the slot
   * @param  {Object} eligible) The map of eligible hardpoint groups
   * @return {object}           A map of all eligible modules by group
   */
  getHps(c, eligible) {
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
  }

  lightestPowerDist(boostEnergy) {
    var pd = this.standard[4][0];

    for (let p of this.standard[4]) {
      if (p.mass < pd.mass && p.enginecapacity >= boostEnergy) {
        pd = p;
      }
    }
    return pd;
  };

  lightestThruster(ladenMass) {
    var th = this.standard[1][0];

    for (let t of this.standard[1]) {
      if (t.mass < th.mass && t.maxmass >= ladenMass) {
        th = t;
      }
    }
    return th;
  };

  lightestShieldGenerator(hullMass) {
    var sg = this.internal.sg[0];

    for (let s of this.internal.sg) {
      if (s.mass < sg.mass && s.minmass <= hullMass && s.maxmass > hullMass) {
        sg = s;
      }
    }
    return sg;
  };

  lightestPowerPlant(powerNeeded, rating) {
    var pp = this.standard[0][0];

    for (let p of this.standard[0]) {
      // Provides enough power, is lighter or the same mass as current power plant but better output/efficiency
      if (p.pGen >= powerNeeded && (p.mass < pp.mass || (p.mass == pp.mass && p.pGen > pp.pGen))) {
        pp = p;
      }
    }
    return pp;
  }
}
