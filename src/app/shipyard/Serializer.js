import { ModuleGroupToName, MountMap, BulkheadNames } from './Constants';
import { Ships } from 'coriolis-data/dist';
import Ship from './Ship';
import * as ModuleUtils from './ModuleUtils';
import * as Utils from '../utils/UtilityFunctions';
import LZString from 'lz-string';
import { outfitURL } from '../utils/UrlGenerators';

const STANDARD = ['powerPlant', 'thrusters', 'frameShiftDrive', 'lifeSupport', 'powerDistributor', 'sensors', 'fuelTank'];

/**
 * Generates ship-loadout JSON Schema standard object
 * @param  {Object} standard model
 * @return {Object} JSON Schema
 */
function standardToSchema(standard) {
  if (standard.m) {
    let o = {
      class: standard.m.class,
      rating: standard.m.rating,
      enabled: Boolean(standard.enabled),
      priority: standard.priority + 1
    };

    if (standard.m.name) {
      o.name = standard.m.name;
    }

    if (standard.m.mods && Object.keys(standard.m.mods).length > 0) {
      o.modifications = standard.m.mods;
    }

    return o;
  }
  return null;
}

/**
 * Generates ship-loadout JSON Schema slot object
 * @param  {Object} slot Slot model
 * @return {Object}      JSON Schema Slot
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
    if (slot.m.mods && Object.keys(slot.m.mods).length > 0) {
      o.modifications = slot.m.mods;
    }
    return o;
  }
  return null;
}

/**
 * Generates an object conforming to the ship-loadout JSON schema from a Ship model
 * @param  {string} buildName The build name
 * @param  {Ship} ship        Ship instance
 * @return {Object}           ship-loadout object
 */
export function toDetailedBuild(buildName, ship) {
  let standard = ship.standard,
      hardpoints = ship.hardpoints,
      internal = ship.internal,
      code = ship.toString();

  let data = {
    $schema: 'http://cdn.coriolis.io/schemas/ship-loadout/4.json#',
    name: buildName,
    ship: ship.name,
    references: [{
      name: 'Coriolis.io',
      url: 'https://coriolis.edcd.io' + outfitURL(ship.id, code, buildName),
      code,
      shipId: ship.id
    }],
    components: {
      standard: {
        bulkheads: BulkheadNames[ship.bulkheads.m.index],
        cargoHatch: { enabled: Boolean(ship.cargoHatch.enabled), priority: ship.cargoHatch.priority + 1 },
        powerPlant: standardToSchema(standard[0]),
        thrusters: standardToSchema(standard[1]),
        frameShiftDrive: standardToSchema(standard[2]),
        lifeSupport: standardToSchema(standard[3]),
        powerDistributor: standardToSchema(standard[4]),
        sensors: standardToSchema(standard[5]),
        fuelTank: standardToSchema(standard[6])
      },
      hardpoints: hardpoints.filter(slot => slot.maxClass > 0).map(slotToSchema),
      utility: hardpoints.filter(slot => slot.maxClass === 0).map(slotToSchema),
      internal: internal.map(slotToSchema)
    },
    stats: {}
  };

  for (let stat in ship) {
    if (!isNaN(ship[stat])) {
      data.stats[stat] = Math.round(ship[stat] * 100) / 100;
    }
  }

  return data;
};

/**
 * Instantiates a ship from a ship-loadout  object
 * @param  {Object} detailedBuild ship-loadout object
 * @return {Ship} Ship instance
 */
export function fromDetailedBuild(detailedBuild) {
  let shipId = Object.keys(Ships).find((shipId) => Ships[shipId].properties.name.toLowerCase() == detailedBuild.ship.toLowerCase());

  if (!shipId) {
    throw 'No such ship: ' + detailedBuild.ship;
  }

  let comps = detailedBuild.components;
  let stn = comps.standard;
  let priorities = [stn.cargoHatch && stn.cargoHatch.priority !== undefined ? stn.cargoHatch.priority - 1 : 0];
  let enabled = [stn.cargoHatch && stn.cargoHatch.enabled !== undefined ? stn.cargoHatch.enabled : true];
  let shipData = Ships[shipId];
  let ship = new Ship(shipId, shipData.properties, shipData.slots);
  let bulkheads = ModuleUtils.bulkheadIndex(stn.bulkheads);
  let modifications = new Array(stn.bulkheads.modifications);

  if (bulkheads < 0) {
    throw 'Invalid bulkheads: ' + stn.bulkheads;
  }

  let standard = STANDARD.map((c) => {
    if (!stn[c].class || !stn[c].rating) {
      throw 'Invalid value for ' + c;
    }
    priorities.push(stn[c].priority === undefined ? 0 : stn[c].priority - 1);
    enabled.push(stn[c].enabled === undefined ? true : stn[c].enabled);
    modifications.push(stn[c].modifications);
    return stn[c].class + stn[c].rating;
  });

  let internal = comps.internal.map(c => c ? ModuleUtils.findInternalId(c.group, c.class, c.rating, c.name) : 0);

  let hardpoints = comps.hardpoints
    .map(c => c ? ModuleUtils.findHardpointId(c.group, c.class, c.rating, c.name, MountMap[c.mount], c.missile) : 0)
    .concat(comps.utility.map(c => c ? ModuleUtils.findHardpointId(c.group, c.class, c.rating, c.name, MountMap[c.mount]) : 0));

  // The ordering of these arrays must match the order in which they are read in Ship.buildWith
  priorities = priorities.concat(
    comps.hardpoints.map(c => (!c || c.priority === undefined) ? 0 : c.priority - 1),
    comps.utility.map(c => (!c || c.priority === undefined) ? 0 : c.priority - 1),
    comps.internal.map(c => (!c || c.priority === undefined) ? 0 : c.priority - 1)
  );
  enabled = enabled.concat(
    comps.hardpoints.map(c => (!c || c.enabled === undefined) ? true : c.enabled * 1),
    comps.utility.map(c => (!c || c.enabled === undefined) ? true : c.enabled * 1),
    comps.internal.map(c => (!c || c.enabled === undefined) ? true : c.enabled * 1)
  );
  modifications = modifications.concat(
    comps.hardpoints.map(c => (c && c.m ? c.m.modifications : null)),
    comps.utility.map(c => (c && c.m ? c.m.modifications : null)),
    comps.internal.map(c => (c && c.m ? c.m.modifications : null))
  );

  ship.buildWith({ bulkheads, standard, hardpoints, internal }, priorities, enabled, modifications);

  return ship;
};

/**
 * Generates an array of ship-loadout JSON Schema object for export
 * @param  {Array} builds   Array of ship builds
 * @return {Array}         Array of of ship-loadout objects
 */
export function toDetailedExport(builds) {
  let data = [];

  for (let shipId in builds) {
    for (let buildName in builds[shipId]) {
      let code = builds[shipId][buildName];
      let shipData = Ships[shipId];
      let ship = new Ship(shipId, shipData.properties, shipData.slots);
      ship.buildFrom(code);
      data.push(toDetailedBuild(buildName, ship, code));
    }
  }
  return data;
};

/**
 * Serializes a comparion and all of the ships to zipped
 * Base 64 encoded JSON.
 * @param  {string} name        Comparison name
 * @param  {array} builds       Array of ship builds
 * @param  {array} facets       Selected facets
 * @param  {string} predicate   sort predicate
 * @param  {boolean} desc       sort order
 * @return {string}             Zipped Base 64 encoded JSON
 */
export function fromComparison(name, builds, facets, predicate, desc) {
  return Utils.toUrlSafe(LZString.compressToBase64(JSON.stringify({
    n: name,
    b: builds.map((b) => { return { s: b.id, n: b.buildName, c: b.toString() }; }),
    f: facets,
    p: predicate,
    d: desc ? 1 : 0
  })));
};

/**
 * Parses the comarison data string back to an object.
 * @param  {string} code Zipped Base 64 encoded JSON comparison data
 * @return {Object} Comparison data object
 */
export function toComparison(code) {
  return JSON.parse(LZString.decompressFromBase64(Utils.fromUrlSafe(code)));
};
