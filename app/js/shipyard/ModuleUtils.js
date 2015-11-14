import { ModuleNameToGroup, BulkheadNames } from 'Constants';
import ModuleSet from 'ModuleSet';
import { Ships, Modules } from 'coriolis-data';

export function cargoHatch() {
    return { name: 'Cargo Hatch', class: 1, rating: 'H', power: 0.6 };
  };

export function standard(typeIndex, componentId) {
    return Modules.standard[typeIndex][componentId];
  };

export function hardpoints(id) {
    for (let n in Modules.hardpoints) {
      let group = Modules.hardpoints[n];
      for (let i = 0; i < group.length; i++) {
        if (group[i].id == id) {
          return group[i];
        }
      }
    }
    return null;
  };

export function internal(id) {
    for (let n in Modules.internal) {
      let group = Modules.internal[n];
      for (let i = 0; i < group.length; i++) {
        if (group[i].id == id) {
          return group[i];
        }
      }
    }
    return null;
  };

/**
 * Finds an internal Component based on Class, Rating, Group and/or name.
 * At least one ofGroup name or unique component name must be provided
 *
 * @param  {string} groupName [Optional] Full name or abbreviated name for component group
 * @param  {integer} clss     Component Class
 * @param  {string} rating    Component Rating
 * @param  {string} name      [Optional] Long/unique name for component -e.g. 'Advanced Discover Scanner'
 * @return {String}           The id of the component if found, null if not found
 */
export function findInternal(groupName, clss, rating, name) {
  let groups = {};

  if (groupName) {
    if (Modules.internal[groupName]) {
      groups[groupName] = Modules.internal[groupName];
    } else {
      let grpCode = ModuleNameToGroup[groupName];
      if (grpCode && Modules.internal[grpCode]) {
        groups[grpCode] = Modules.internal[grpCode];
      }
    }
  } else if (name) {
    groups = Modules.internal;
  }

  for (let g in groups) {
    let group = groups[g];
    for (let i = 0, l = group.length; i < l; i++) {
      if (group[i].class == clss && group[i].rating == rating && ((!name && !group[i].name) || group[i].name == name)) {
        return group[i];
      }
    }
  }

  return null;
}

/**
 * Finds an internal Component ID based on Class, Rating, Group and/or name.
 * At least one ofGroup name or unique component name must be provided
 *
 * @param  {string} groupName [Optional] Full name or abbreviated name for component group
 * @param  {integer} clss     Component Class
 * @param  {string} rating    Component Rating
 * @param  {string} name      [Optional] Long/unique name for component -e.g. 'Advanced Discover Scanner'
 * @return {String}           The id of the component if found, null if not found
 */
export function findInternalId(groupName, clss, rating, name) {
  let i = this.findInternal(groupName, clss, rating, name);
  return i ? i.id : 0;
}

/**
 * Finds a hardpoint Component based on Class, Rating, Group and/or name.
 * At least one ofGroup name or unique component name must be provided
 *
 * @param  {string} groupName [Optional] Full name or abbreviated name for component group
 * @param  {integer} clss     Component Class
 * @param  {string} rating    [Optional] Component Rating
 * @param  {string} name      [Optional] Long/unique name for component -e.g. 'Heat Sink Launcher'
 * @param  {string} mount     Mount type - [F]ixed, [G]imballed, [T]urret
 * @param  {string} missile   [Optional] Missile type - [D]umbfire, [S]eeker
 * @return {String}           The id of the component if found, null if not found
 */
export function findHardpoint(groupName, clss, rating, name, mount, missile) {
  let groups = {};

  if (groupName) {
    if (Modules.hardpoints[groupName]) {
      groups[groupName] = Modules.hardpoints[groupName];
    } else {
      let grpCode = ModuleNameToGroup[groupName];
      if (grpCode && Modules.hardpoints[grpCode]) {
        groups[grpCode] = Modules.hardpoints[grpCode];
      }
    }
  } else if (name) {
    groups = Modules.hardpoints;
  }

  for (let g in groups) {
    let group = groups[g];
    for (let i = 0, l = group.length; i < l; i++) {
      if (group[i].class == clss && (!rating || group[i].rating == rating) && group[i].mount == mount
          && ((!name && !group[i].name) || group[i].name == name)
          && ((!missile && !group[i].missile) || group[i].missile == missile)
          ) {
        return group[i];
      }
    }
  }

  return null;
}

/**
 * Finds a hardpoint Component ID based on Class, Rating, Group and/or name.
 * At least one of Group name or unique component name must be provided
 *
 * @param  {string} groupName [Optional] Full name or abbreviated name for component group
 * @param  {integer} clss     Component Class
 * @param  {string} rating    Component Rating
 * @param  {string} name      [Optional] Long/unique name for component -e.g. 'Heat Sink Launcher'
 * @param  {string} mount     Mount type - [F]ixed, [G]imballed, [T]urret
 * @param  {string} missile   [Optional] Missile type - [D]umbfire, [S]eeker
 * @return {String}           The id of the component if found, null if not found
 */
export function findHardpointId(groupName, clss, rating, name, mount, missile) {
  let h = this.findHardpoint(groupName, clss, rating, name, mount, missile);
  return h ? h.id : 0;
}

/**
 * Looks up the bulkhead component for a specific ship and bulkhead
 * @param  {string} shipId       Unique ship Id/Key
 * @param  {number} bulkheadsId  Id/Index for the specified bulkhead
 * @return {object}             The bulkhead component object
 */
export function bulkheads(shipId, bulkheadsId) {
  return Modules.bulkheads[shipId][bulkheadsId];
}

export function bulkheadIndex(bulkheadName) {
  return Bulkheads.indexOf(bulkheadName);
}

/**
 * Creates a new ModuleSet that contains all available components
 * that the specified ship is eligible to use.
 *
 * @param  {string} shipId    Unique ship Id/Key
 * @return {ModuleSet}     The set of components the ship can install
 */
export function forShip(shipId) {
  let ship = Ships[shipId];
  let maxInternal = isNaN(ship.slots.internal[0]) ? ship.slots.internal[0].class : ship.slots.internal[0];
  return new ModuleSet(Modules, ship.minMassFilter || ship.properties.hullMass + 5, ship.slots.standard, maxInternal, ship.slots.hardpoints[0]);
}
