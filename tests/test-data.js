var data = require('../app/db.json');

var shipProperties = ["grp", "name", "manufacturer", "class", "cost", "speed", "boost", "agility", "shields", "armour", "fuelcost", "mass"];

describe("Database", function() {

  it("has ships and components", function() {
    expect(data.ships).toBeDefined()
    expect(data.components.common).toBeDefined();
    expect(data.components.hardpoints).toBeDefined();
    expect(data.components.internal).toBeDefined();
    expect(data.components.bulkheads).toBeDefined();
  });

  it("has unique IDs for every hardpoint", function() {
    var ids = {};
    var groups = data.components.hardpoints;

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

  it("has valid internal components", function() {
    var ids = {};
    var groups = data.components.internal;

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

  it("has data for every ship", function() {
    for (var s in data.ships) {
      for (var p = 0; p < shipProperties.length; p++) {
        expect(data.ships[s].properties[shipProperties[p]]).toBeDefined(shipProperties[p] + ' is missing for ' + s);
      }
      expect(data.ships[s].slots.common.length).toEqual(7, s + ' is missing common slots');
      expect(data.ships[s].defaults.common.length).toEqual(7, s + ' is missing common defaults');
      expect(data.ships[s].slots.hardpoints.length).toEqual(data.ships[s].defaults.hardpoints.length, s + ' hardpoint slots and defaults dont match');
      expect(data.ships[s].slots.internal.length).toEqual(data.ships[s].defaults.internal.length, s + ' hardpoint slots and defaults dont match');
      expect(data.ships[s].retailCost).toBeGreaterThan(data.ships[s].properties.cost, s + ' has invalid retail cost');
      expect(data.components.bulkheads[s]).toBeDefined(s + ' is missing bulkheads');
    }
  });

  it("has components with a group defined", function() {
    for (var i = 0; i < data.components.common.length; i++) {
      var group = data.components.common[i];
      for (var c in group) {
        expect(group[c].grp).toBeDefined('Common component has no group defined, Type: ' + i + ', ID: ' + c);
      }
    }
  });

});
