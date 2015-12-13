/**
 * This module contains all of the logic and models corresponding to
 * information or behavoir in Elite Dangerous.
 *
 * This file contains values and functions that can be reused across the app.
 *
 * @requires ngLodash
 */
angular.module('shipyard', ['ngLodash'])
  // Create 'angularized' references to DB. This will aid testing
  .constant('ShipsDB', DB.ships)
  .constant('ComponentsDB', DB.components)
  .constant('ArmourMultiplier', [
    1,      // Lightweight
    1.4,    // Reinforced
    1.945,  // Military
    1.945,  // Mirrored
    1.945   // Reactive
  ])
  .constant('SizeMap', ['', 'small', 'medium', 'large', 'capital'])
  // Map to lookup group labels/names for component grp, used for JSON Serialization
  .constant('GroupMap', {
    // Standard
    pp: 'Power Plant',
    t: 'Thrusters',
    fsd: 'Frame Shift Drive',
    ls: 'Life Support',
    pd: 'Power Distributor',
    s: 'Sensors',
    ft: 'Fuel Tank',

    // Internal
    fs: 'Fuel Scoop',
    sc: 'Scanner',
    am: 'Auto Field-Maintenance Unit',
    cr: 'Cargo Rack',
    fi: 'Frame Shift Drive Interdictor',
    hb: 'Hatch Breaker Limpet Controller',
    hr: 'Hull Reinforcement Package',
    rf: 'Refinery',
    scb: 'Shield Cell Bank',
    sg: 'Shield Generator',
    psg: 'Prismatic Shield Generator',
    bsg: 'Bi-Weave Shield Generator',
    dc: 'Docking Computer',
    fx: 'Fuel Transfer Limpet Controller',
    pc: 'Prospector Limpet Controller',
    cc: 'Collector Limpet Controller',
    pv: 'Planetary Vehicle Hangar',

    // Hard Points
    bl: 'Beam Laser',
    ul: 'Burst Laser',
    c: 'Cannon',
    cs: 'Cargo Scanner',
    cm: 'Countermeasure',
    fc: 'Fragment Cannon',
    ws: 'Frame Shift Wake Scanner',
    kw: 'Kill Warrant Scanner',
    nl: 'Mine Launcher',
    ml: 'Mining Laser',
    mr: 'Missile Rack',
    pa: 'Plasma Accelerator',
    mc: 'Multi-cannon',
    pl: 'Pulse Laser',
    rg: 'Rail Gun',
    sb: 'Shield Booster',
    tp: 'Torpedo Pylon'
  })
  .constant('MountMap', {
    'F': 'Fixed',
    'G': 'Gimballed',
    'T': 'Turret',
    'Fixed': 'F',
    'Gimballed': 'G',
    'Turret': 'T'
  })
  /**
   * Array of all Ship properties (facets) organized into groups
   * used for ship comparisons.
   *
   * @type {Array}
   */
  .constant('ShipFacets', [
    {                   // 0
      title: 'agility',
      props: ['agility'],
      unit: '',
      fmt: 'fCrd'
    },
    {                   // 1
      title: 'speed',
      props: ['topSpeed', 'topBoost'],
      lbls: ['thrusters', 'boost'],
      unit: 'm/s',
      fmt: 'fCrd'
    },
    {                   // 2
      title: 'armour',
      props: ['armour'],
      unit: '',
      fmt: 'fCrd'
    },
    {                   // 3
      title: 'shields',
      props: ['shieldStrength'],
      unit: 'MJ',
      fmt: 'fRound'
    },
    {                   // 4
      title: 'jump range',
      props: ['unladenRange', 'fullTankRange', 'ladenRange'],
      lbls: ['max', 'full tank', 'laden'],
      unit: 'LY',
      fmt: 'fRound'
    },
    {                   // 5
      title: 'mass',
      props: ['unladenMass', 'ladenMass'],
      lbls: ['unladen', 'laden'],
      unit: 'T',
      fmt: 'fRound'
    },
    {                   // 6
      title: 'cargo',
      props: ['cargoCapacity'],
      unit: 'T',
      fmt: 'fRound'
    },
    {                   // 7
      title: 'fuel',
      props: ['fuelCapacity'],
      unit: 'T',
      fmt: 'fRound'
    },
    {                   // 8
      title: 'power',
      props: ['powerRetracted', 'powerDeployed', 'powerAvailable'],
      lbls: ['retracted', 'deployed', 'available'],
      unit: 'MW',
      fmt: 'fPwr'
    },
    {                   // 9
      title: 'cost',
      props: ['totalCost'],
      unit: 'CR',
      fmt: 'fCrd'
    },
    {                   // 10
      title: 'total range',
      props: ['unladenTotalRange', 'ladenTotalRange'],
      lbls: ['unladen', 'laden'],
      unit: 'LY',
      fmt: 'fRound'
    },
    {                   // 11
      title: 'DPS',
      props: ['totalDps'],
      lbls: ['DPS'],
      unit: '',
      fmt: 'fRound'
    }
  ])
  /**
   * Set of all available / theoretical discounts
   */
  .constant('Discounts', {
    '0%': 1,
    '5%': 0.95,
    '10%': 0.90,
    '15%': 0.85,
    '20%': 0.80,
    '25%': 0.75
  })
  /**
   * Calculate the maximum single jump range based on mass and a specific FSD
   *
   * @param  {number} mass Mass of a ship: laden, unlanden, partially laden, etc
   * @param  {object} fsd  The FDS object/component with maxfuel, fuelmul, fuelpower, optmass
   * @param  {number} fuel Optional - The fuel consumed during the jump (must be less than the drives max fuel per jump)
   * @return {number}      Distance in Light Years
   */
  .value('calcJumpRange', function(mass, fsd, fuel) {
      return Math.pow(Math.min(fuel === undefined ? fsd.maxfuel : fuel, fsd.maxfuel) / fsd.fuelmul, 1 / fsd.fuelpower ) * fsd.optmass / mass;
  })
  /**
   * Calculate the total range based on mass and a specific FSD, and all fuel available
   *
   * @param  {number} mass Mass of a ship: laden, unlanden, partially laden, etc
   * @param  {object} fsd  The FDS object/component with maxfuel, fuelmul, fuelpower, optmass
   * @param  {number} fuel The total fuel available
   * @return {number}      Distance in Light Years
   */
  .value('calcTotalRange', function(mass, fsd, fuel) {
    var fuelRemaining = fuel % fsd.maxfuel;  // Fuel left after making N max jumps
    var jumps = Math.floor(fuel / fsd.maxfuel);
    mass += fuelRemaining;
    // Going backwards, start with the last jump using the remaining fuel
    var totalRange = fuelRemaining > 0 ? Math.pow(fuelRemaining / fsd.fuelmul, 1 / fsd.fuelpower ) * fsd.optmass / mass : 0;
    // For each max fuel jump, calculate the max jump range based on fuel mass left in the tank
    for (var j = 0; j < jumps; j++) {
      mass += fsd.maxfuel;
      totalRange += Math.pow(fsd.maxfuel / fsd.fuelmul, 1 / fsd.fuelpower ) * fsd.optmass / mass;
    }
    return totalRange;
  })
   /**
   * Calculate the a ships shield strength based on mass, shield generator and shield boosters used.
   *
   * @param  {number} mass       Current mass of the ship
   * @param  {number} shields    Base Shield strength MJ for ship
   * @param  {object} sg         The shield generator used
   * @param  {number} multiplier Shield multiplier for ship (1 + shield boosters if any)
   * @return {number}            Approximate shield strengh in MJ
   */
  .value('calcShieldStrength', function(mass, shields, sg, multiplier) {
    var opt;
    if (mass < sg.minmass) {
      return shields * multiplier * sg.minmul;
    }
    if (mass > sg.maxmass) {
      return shields * multiplier * sg.maxmul;
    }
    if (mass < sg.optmass) {
      opt = (sg.optmass - mass) / (sg.optmass - sg.minmass);
      opt = 1 - Math.pow(1 - opt, 0.87);
      return shields * multiplier * ((opt * sg.minmul) + ((1 - opt) * sg.optmul));
    } else {
      opt = (sg.optmass - mass) / (sg.maxmass - sg.optmass);
      opt = -1 + Math.pow(1 + opt, 2.425);
      return shields * multiplier * ( (-1 * opt * sg.maxmul) + ((1 + opt) * sg.optmul) );
    }
  })
  /**
   * Calculate the a ships speed based on mass, and thrusters.
   *
   * @param  {number} mass        Current mass of the ship
   * @param  {number} baseSpeed   Base speed m/s for ship
   * @param  {number} baseBoost   Base boost speed m/s for ship
   * @param  {object} thrusters   The Thrusters used
   * @param  {number} pipSpeed    Speed pip multiplier
   * @return {object}             Approximate speed by pips
   */
  .value('calcSpeed', function(mass, baseSpeed, baseBoost, thrusters, pipSpeed) {
    var multiplier = mass > thrusters.maxmass ? 0 : ((1 - thrusters.M) + (thrusters.M * Math.pow(3 - (2 * Math.max(0.5, mass / thrusters.optmass)), thrusters.P)));
    var speed = baseSpeed * multiplier;

    return {
      '0 Pips': speed * (1 - (pipSpeed * 4)),
      '2 Pips': speed * (1 - (pipSpeed * 2)),
      '4 Pips': speed,
      'boost': baseBoost * multiplier
    };
  });
