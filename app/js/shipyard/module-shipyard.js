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
    fi:'Frame Shift Drive Interdictor',
    hb:'Hatch Breaker Limpet Controller',
    hr:'Hull Reinforcement Package',
    rf:'Refinery',
    sb:'Shield Cell Bank',
    sg:'Shield Generator',
    dc:'Docking Computer'
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
  .factory('commonMap', ['commonArray', function (commonArray) {
    var commonMap = {};
    for(var i = 0; i < commonArray.length; i++) {
      commonMap[commonArray[i]] = i;
    }
    return commonMap;
  }])
  .value('hardPointClass', [
    'Utility',
    'Small',
    'Medium',
    'Large',
    'Huge'
  ])
  .factory('hardpointGroup', function () {
    function groupToLabel (grp) {
      var a = grp.toLowerCase().split('');
      var l = [];
      switch(a[0]) {
        case 's':
          l.push('Small');
          break;
        case 'm':
          l.push('Medium');
          break;
        case 'l':
          l.push('Large');
          break;
        case 'h':
          l.push('Huge');
          break;
        case 'u':
          l.push('Utility');
          break;
      }
      switch(a[1]) {
        case 'o':
          l.push('Other');
          break;
        case 'k':
          l.push('Kinetic');
          break;
        case 't':
          l.push('Thermal');
          break;
        case 's':
          l.push('Scanner');
          break;
        case 'b':
          l.push('Booster');
          break;
        case 'm':
          l.push('Mount');
          break;
      }
      return l.join(' ');
    }

    return  groupToLabel;
  })
  .factory('CalcJumpRange', function() {
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
  .factory('CalcShieldStrength', function() {
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
