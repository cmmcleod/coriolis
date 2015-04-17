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
  });