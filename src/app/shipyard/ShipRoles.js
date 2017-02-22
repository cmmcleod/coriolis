import * as ModuleUtils from './ModuleUtils';
import { canMount } from '../utils/SlotFunctions';

/**
 * Standard / typical role for multi-purpose or combat (if shielded with better bulkheads)
 * @param {Ship} ship             Ship instance
 * @param {Boolean} shielded      True if shield generator should be included
 * @param {integer} bulkheadIndex Bulkhead to use see Constants.BulkheadNames
 */
export function multiPurpose(ship, shielded, bulkheadIndex) {
  ship.useStandard('A')
      .use(ship.standard[3], ModuleUtils.standard(3, ship.standard[3].maxClass + 'D'))  // D Life Support
      .use(ship.standard[5], ModuleUtils.standard(5, ship.standard[5].maxClass + 'D'))  // D Sensors
      .useBulkhead(bulkheadIndex);

  if (shielded) {
    ship.internal.some(function(slot) {
      if (canMount(ship, slot, 'sg')) { // Assuming largest slot can hold an eligible shield
        ship.use(slot, ModuleUtils.findInternal('sg', slot.maxClass, 'A'));
        ship.setSlotEnabled(slot, true);
        return true;
      }
    });
  }
}

/**
 * Trader Role
 * @param  {Ship} ship            Ship instance
 * @param  {Boolean} shielded     True if shield generator should be included
 * @param  {Object} standardOpts  [Optional] Standard module optional overrides
 */
export function trader(ship, shielded, standardOpts) {
  let usedSlots = [],
      sg = ship.getAvailableModules().lightestShieldGenerator(ship.hullMass);
 
  // Shield generator if required
  if (shielded) {
    const shieldOrder = [1, 2, 3, 4, 5, 6, 7, 8];
    const shieldInternals = ship.internal.filter(a => usedSlots.indexOf(a) == -1)
                                         .filter(a => (!a.eligible) || a.eligible.sg)
                                         .filter(a => a.maxClass >= sg.class)
                                         .sort((a,b) => shieldOrder.indexOf(a.maxClass) - shieldOrder.indexOf(b.maxClass));
    for (let i = 0; i < shieldInternals.length; i++) {
      if (canMount(ship, shieldInternals[i], 'sg')) {
        ship.use(shieldInternals[i], sg);
        usedSlots.push(shieldInternals[i]);
        break;
      }
    }
  }

  // Fill the empty internals with cargo racks
  for (let i = ship.internal.length; i--;) {
    let slot = ship.internal[i];
    if (usedSlots.indexOf(slot) == -1 && canMount(ship, slot, 'cr')) {
      ship.use(slot, ModuleUtils.findInternal('cr', slot.maxClass, 'E'));
    }
  }

  // Empty the hardpoints
  for (let s of ship.hardpoints) {
    ship.use(s, null);
  }

  ship.useLightestStandard(standardOpts);
}

/**
 * Explorer Role
 * @param  {Ship} ship         Ship instance
 * @param  {Boolean} planetary True if Planetary Vehicle Hangar (PVH) should be included
 */
export function explorer(ship, planetary) {
  let standardOpts = { ppRating: 'A' },
      heatSinkCount = 2,  // Fit 2 heat sinks if possible
      usedSlots = [],
      sgSlot,
      fuelScoopSlot,
      sg = ship.getAvailableModules().lightestShieldGenerator(ship.hullMass);

  if (!planetary) { // Non-planetary explorers don't really need to boost
    standardOpts.pd = '1D';
  }

  // Cargo hatch can be disabled
  ship.setSlotEnabled(ship.cargoHatch, false);

  // Advanced Discovery Scanner - class 1 or higher
  const adsOrder = [1, 2, 3, 4, 5, 6, 7, 8];
  const adsInternals = ship.internal.filter(a => usedSlots.indexOf(a) == -1)
                                    .filter(a => (!a.eligible) || a.eligible.sc)
                                    .sort((a,b) => adsOrder.indexOf(a.maxClass) - adsOrder.indexOf(b.maxClass));
  for (let i = 0; i < adsInternals.length; i++) {
    if (canMount(ship, adsInternals[i], 'sc')) {
      ship.use(adsInternals[i], ModuleUtils.internal('2f'));
      usedSlots.push(adsInternals[i]);
      break;
    }
  }

  if (planetary) {
    // Planetary Vehicle Hangar - class 2 or higher
    const pvhOrder = [2, 3, 4, 5, 6, 7, 8, 1];
    const pvhInternals = ship.internal.filter(a => usedSlots.indexOf(a) == -1)
                                      .filter(a => (!a.eligible) || a.eligible.pv)
                                      .sort((a,b) => pvhOrder.indexOf(a.maxClass) - pvhOrder.indexOf(b.maxClass));
    for (let i = 0; i < pvhInternals.length; i++) {
      if (canMount(ship, pvhInternals[i], 'pv')) {
        // Planetary Vehical Hangar only has even classes
        const pvhClass = pvhInternals[i].maxClass % 2 === 1 ? pvhInternals[i].maxClass - 1 : pvhInternals[i].maxClass;
        ship.use(pvhInternals[i], ModuleUtils.findInternal('pv', pvhClass, 'G')); // G is lower mass
        ship.setSlotEnabled(pvhInternals[i], false);   // Disable power for Planetary Vehical Hangar
        usedSlots.push(pvhInternals[i]);
        break;
      }
    }
  }

  // Shield generator
  const shieldOrder = [1, 2, 3, 4, 5, 6, 7, 8];
  const shieldInternals = ship.internal.filter(a => usedSlots.indexOf(a) == -1)
                                       .filter(a => (!a.eligible) || a.eligible.sg)
                                       .filter(a => a.maxClass >= sg.class)
                                       .sort((a,b) => shieldOrder.indexOf(a.maxClass) - shieldOrder.indexOf(b.maxClass));
  for (let i = 0; i < shieldInternals.length; i++) {
    if (canMount(ship, shieldInternals[i], 'sg')) {
      ship.use(shieldInternals[i], sg);
      usedSlots.push(shieldInternals[i]);
      sgSlot = shieldInternals[i];
      break;
    }
  }

  // Detailed Surface Scanner
  const dssOrder = [1, 2, 3, 4, 5, 6, 7, 8];
  const dssInternals = ship.internal.filter(a => usedSlots.indexOf(a) == -1)
                                    .filter(a => (!a.eligible) || a.eligible.sc)
                                    .sort((a,b) => dssOrder.indexOf(a.maxClass) - dssOrder.indexOf(b.maxClass));
  for (let i = 0; i < dssInternals.length; i++) {
    if (canMount(ship, dssInternals[i], 'sc')) {
      ship.use(dssInternals[i], ModuleUtils.internal('2i'));
      usedSlots.push(dssInternals[i]);
      break;
    }
  }

  // Fuel scoop - best possible
  const fuelScoopOrder = [8, 7, 6, 5, 4, 3, 2, 1];
  const fuelScoopInternals = ship.internal.filter(a => usedSlots.indexOf(a) == -1)
                                       .filter(a => (!a.eligible) || a.eligible.fs)
                                       .sort((a,b) => fuelScoopOrder.indexOf(a.maxClass) - fuelScoopOrder.indexOf(b.maxClass));
  for (let i = 0; i < fuelScoopInternals.length; i++) {
    if (canMount(ship, fuelScoopInternals[i], 'fs')) {
      ship.use(fuelScoopInternals[i], ModuleUtils.findInternal('fs', fuelScoopInternals[i].maxClass, 'A'));
      usedSlots.push(fuelScoopInternals[i]);
      fuelScoopSlot = fuelScoopInternals[i];
      break;
    }
  }

  // AFMUs - fill as they are 0-weight
  const afmuOrder = [8, 7, 6, 5, 4, 3, 2, 1];
  const afmuInternals = ship.internal.filter(a => usedSlots.indexOf(a) == -1)
                                       .filter(a => (!a.eligible) || a.eligible.pc)
                                       .sort((a,b) => afmuOrder.indexOf(a.maxClass) - afmuOrder.indexOf(b.maxClass));
  for (let i = 0; i < afmuInternals.length; i++) {
    if (canMount(ship, afmuInternals[i], 'am')) {
      ship.use(afmuInternals[i], ModuleUtils.findInternal('am', afmuInternals[i].maxClass, 'A'));
      usedSlots.push(afmuInternals[i]);
      ship.setSlotEnabled(afmuInternals[i], false);   // Disable power for AFM Unit
    }
  }

  for (let s of ship.hardpoints) {
    if (s.maxClass == 0 && heatSinkCount) {       // Mount up to 2 heatsinks
      ship.use(s, ModuleUtils.hardpoints('02'));
      ship.setSlotEnabled(s, heatSinkCount == 2); // Only enable a single Heatsink
      heatSinkCount--;
    } else {
      ship.use(s, null);
    }
  }

  if (sgSlot && fuelScoopSlot) {
    // The SG and Fuel scoop to not need to be powered at the same time
    if (sgSlot.m.getPowerUsage() > fuelScoopSlot.m.getPowerUsage()) { // The Shield generator uses the most power
      ship.setSlotEnabled(fuelScoopSlot, false);
    } else {                                    // The Fuel scoop uses the most power
      ship.setSlotEnabled(sgSlot, false);
    }
  }

  ship.useLightestStandard(standardOpts);
}

/**
 * Miner Role
 * @param  {Ship} ship         Ship instance
 * @param  {Boolean} shielded  True if shield generator should be included
 */
export function miner(ship, shielded) {
  let standardOpts = { ppRating: 'A' },
      miningLaserCount = 2,
      usedSlots = [],
      sg = ship.getAvailableModules().lightestShieldGenerator(ship.hullMass);

  // Cargo hatch should be enabled
  ship.setSlotEnabled(ship.cargoHatch, true);

  // 4A or largest possible refinery
  const refineryOrder = [4, 5, 6, 7, 8, 3, 2, 1];
  const refineryInternals = ship.internal.filter(a => usedSlots.indexOf(a) == -1)
                                         .filter(a => (!a.eligible) || a.eligible.rf)
                                         .sort((a,b) => refineryOrder.indexOf(a.maxClass) - refineryOrder.indexOf(b.maxClass));
  for (let i = 0; i < refineryInternals.length; i++) {
    if (canMount(ship, refineryInternals[i], 'rf')) {
      ship.use(refineryInternals[i], ModuleUtils.findInternal('rf', refineryInternals[i].maxClass, 'A'));
      usedSlots.push(refineryInternals[i]);
      break;
    }
  }

  // Prospector limpet controller - 3A if possible
  const prospectorOrder = [3, 4, 5, 6, 7, 8, 2, 1];
  const prospectorInternals = ship.internal.filter(a => usedSlots.indexOf(a) == -1)
                                           .filter(a => (!a.eligible) || a.eligible.pc)
                                           .sort((a,b) => prospectorOrder.indexOf(a.maxClass) - prospectorOrder.indexOf(b.maxClass));
  for (let i = 0; i < prospectorInternals.length; i++) {
    if (canMount(ship, prospectorInternals[i], 'pc')) {
      // Prospector only has odd classes
      const prospectorClass = prospectorInternals[i].maxClass % 2 === 0 ? prospectorInternals[i].maxClass - 1 : prospectorInternals[i].maxClass;
      ship.use(prospectorInternals[i], ModuleUtils.findInternal('pc', prospectorClass, 'A'));
      usedSlots.push(prospectorInternals[i]);
      break;
    }
  }

  // Shield generator if required
  if (shielded) {
    const shieldOrder = [1, 2, 3, 4, 5, 6, 7, 8];
    const shieldInternals = ship.internal.filter(a => usedSlots.indexOf(a) == -1)
                                         .filter(a => (!a.eligible) || a.eligible.sg)
                                         .filter(a => a.maxClass >= sg.class)
                                         .sort((a,b) => shieldOrder.indexOf(a.maxClass) - shieldOrder.indexOf(b.maxClass));
    for (let i = 0; i < shieldInternals.length; i++) {
      if (canMount(ship, shieldInternals[i], 'sg')) {
        ship.use(shieldInternals[i], sg);
        usedSlots.push(shieldInternals[i]);
        break;
      }
    }
  }

  // Collector limpet controller if there are enough internals left
  let collectorLimpetsRequired = Math.max(ship.internal.filter(a => (!a.eligible) || a.eligible.cr).length - 6, 0);
  if (collectorLimpetsRequired > 0) {
    const collectorOrder = [1, 2, 3, 4, 5, 6, 7, 8];
    const collectorInternals = ship.internal.filter(a => usedSlots.indexOf(a) == -1)
                                            .filter(a => (!a.eligible) || a.eligible.cc)
                                            .sort((a,b) => collectorOrder.indexOf(a.maxClass) - collectorOrder.indexOf(b.maxClass));
    for (let i = 0; i < collectorInternals.length && collectorLimpetsRequired > 0; i++) {
      if (canMount(ship, collectorInternals[i], 'cc')) {
        // Collector only has odd classes
        const collectorClass = collectorInternals[i].maxClass % 2 === 0 ? collectorInternals[i].maxClass - 1 : collectorInternals[i].maxClass;
        ship.use(collectorInternals[i], ModuleUtils.findInternal('cc', collectorClass, 'A'));
        usedSlots.push(collectorInternals[i]);
        collectorLimpetsRequired -= collectorInternals[i].m.maximum;
      }
    }
  }

  // Dual mining lasers of highest possible class; remove anything else
  const miningLaserOrder = [2, 3, 4, 1, 0];
  const miningLaserHardpoints = ship.hardpoints.concat().sort(function(a,b) {
    return miningLaserOrder.indexOf(a.maxClass) - miningLaserOrder.indexOf(b.maxClass);
  });
  for (let s of miningLaserHardpoints) {
    if (s.maxClass >= 1 && miningLaserCount) {
      ship.use(s, ModuleUtils.hardpoints(s.maxClass >= 2 ? '2m' : '2l'));
      miningLaserCount--;
    } else {
      ship.use(s, null);
    }
  }

  // Fill the empty internals with cargo racks
  for (let i = ship.internal.length; i--;) {
    let slot = ship.internal[i];
    if (usedSlots.indexOf(slot) == -1 && canMount(ship, slot, 'cr')) {
      ship.use(slot, ModuleUtils.findInternal('cr', slot.maxClass, 'E'));
    }
  }

  ship.useLightestStandard(standardOpts);
}
