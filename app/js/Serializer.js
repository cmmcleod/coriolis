import { ModuleGroupToName, MountMap } from './Constants';
import Ships from './Ships';
import Ship from './Ship';
import ModuleUtils from './ModuleUtils';
import LZString from 'LZString';

/**
 * Service managing seralization and deserialization of models for use in URLs and persistene.
 */

/**
 * Utility function to retrieve a safe string for selected component for a slot.
 * Used for serialization to code only.
 * TODO: comment on binding
 * @private
 * @param  {object} slot The slot object.
 * @return {string}      The id of the selected component or '-' if none selected
 */
function mapGroup(slot) {
  export function enabled.push(slot.enabled ? 1 : 0);
  export function priorities.push(slot.priority);

  return slot.id === null ? '-' : slot.id;
}

function decodeToArray(code, arr, codePos) {
  for (let i = 0; i < arr.length; i++) {
    if (code.charAt(codePos) == '-') {
      arr[i] = 0;
      codePos++;
    } else {
      arr[i] = code.substring(codePos, codePos + 2);
      codePos += 2;
    }
  }
  return codePos;
}

function slotToSchema(slot) {
  if (slot.c) {
    let o = {
      class: slot.c.class,
      rating: slot.c.rating,
      enabled: Boolean(slot.enabled),
      priority: slot.priority + 1,
      group: ModuleGroupToName[slot.c.grp]
    };

    if (slot.c.name) {
      o.name = slot.c.name;
    }
    if (slot.c.mode) {
      o.mount = MountMap[slot.c.mode];
    }
    if (slot.c.missile) {
      o.missile = slot.c.missile;
    }
    return o;
  }
  return null;
}


/**
 * Serializes the ships selected components for all slots to a URL friendly string.
 * @param {Ship} ship   The ship to be serialized.
 * @return {string}     Encoded string of components
 */
export function fromShip(ship) {
  let power = {
    enabled: [ship.cargoHatch.enabled ? 1 : 0],
    priorities: [ship.cargoHatch.priority]
  };

  let data = [
    ship.bulkheads.id,
    _.map(ship.standard, mapGroup, power),
    _.map(ship.hardpoints, mapGroup, power),
    _.map(ship.internal, mapGroup, power),
    '.',
    LZString.compressToBase64(power.enabled.join('')).replace(/\//g, '-'),
    '.',
    LZString.compressToBase64(power.priorities.join('')).replace(/\//g, '-')
  ];

  return _.flatten(data).join('');
};

/**
 * Updates an existing ship instance's slots with components determined by the
 * code.
 *
 * @param {Ship}    ship        The ship instance to be updated
 * @param {string}  dataString  The string to deserialize
 */
export function toShip(ship, dataString) {
  var standard = new Array(ship.standard.length),
      hardpoints = new Array(ship.hardpoints.length),
      internal = new Array(ship.internal.length),
      parts = dataString.split('.'),
      priorities = null,
      enabled = null,
      code = parts[0];

  if (parts[1]) {
    enabled = LZString.decompressFromBase64(parts[1].replace(/-/g, '/')).split('');
  }

  if (parts[2]) {
    priorities = LZString.decompressFromBase64(parts[2].replace(/-/g, '/')).split('');
  }

  decodeToArray(code, internal, decodeToArray(code, hardpoints, decodeToArray(code, standard, 1)));

  ship.buildWith(
    {
      bulkheads: code.charAt(0) * 1,
      standard: standard,
      hardpoints: hardpoints,
      internal: internal
    },
    priorities,
    enabled
  );
};

export function toDetailedBuild(buildName, ship, code) {
  var standard = ship.standard,
      hardpoints = ship.hardpoints,
      internal = ship.internal;

  var data = {
    $schema: 'http://cdn.coriolis.io/schemas/ship-loadout/2.json#',
    name: buildName,
    ship: ship.name,
    references: [{
      name: 'Coriolis.io',
      url: $state.href('outfit', { shipId: ship.id, code: code, bn: buildName }, { absolute: true }),
      code: code,
      shipId: ship.id
    }],
    components: {
      standard: {
        bulkheads: ship.bulkheads.c.name,
        cargoHatch: { enabled: Boolean(ship.cargoHatch.enabled), priority: ship.cargoHatch.priority + 1 },
        powerPlant: { class: standard[0].c.class, rating: standard[0].c.rating, enabled: Boolean(standard[0].enabled), priority: standard[0].priority + 1 },
        thrusters: { class: standard[1].c.class, rating: standard[1].c.rating, enabled: Boolean(standard[1].enabled), priority: standard[1].priority + 1 },
        frameShiftDrive: { class: standard[2].c.class, rating: standard[2].c.rating, enabled: Boolean(standard[2].enabled), priority: standard[2].priority + 1 },
        lifeSupport: { class: standard[3].c.class, rating: standard[3].c.rating, enabled: Boolean(standard[3].enabled), priority: standard[3].priority + 1 },
        powerDistributor: { class: standard[4].c.class, rating: standard[4].c.rating, enabled: Boolean(standard[4].enabled), priority: standard[4].priority + 1 },
        sensors: { class: standard[5].c.class, rating: standard[5].c.rating, enabled: Boolean(standard[5].enabled), priority: standard[5].priority + 1 },
        fuelTank: { class: standard[6].c.class, rating: standard[6].c.rating, enabled: Boolean(standard[6].enabled), priority: standard[6].priority + 1 }
      },
      hardpoints: _.map(_.filter(hardpoints, function(slot) { return slot.maxClass > 0; }), slotToSchema),
      utility: _.map(_.filter(hardpoints, function(slot) { return slot.maxClass === 0; }), slotToSchema),
      internal: _.map(internal, slotToSchema)
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
  var shipId = _.findKey(ShipsDB, { properties: { name: detailedBuild.ship } });

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
      var shipData = ShipsDB[shipId];
      var ship = new Ship(shipId, shipData.properties, shipData.slots);
      export function toShip(ship, code);
      data.push(export function toDetailedBuild(buildName, ship, code));
    }
  }
  return data;
};

export function fromComparison(name, builds, facets, predicate, desc) {
  var shipBuilds = [];

  builds.forEach(function(b) {
    shipBuilds.push({ s: b.id, n: b.buildName, c: export function fromShip(b) });
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
  return angular.fromJson(LZString.decompressFromBase64(code.replace(/-/g, '/')));
};
