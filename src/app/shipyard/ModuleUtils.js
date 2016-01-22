import { ModuleNameToGroup, BulkheadNames } from './Constants';
import ModuleSet from './ModuleSet';
import { Ships, Modules } from 'coriolis-data';

/**
 * Created a cargo hatch model
 * @return {Object} Cargo hatch model
 */
export function cargoHatch() {
  return { name: 'Cargo Hatch', class: 1, rating: 'H', power: 0.6 };
};

/**
 * Finds the standard module type with the specified ID
 * @param  {number} typeIndex Standard Module Type (0 - Power Plant, 1 - Thrusters, etc)
 * @param  {string} id        The module ID or '[Class][Rating]'
 * @return {Object}           The standard module or null
 */
export function standard(typeIndex, id) {
  let standard = Modules.standard[typeIndex];
  if (standard[id]) {
    return standard[id];
  } else {
    for (let k in standard) {
      if (standard[k].id == id) {
        return standard[k];
      }
    }
  }
  return null;
};

/**
 * Finds the hardpoint with the specified ID
 * @param  {string} id Hardpoint ID
 * @return {Object}    Hardpoint module or null
 */
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

/**
 * Finds the internal module with the specified ID
 * @param  {string} id Internal module ID
 * @return {Object}    Internal module or null
 */
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
 * Finds an internal module based on Class, Rating, Group and/or name.
 * At least one ofGroup name or unique module name must be provided
 *
 * @param  {string} groupName [Optional] Full name or abbreviated name for module group
 * @param  {integer} clss     module Class
 * @param  {string} rating    module Rating
 * @param  {string} name      [Optional] Long/unique name for module -e.g. 'Advanced Discover Scanner'
 * @return {String}           The id of the module if found, null if not found
 */
export function findInternal(groupName, clss, rating, name) {
  let groups = {};

  if (groupName) {
    if (Modules.internal[groupName]) {
      groups[groupName] = Modules.internal[groupName];
    } else {
      let grpCode = ModuleNameToGroup[groupName.toLowerCase()];
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
 * Finds an internal Module ID based on Class, Rating, Group and/or name.
 * At least one ofGroup name or unique module name must be provided
 *
 * @param  {string} groupName [Optional] Full name or abbreviated name for module group
 * @param  {integer} clss     module Class
 * @param  {string} rating    Module Rating
 * @param  {string} name      [Optional] Long/unique name for module -e.g. 'Advanced Discover Scanner'
 * @return {String}           The id of the module if found, null if not found
 */
export function findInternalId(groupName, clss, rating, name) {
  let i = this.findInternal(groupName, clss, rating, name);
  return i ? i.id : 0;
}

/**
 * Finds a hardpoint Module based on Class, Rating, Group and/or name.
 * At least one ofGroup name or unique module name must be provided
 *
 * @param  {string} groupName [Optional] Full name or abbreviated name for module group
 * @param  {integer} clss     Module Class
 * @param  {string} rating    [Optional] module Rating
 * @param  {string} name      [Optional] Long/unique name for module -e.g. 'Heat Sink Launcher'
 * @param  {string} mount     Mount type - [F]ixed, [G]imballed, [T]urret
 * @param  {string} missile   [Optional] Missile type - [D]umbfire, [S]eeker
 * @return {String}           The id of the module if found, null if not found
 */
export function findHardpoint(groupName, clss, rating, name, mount, missile) {
  let groups = {};

  if (groupName) {
    if (Modules.hardpoints[groupName]) {
      groups[groupName] = Modules.hardpoints[groupName];
    } else {
      let grpCode = ModuleNameToGroup[groupName.toLowerCase()];
      if (grpCode && Modules.hardpoints[grpCode]) {
        groups[grpCode] = Modules.hardpoints[grpCode];
      }
    }
  } else if (name) {
    groups = Modules.hardpoints;
  }

  for (let g in groups) {
    let group = groups[g];
    for (let h of group) {
      if (h.class == clss && (!rating || h.rating == rating) && h.mount == mount && h.name == name && h.missile == missile) {
        return h;
      }
    }
  }

  return null;
}

/**
 * Finds a hardpoint module ID based on Class, Rating, Group and/or name.
 * At least one of Group name or unique module name must be provided
 *
 * @param  {string} groupName [Optional] Full name or abbreviated name for module group
 * @param  {integer} clss     module Class
 * @param  {string} rating    module Rating
 * @param  {string} name      [Optional] Long/unique name for module -e.g. 'Heat Sink Launcher'
 * @param  {string} mount     Mount type - [F]ixed, [G]imballed, [T]urret
 * @param  {string} missile   [Optional] Missile type - [D]umbfire, [S]eeker
 * @return {String}           The id of the module if found, null if not found
 */
export function findHardpointId(groupName, clss, rating, name, mount, missile) {
  let h = this.findHardpoint(groupName, clss, rating, name, mount, missile);
  return h ? h.id : 0;
}

/**
 * Looks up the bulkhead module for a specific ship and bulkhead
 * @param  {string} shipId        Unique ship Id/Key
 * @param  {string|number} index  Index for the specified bulkhead
 * @return {Object}               The bulkhead module object
 */
export function bulkheads(shipId, index) {
  let bulkhead = Ships[shipId].bulkheads[index];
  bulkhead.class = 1;
  bulkhead.rating = 'I';
  bulkhead.name = BulkheadNames[index];

  return bulkhead;
}

/**
 * Get the bulkhead index for the given bulkhead name
 * @param  {string} bulkheadName Bulkhead name in english
 * @return {number}              Bulkhead index
 */
export function bulkheadIndex(bulkheadName) {
  return BulkheadNames.indexOf(bulkheadName);
}


/**
 * Determine if a module group is a shield generator
 * @param  {string}  g Module Group name
 * @return {Boolean}   True if the group is a shield generator
 */
export function isShieldGenerator(g) {
  return g == 'sg' || g == 'psg' || g == 'bsg';
}

/**
 * Creates a new ModuleSet that contains all available modules
 * that the specified ship is eligible to use.
 *
 * @param  {string} shipId    Unique ship Id/Key
 * @return {ModuleSet}     The set of modules the ship can install
 */
export function forShip(shipId) {
  let ship = Ships[shipId];
  let maxInternal = isNaN(ship.slots.internal[0]) ? ship.slots.internal[0].class : ship.slots.internal[0];
  return new ModuleSet(Modules, ship.minMassFilter || ship.properties.hullMass + 5, ship.slots.standard, maxInternal, ship.slots.hardpoints[0]);
}
