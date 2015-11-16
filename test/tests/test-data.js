describe('Database', function() {

  var shipProperties = [
    'name',
    'manufacturer',
    'class',
    'hullCost',
    'speed',
    'boost',
    'boostEnergy',
    'agility',
    'baseShieldStrength',
    'baseArmour',
    'hullMass',
    'masslock',
    'pipSpeed'
  ];

  var eddbModules = __json__['fixtures/eddb-modules'];
  var eddbIdToModule = {};

  for (var e = 0; e < eddbModules.length; e++) {
    eddbIdToModule[eddbModules[e].id] = eddbModules[e];
  }

  function validateEDDBId (category, component) {
    var id = component.id;
    expect(component.eddbID).toBeDefined(category + ' ' + id + ' is missing EDDB ID');
    var eddbModule = eddbIdToModule[component.eddbID];

    expect(eddbModule).toBeDefined(category + ' [' + id + ']: no EDDB Module found for EDDB ID ' + component.eddbID);
    expect(component.class == eddbModule.class).toBeTruthy(category + ' [' + id + '] class does not match ' + component.eddbID);
    expect(component.rating == eddbModule.rating).toBeTruthy(category + ' [' + id + '] rating does not match ' + component.eddbID);
    expect(component.mode === undefined || component.mode == eddbModule.weapon_mode.charAt(0))
        .toBeTruthy(category + ' [' + id + '] mode/mount does not match ' + component.eddbID);
    expect(component.name === undefined || (component.name == eddbModule.name || component.name == eddbModule.group.name))
        .toBeTruthy(category + ' [' + id + '] name does not match ' + component.eddbID);
  }

  it('has ships and components', function() {
    expect(DB.ships).toBeDefined()
    expect(DB.components.standard).toBeDefined();
    expect(DB.components.hardpoints).toBeDefined();
    expect(DB.components.internal).toBeDefined();
    expect(DB.components.bulkheads).toBeDefined();
  });

  xit('has same number of components as EDDB', function() {
    var totalComponentCount = 0, g;
    for (g = 0; g < DB.components.standard.length; g++) {
      var group = DB.components.standard[g];
      for (var i in group) {
        totalComponentCount++;
      }
    }
    for (g in DB.components.bulkheads) {
        totalComponentCount += 5;
    }
    for (g in DB.components.hardpoints) {
      totalComponentCount += DB.components.hardpoints[g].length;
    }
    for (g in DB.components.internal) {
      if (g != 'ft') {  // EDDB does not have internal fuel tanks listed seperately
        totalComponentCount += DB.components.internal[g].length;
      }
    }
    expect(totalComponentCount).toEqual(eddbModules.length, 'Component count mismatch with EDDB');
  });

  it('has valid standard components', function() {
    var ids = {};
    for (var i = 0; i < DB.components.standard.length; i++) {
      var group = DB.components.standard[i];
      for (var c in group) {
        var id = group[c].mid;
        expect(ids[id]).toBeFalsy('ID already exists: ' + id);
        expect(group[c].eddbID).toBeDefined('Standard component' + id + ' is missing EDDB ID');
        //validateEDDBId('Standard', group[c]);
        expect(group[c].grp).toBeDefined('Standard component has no group defined, Type: ' + i + ', ID: ' + c);
        ids[id] = true;
      }
    }

    for (var s in DB.components.bulkheads) {
      var bulkheadSet = DB.components.bulkheads[s];
      for (var b in bulkheadSet) {
        var id = bulkheadSet[b].id;
        expect(ids[id]).toBeFalsy('ID already exists: ' + id);
        expect(bulkheadSet[b].eddbID).toBeDefined('Bulkhead component' + id + ' is missing EDDB ID');
        //validateEDDBId('Bulkheads', group[c]);
        expect(bulkheadSet[b].cost).toBeDefined('Bulkhead has no cost defined, ID: ' + id);
        expect(bulkheadSet[b].mass).toBeDefined('Bulkhead has no mass defined, ID: ' + id);
        ids[id] = true;
      }
    }

  });

  it('has valid hardpoints', function() {
    var ids = {};
    var groups = DB.components.hardpoints;

    for (var g in groups) {
      var group = groups[g];
      for (var i = 0; i < group.length; i++) {
        var id = group[i].id;
        expect(ids[id]).toBeFalsy('ID already exists: ' + id);
        expect(group[i].grp).toBeDefined('Hardpoint has no group defined, ID:' + id);
        //validateEDDBId('Hardpoint', group[i]);
        ids[id] = true;
      }
    }
  });

  it('has valid internal components', function() {
    var ids = {};
    var groups = DB.components.internal;

    for (var g in groups) {
      var group = groups[g];
      for (var i = 0; i < group.length; i++) {
        var id = group[i].id;
        expect(ids[id]).toBeFalsy('ID already exists: ' + id);
        expect(group[i].grp).toBeDefined('Internal component has no group defined, ID:' + id);
        //validateEDDBId('Internal', group[i]);
        ids[id] = true;
      }
    }
  });

  it('has data for every ship', function() {
    for (var s in DB.ships) {
      for (var p = 0; p < shipProperties.length; p++) {
        expect(DB.ships[s].properties[shipProperties[p]]).toBeDefined(shipProperties[p] + ' is missing for ' + s);
      }
      expect(DB.ships[s].eddbID).toBeDefined(s + ' is missing EDDB ID');
      expect(DB.ships[s].slots.standard.length).toEqual(7, s + ' is missing standard slots');
      expect(DB.ships[s].defaults.standard.length).toEqual(7, s + ' is missing standard defaults');
      expect(DB.ships[s].slots.hardpoints.length).toEqual(DB.ships[s].defaults.hardpoints.length, s + ' hardpoint slots and defaults dont match');
      expect(DB.ships[s].slots.internal.length).toEqual(DB.ships[s].defaults.internal.length, s + ' internal slots and defaults dont match');
      expect(DB.ships[s].retailCost).toBeGreaterThan(DB.ships[s].properties.hullCost, s + ' has invalid retail cost');
      expect(DB.components.bulkheads[s]).toBeDefined(s + ' is missing bulkheads');
    }
  });

});
