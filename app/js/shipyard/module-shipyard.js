/**
 * This module contains all of the logic and models corresponding to
 * information or behavoir in Elite Dangerous.
 *
 * This file contains values and functions that can be reused across the app.
 */
angular.module('shipyard', [])
  .value('commonArray', [
    'Power Plant',
    'Thrusters',
    'Frame Shift Drive',
    'Life Support',
    'Power Distributor',
    'Sensors',
    'Fuel Tank'
  ])
  .value('internalGroupMap', {
    fs:'Fuel Scoop',
    sc:'Scanners',
    am:'Auto Field-Maintenance Unit',
    cr:'Cargo Racks',
    fi:'FSD Interdictor',
    hb:'Hatch Breaker Limpet Ctrl',
    hr:'Hull Reinforcement Package',
    rf:'Refinery',
    sb:'Shield Cell Bank',
    sg:'Shield Generator',
    dc:'Docking Computer'
  })
  .value('hardpointsGroupMap', {
    'bl': "Beam Laser",
    'ul': "Burst Laser",
    'c': "Cannon",
    'cs': "Cargo Scanner",
    'cm': "Countermeasure",
    'fc': "Fragment Cannon",
    'fs': "Frame Shift Wake Scanner",
    'kw': "Kill Warrant Scanner",
    'nl': "Mine Launcher",
    'ml': "Mining Laser",
    'mr': "Missile Rack",
    'pa': "Plasma Accelerator",
    'mc': "Multi-cannon",
    'pl': "Pulse Laser",
    'rg': "Rail Gun",
    'sb': "Shield Booster",
    'tp': "Torpedo Pylon"
  })
  .value('shipPurpose', {
    mp: 'Multi Purpose',
    fr: 'Freighter',
    ex: 'Explorer',
    co: 'Combat',
    pa: 'Passenger Transport'
  })
  .value('shipSize', [
    'N/A',
    'Small',
    'Medium',
    'Large',
    'Capital',
  ])
  .value('hardPointClass', [
    'Utility',
    'Small',
    'Medium',
    'Large',
    'Huge'
  ])
  .factory('calcJumpRange', function() {
    /**
     * Calculate the maximum single jump range based on mass and a specific FSD
     * @param  {number} mass Mass of a ship: laden, unlanden, partially laden, etc
     * @param  {object} fsd  The FDS object/component with maxfuel, fuelmul, fuelpower, optmass
     * @param  {number} fuel Optional - The fuel consumed during the jump (must be less than the drives max fuel per jump)
     * @return {number}      Distance in Light Years
     */
    return function(mass, fsd, fuel) {
      return Math.pow(Math.min(fuel || Infinity, fsd.maxfuel) / fsd.fuelmul, 1 / fsd.fuelpower ) * fsd.optmass / mass;
    };
  })
  .factory('calcShieldStrength', function() {
     /**
     * Calculate the a ships shield strength based on mass, shield generator and shield boosters used.
     *
     * @private
     * @param  {number} mass       Current mass of the ship
     * @param  {number} shields    Base Shield strength MJ for ship
     * @param  {object} sg         The shield generator used
     * @param  {number} multiplier Shield multiplier for ship (1 + shield boosters if any)
     * @return {number}            Approximate shield strengh in MJ
     */
    return function (mass, shields, sg, multiplier) {
      if (!sg) {
        return 0;
      }
      if (mass <= sg.minmass) {
        return shields * multiplier * sg.minmul;
      }
      if (mass < sg.optmass) {
        return shields * multiplier * (sg.minmul + (mass - sg.minmass) / (sg.optmass - sg.minmass) * (sg.optmul - sg.minmul));
      }
      if (mass < sg.maxmass) {
        return shields * multiplier * (sg.optmul + (mass - sg.optmass) / (sg.maxmass - sg.optmass) * (sg.maxmul - sg.optmul));
      }
      return shields * multiplier * sg.maxmul;
    }
  });
