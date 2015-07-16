describe('Database', function() {

  var shipProperties = ['name', 'manufacturer', 'class', 'hullCost', 'speed', 'boost', 'agility', 'baseShieldStrength', 'baseArmour', 'hullMass', 'masslock'];

  it('has ships and components', function() {
    expect(DB.ships).toBeDefined()
    expect(DB.components.common).toBeDefined();
    expect(DB.components.hardpoints).toBeDefined();
    expect(DB.components.internal).toBeDefined();
    expect(DB.components.bulkheads).toBeDefined();
  });

  it('has unique IDs for every hardpoint', function() {
    var ids = {};
    var groups = DB.components.hardpoints;

    for (var g in groups) {
      var group = groups[g];
      for (var i = 0; i < group.length; i++) {
        var id = group[i].id;
        expect(ids[id]).toBeFalsy('ID already exists: ' + id);
        expect(group[i].grp).toBeDefined('Hardpoint has no group defined, ID:' + id);
        ids[id] = true;
      }
    }
  });

  it('has unique IDs for every internal component', function() {
    var ids = {};
    var groups = DB.components.internal;

    for (var g in groups) {
      var group = groups[g];
      for (var i = 0; i < group.length; i++) {
        var id = group[i].id;
        expect(ids[id]).toBeFalsy('ID already exists: ' + id);
        expect(group[i].grp).toBeDefined('Internal component has no group defined, ID:' + id);
        ids[id] = true;
      }
    }
  });

  it('has data for every ship', function() {
    for (var s in DB.ships) {
      for (var p = 0; p < shipProperties.length; p++) {
        expect(DB.ships[s].properties[shipProperties[p]]).toBeDefined(shipProperties[p] + ' is missing for ' + s);
      }
      expect(DB.ships[s].slots.common.length).toEqual(7, s + ' is missing common slots');
      expect(DB.ships[s].defaults.common.length).toEqual(7, s + ' is missing common defaults');
      expect(DB.ships[s].slots.hardpoints.length).toEqual(DB.ships[s].defaults.hardpoints.length, s + ' hardpoint slots and defaults dont match');
      expect(DB.ships[s].slots.internal.length).toEqual(DB.ships[s].defaults.internal.length, s + ' hardpoint slots and defaults dont match');
      expect(DB.ships[s].retailCost).toBeGreaterThan(DB.ships[s].properties.hullCost, s + ' has invalid retail cost');
      expect(DB.components.bulkheads[s]).toBeDefined(s + ' is missing bulkheads');
    }
  });

  it('has components with a group defined', function() {
    for (var i = 0; i < DB.components.common.length; i++) {
      var group = DB.components.common[i];
      for (var c in group) {
        expect(group[c].grp).toBeDefined('Common component has no group defined, Type: ' + i + ', ID: ' + c);
      }
    }
  });

});
