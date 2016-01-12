import { ModuleGroupToName, MountMap, BulkheadNames } from './Constants';
import { Ships } from 'coriolis-data';
import Ship from './Ship';
import ModuleUtils from './ModuleUtils';
import LZString from 'lz-string';

/**
 * Service managing seralization and deserialization of models for use in URLs and persistene.
 */

function slotToSchema(slot) {
  if (slot.m) {
    let o = {
      class: slot.m.class,
      rating: slot.m.rating,
      enabled: Boolean(slot.enabled),
      priority: slot.priority + 1,
      group: ModuleGroupToName[slot.m.grp]
    };

    if (slot.m.name) {
      o.name = slot.m.name;
    }
    if (slot.m.mount) {
      o.mount = MountMap[slot.m.mount];
    }
    if (slot.m.missile) {
      o.missile = slot.m.missile;
    }
    return o;
  }
  return null;
}

export function toDetailedBuild(buildName, ship, code) {
  var standard = ship.standard,
      hardpoints = ship.hardpoints,
      internal = ship.internal;

  var data = {
    $schema: 'http://cdn.coriolis.io/schemas/ship-loadout/3.json#',
    name: buildName,
    ship: ship.name,
    references: [{
      name: 'Coriolis.io',
      url: `http://coriolis.io/outfit/${ship.id}/${code}?bn=${encodeURIComponent(buildName)}`,
      code: code,
      shipId: ship.id
    }],
    components: {
      standard: {
        bulkheads: BulkheadNames[ship.bulkheads.index],
        cargoHatch: { enabled: Boolean(ship.cargoHatch.enabled), priority: ship.cargoHatch.priority + 1 },
        powerPlant: { class: standard[0].m.class, rating: standard[0].m.rating, enabled: Boolean(standard[0].enabled), priority: standard[0].priority + 1 },
        thrusters: { class: standard[1].m.class, rating: standard[1].m.rating, enabled: Boolean(standard[1].enabled), priority: standard[1].priority + 1 },
        frameShiftDrive: { class: standard[2].m.class, rating: standard[2].m.rating, enabled: Boolean(standard[2].enabled), priority: standard[2].priority + 1 },
        lifeSupport: { class: standard[3].m.class, rating: standard[3].m.rating, enabled: Boolean(standard[3].enabled), priority: standard[3].priority + 1 },
        powerDistributor: { class: standard[4].m.class, rating: standard[4].m.rating, enabled: Boolean(standard[4].enabled), priority: standard[4].priority + 1 },
        sensors: { class: standard[5].m.class, rating: standard[5].m.rating, enabled: Boolean(standard[5].enabled), priority: standard[5].priority + 1 },
        fuelTank: { class: standard[6].m.class, rating: standard[6].m.rating, enabled: Boolean(standard[6].enabled), priority: standard[6].priority + 1 }
      },
      hardpoints: hardpoints.filter(slot => slot.maxClass > 0).map(slotToSchema),
      utility: hardpoints.filter(slot => slot.maxClass === 0).map(slotToSchema),
      internal: internal.map(slotToSchema)
    },
    stats: {}
  };

  for (var stat in ship) {
    if (!isNaN(ship[stat])) {
      data.stats[stat] = Math.round(ship[stat] * 100) / 100;
    }
  }

  return data;
};

export function fromDetailedBuild(detailedBuild) {
  var shipId = Object.keys(Ships).find((shipId) => Ships[shipId].properties.name.toLowerCase() == detailedBuild.ship.toLowerCase());

  if (!shipId) {
    throw 'No such ship: ' + detailedBuild.ship;
  }

  var comps = detailedBuild.components;
  var standard = comps.standard;
  var priorities = [ standard.cargoHatch && standard.cargoHatch.priority !== undefined ? standard.cargoHatch.priority - 1 : 0 ];
  var enabled = [ standard.cargoHatch && standard.cargoHatch.enabled !== undefined ? standard.cargoHatch.enabled : true ];
  var shipData = ShipsDB[shipId];
  var ship = new Ship(shipId, shipData.properties, shipData.slots);
  var bulkheads = ModuleUtils.bulkheadIndex(standard.bulkheads);

  if (bulkheads < 0) {
    throw 'Invalid bulkheads: ' + standard.bulkheads;
  }

  var standardIds = _.map(
    ['powerPlant', 'thrusters', 'frameShiftDrive', 'lifeSupport', 'powerDistributor', 'sensors', 'fuelTank'],
    function(c) {
      if (!standard[c].class || !standard[c].rating) {
        throw 'Invalid value for ' + c;
      }
      priorities.push(standard[c].priority === undefined ? 0 : standard[c].priority - 1);
      enabled.push(standard[c].enabled === undefined ? true : standard[c].enabled);
      return standard[c].class + standard[c].rating;
    }
  );

  var internal = _.map(comps.internal, function(c) { return c ? ModuleUtils.findInternalId(c.group, c.class, c.rating, c.name) : 0; });

  var hardpoints = _.map(comps.hardpoints, function(c) {
      return c ? ModuleUtils.findHardpointId(c.group, c.class, c.rating, c.name, MountMap[c.mount], c.missile) : 0;
    }).concat(_.map(comps.utility, function(c) {
      return c ? ModuleUtils.findHardpointId(c.group, c.class, c.rating, c.name, MountMap[c.mount]) : 0;
    }));

  // The ordering of these arrays must match the order in which they are read in Ship.buildWith
  priorities = priorities.concat(_.map(comps.hardpoints, function(c) { return (!c || c.priority === undefined) ? 0 : c.priority - 1; }),
                                 _.map(comps.utility, function(c) { return (!c || c.priority === undefined) ? 0 : c.priority - 1; }),
                                 _.map(comps.internal, function(c) { return (!c || c.priority === undefined) ? 0 : c.priority - 1; }));
  enabled = enabled.concat(_.map(comps.hardpoints, function(c) { return (!c || c.enabled === undefined) ? true : c.enabled * 1; }),
                           _.map(comps.utility, function(c) { return (!c || c.enabled === undefined) ? true : c.enabled * 1; }),
                           _.map(comps.internal, function(c) { return (!c || c.enabled === undefined) ? true : c.enabled * 1; }));

  ship.buildWith({ bulkheads: bulkheads, standard: standardIds, hardpoints: hardpoints, internal: internal }, priorities, enabled);

  return ship;
};

export function toDetailedExport(builds) {
  var data = [];

  for (var shipId in builds) {
    for (var buildName in builds[shipId]) {
      var code = builds[shipId][buildName];
      var shipData = Ships[shipId];
      var ship = new Ship(shipId, shipData.properties, shipData.slots);
      ship.buildFrom(code);
      data.push(toDetailedBuild(buildName, ship, code));
    }
  }
  return data;
};

export function fromComparison(name, builds, facets, predicate, desc) {
  var shipBuilds = [];

  builds.forEach(function(b) {
    shipBuilds.push({ s: b.id, n: b.buildName, c: fromShip(b) });
  }.bind(this));

  return LZString.compressToBase64(angular.toJson({
    n: name,
    b: shipBuilds,
    f: facets,
    p: predicate,
    d: desc ? 1 : 0
  })).replace(/\//g, '-');
};

export function toComparison(code) {
  return JSON.parse(LZString.decompressFromBase64(code.replace(/-/g, '/')));
};
