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
  let sg = shielded ? ship.getAvailableModules().lightestShieldGenerator(ship.hullMass) : null;

  for (let i = ship.internal.length; i--;) {
    let slot = ship.internal[i];
    if (sg && canMount(ship, slot, 'sg', sg.class)) {
      ship.use(slot, sg);
      sg = null;
    } else {
      ship.use(slot, ModuleUtils.findInternal('cr', slot.maxClass, 'E'));
    }
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
      intLength = ship.internal.length,
      heatSinkCount = 2,  // Fit 2 heat sinks if possible
      afmUnitCount = 2,   // Fit 2 AFM Units if possible
      shieldNext = planetary,
      sgSlot,
      fuelScoopSlot,
      pvhSlot,
      sg = ship.getAvailableModules().lightestShieldGenerator(ship.hullMass);

  if (!planetary) { // Non-planetary explorers don't really need to boost
    standardOpts.pd = '1D';
  }

  ship.setSlotEnabled(ship.cargoHatch, false)
      .use(ship.internal[--intLength], ModuleUtils.internal('2f'));      // Advanced Discovery Scanner

  if (!planetary || intLength > 3) {  // Don't mount a DDS on planetary explorer ships too small for both a PVH and DDS
    ship.use(ship.internal[--intLength], ModuleUtils.internal('2i'));      // Detailed Surface Scanner
  }

  for (let i = 0; i < intLength; i++) {
    let slot = ship.internal[i];
    let nextSlot = (i + 1) < intLength ? ship.internal[i + 1] : null;
    // Fit best possible Fuel Scoop
    if (!fuelScoopSlot && canMount(ship, slot, 'fs')) {
      fuelScoopSlot = slot;
      ship.use(slot, ModuleUtils.findInternal('fs', slot.maxClass, 'A'));
      ship.setSlotEnabled(slot, true);
    // Mount a Shield generator if possible AND an AFM Unit has been mounted already (Guarantees at least 1 AFM Unit)
    } else if (!sgSlot && shieldNext && canMount(ship, slot, 'sg', sg.class) && !canMount(ship, nextSlot, 'sg', sg.class)) {
      sgSlot = slot;
      shieldNext = false;
      ship.use(slot, sg);
      ship.setSlotEnabled(slot, true);
    // if planetary explorer and the next slot cannot mount a PVH or the next modul to mount is a SG
    } else if (planetary && !pvhSlot && canMount(ship, slot, 'pv') && (shieldNext || !canMount(ship, nextSlot, 'pv', 2))) {
      pvhSlot = slot;
      ship.use(slot, ModuleUtils.findInternal('pv', Math.min(Math.floor(pvhSlot.maxClass / 2) * 2, 6), 'G'));
      ship.setSlotEnabled(slot, false);   // Disabled power for PVH
      shieldNext = !sgSlot;
    } else if (afmUnitCount > 0 && canMount(ship, slot, 'am')) {
      afmUnitCount--;
      ship.use(slot, ModuleUtils.findInternal('am', slot.maxClass, 'A'));
      ship.setSlotEnabled(slot, false);   // Disabled power for AFM Unit
      shieldNext = !sgSlot;
    } else {
      ship.use(slot, null);
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

  if (sgSlot) {
    // The SG and Fuel scoop to not need to be powered at the same time
    if (sgSlot.m.power > fuelScoopSlot.m.power) { // The Shield generator uses the most power
      ship.setSlotEnabled(fuelScoopSlot, false);
    } else {                                    // The Fuel scoop uses the most power
      ship.setSlotEnabled(sgSlot, false);
    }
  }

  ship.useLightestStandard(standardOpts);
}
