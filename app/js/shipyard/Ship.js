import { ArmourMultiplier } from 'Constants';
import Calc from 'Calculations';
import ModuleUtils from 'ModuleUtils';

const UNIQUE_MODULES = ['psg', 'sg', 'rf', 'fs'];

/**
 * Returns the power usage type of a slot and it's particular modul
 * @param  {object} slot      The Slot
 * @param  {object} modul The modul in the slot
 * @return {string}           The key for the power usage type
 */
function powerUsageType(slot, modul) {
  if (modul) {
    if (modul.passive) {
      return 'retracted';
    }
  }
  return slot.cat != 1 ? 'retracted' : 'deployed';
}

/**
 * Ship model used to track all ship ModuleUtils and properties.
 */
export default class Ship {

  /**
   * @param {string} id         Unique ship Id / Key
   * @param {object} properties Basic ship properties such as name, manufacturer, mass, etc
   * @param {object} slots      Collection of slot groups (standard/standard, internal, hardpoints) with their max class size.
   */
  constructor(id, properties, slots) {
    this.id = id;
    this.cargoHatch = { m: ModuleUtils.cargoHatch(), type: 'SYS' };
    this.bulkheads = { incCost: true, maxClass: 8 };
    this.availCS = ModuleUtils.forShip(id);

    for (var p in properties) { this[p] = properties[p]; }  // Copy all base properties from shipData

    for (var slotType in slots) {   // Initialize all slots
      var slotGroup = slots[slotType];
      var group = this[slotType] = [];   // Initialize Slot group (Standard, Hardpoints, Internal)
      for (let slot of slotGroup) {
        if (typeof slot == 'object') {
          group.push({ id: null, m: null, incCost: true, maxClass: slot.class, eligible: slot.eligible });
        } else {
          group.push({ id: null, m: null, incCost: true, maxClass: slot });
        }
      }
    }
    // Make a Ship 'slot'/item similar to other slots
    this.m = { incCost: true, type: 'SHIP', discountedCost: this.hullCost, m: { name: this.name, cost: this.hullCost } };
    this.costList = this.internal.concat(this.m, this.standard, this.hardpoints, this.bulkheads);
    this.powerList = this.internal.concat(
      this.cargoHatch,
      this.standard[0],  // Add Power Plant
      this.standard[2],  // Add FSD
      this.standard[1],  // Add Thrusters
      this.standard[4],  // Add Power Distributor
      this.standard[5],  // Add Sensors
      this.standard[3],  // Add Life Support
      this.hardpoints
    ];
    this.shipCostMultiplier = 1;
    this.modulCostMultiplier = 1;
    this.priorityBands = [
      { deployed: 0, retracted: 0, },
      { deployed: 0, retracted: 0, },
      { deployed: 0, retracted: 0, },
      { deployed: 0, retracted: 0, },
      { deployed: 0, retracted: 0, }
    ];
  }

  //*********//
  // GETTERS //
  //*********//

  getAvailableModules() {
    return this.availCS;
  }

  getSlotStatus(slot, deployed) {
    if (!slot.m) { // Empty Slot
      return 0;   // No Status (Not possible to be active in this state)
    } else if (!slot.enabled) {
      return 1;   // Disabled
    } else if (deployed) {
      return this.priorityBands[slot.priority].deployedSum >= this.powerAvailable ? 2 : 3; // Offline : Online
      // Active hardpoints have no retracted status
    } else if ((slot.cat === 1 && !slot.m.passive)) {
      return 0;  // No Status (Not possible to be active in this state)
    }
    return this.priorityBands[slot.priority].retractedSum >= this.powerAvailable ? 2 : 3;    // Offline : Online
  }

  /**
   * Calculate jump range using the installed FSD and the
   * specified mass which can be more or less than ships actual mass
   * @param  {number} mass Mass in tons
   * @param  {number} fuel Fuel available in tons
   * @return {number}      Jump range in Light Years
   */
  getJumpRangeForMass(mass, fuel) {
    return Calc.jumpRange(mass, this.standard[2].m, fuel);
  }

  /**
   * Find an internal slot that has an installed modul of the specific group.
   *
   * @param  {string} group Module group/type
   * @return {number}       The index of the slot in ship.internal
   */
  findInternalByGroup(group) {
    var index;
    if (group == 'sg' || group == 'psg') {
      return this.internal.find(slot => slot.m && (slot.m.grp == 'sg' || slot.m.grp == 'psg');
    } else {
      return this.internal.find(slot => slot.m && slot.m.grp == group);
    }
  }

  //**********************//
  // Mutate / Update Ship //
  //**********************//

  /**
   * Recalculate all item costs and total based on discounts.
   * @param  {number} shipCostMultiplier      Ship cost multiplier discount (e.g. 0.9 === 10% discount)
   * @param  {number} modulCostMultiplier Module cost multiplier discount (e.g. 0.75 === 25% discount)
   */
  applyDiscounts(shipCostMultiplier, modulCostMultiplier) {
    var total = 0;
    var costList = this.costList;

    for (var i = 0, l = costList.length; i < l; i++) {
      var item = costList[i];
      if (item.m && item.m.cost) {
        item.discountedCost = item.m.cost * (item.type == 'SHIP' ? shipCostMultiplier : modulCostMultiplier);
        if (item.incCost) {
          total += item.discountedCost;
        }
      }
    }
    this.shipCostMultiplier = shipCostMultiplier;
    this.modulCostMultiplier = modulCostMultiplier;
    this.totalCost = total;
    return this;
  }

  /**
   * Builds/Updates the ship instance with the ModuleUtils[comps] passed in.
   * @param {object} comps Collection of ModuleUtils used to build the ship
   */
  buildWith(comps, priorities, enabled) {
    var internal = this.internal,
        standard = this.standard,
        hps = this.hardpoints,
        bands = this.priorityBands,
        cl = standard.length,
        i, l;

    // Reset Cumulative stats
    this.fuelCapacity = 0;
    this.cargoCapacity = 0;
    this.ladenMass = 0;
    this.armourAdded = 0;
    this.armourMultiplier = 1;
    this.shieldMultiplier = 1;
    this.totalCost = this.m.incCost ? this.m.discountedCost : 0;
    this.unladenMass = this.hullMass;
    this.totalDps = 0;

    this.bulkheads.m = null;
    this.useBulkhead(comps && comps.bulkheads ? comps.bulkheads : 0, true);
    this.cargoHatch.priority = priorities ? priorities[0] * 1 : 0;
    this.cargoHatch.enabled = enabled ? enabled[0] * 1 : true;

    for (i = 0, l = this.priorityBands.length; i < l; i++) {
      this.priorityBands[i].deployed = 0;
      this.priorityBands[i].retracted = 0;
    }

    if (this.cargoHatch.enabled) {
      bands[this.cargoHatch.priority].retracted += this.cargoHatch.m.power;
    }

    for (i = 0; i < cl; i++) {
      standard[i].cat = 0;
      standard[i].enabled = enabled ? enabled[i + 1] * 1 : true;
      standard[i].priority = priorities && priorities[i + 1] ? priorities[i + 1] * 1 : 0;
      standard[i].type = 'SYS';
      standard[i].m = standard[i].id = null; // Resetting 'old' modul if there was one
      standard[i].discountedCost = 0;

      if (comps) {
        this.use(standard[i], comps.standard[i], ModuleUtils.standard(i, comps.standard[i]), true);
      }
    }

    standard[1].type = 'ENG'; // Thrusters
    standard[2].type = 'ENG'; // FSD
    cl++; // Increase accounts for Cargo Scoop

    for (i = 0, l = hps.length; i < l; i++) {
      hps[i].cat = 1;
      hps[i].enabled = enabled ? enabled[cl + i] * 1 : true;
      hps[i].priority = priorities && priorities[cl + i] ? priorities[cl + i] * 1 : 0;
      hps[i].type = hps[i].maxClass ? 'WEP' : 'SYS';
      hps[i].m = hps[i].id = null; // Resetting 'old' modul if there was one
      hps[i].discountedCost = 0;

      if (comps && comps.hardpoints[i] !== 0) {
        this.use(hps[i], comps.hardpoints[i], ModuleUtils.hardpoints(comps.hardpoints[i]), true);
      }
    }

    cl += hps.length; // Increase accounts for hardpoints

    for (i = 0, l = internal.length; i < l; i++) {
      internal[i].cat = 2;
      internal[i].enabled = enabled ? enabled[cl + i] * 1 : true;
      internal[i].priority = priorities && priorities[cl + i] ? priorities[cl + i] * 1 : 0;
      internal[i].type = 'SYS';
      internal[i].id = internal[i].m = null; // Resetting 'old' modul if there was one
      internal[i].discountedCost = 0;

      if (comps && comps.internal[i] !== 0) {
        this.use(internal[i], comps.internal[i], ModuleUtils.internal(comps.internal[i]), true);
      }
    }

    // Update aggragated stats
    if (comps) {
      this.updatePower()
          .updateJumpStats()
          .updateShieldStrength()
          .updateTopSpeed();
    }

    return this;
  }

  emptyHardpoints() {
    for (var i = this.hardpoints.length; i--; ) {
      this.use(this.hardpoints[i], null, null);
    }
    return this;
  }

  emptyInternal() {
    for (var i = this.internal.length; i--; ) {
      this.use(this.internal[i], null, null);
    }
    return this;
  }

  emptyUtility() {
    for (var i = this.hardpoints.length; i--; ) {
      if (!this.hardpoints[i].maxClass) {
        this.use(this.hardpoints[i], null, null);
      }
    }
    return this;
  }

  emptyWeapons() {
    for (var i = this.hardpoints.length; i--; ) {
      if (this.hardpoints[i].maxClass) {
        this.use(this.hardpoints[i], null, null);
      }
    }
    return this;
  }

  /**
   * Optimize for the lower mass build that can still boost and power the ship
   * without power management.
   * @param  {object} m Standard Module overrides
   */
  optimizeMass(m) {
    return this.emptyHardpoints().emptyInternal().useLightestStandard(m);
  }

  setCostIncluded(item, included) {
    if (item.incCost != included && item.m) {
      this.totalCost += included ? item.discountedCost : -item.discountedCost;
    }
    item.incCost = included;
    return this;
  }

  setSlotEnabled(slot, enabled) {
    if (slot.enabled != enabled) { // Enabled state is changing
      slot.enabled = enabled;
      if (slot.m) {
        this.priorityBands[slot.priority][powerUsageType(slot, slot.m)] += enabled ? slot.m.power : -slot.m.power;

        if (slot.m.grp == 'sg' || slot.m.grp == 'psg') {
          this.updateShieldStrength();
        } else if (slot.m.grp == 'sb') {
          this.shieldMultiplier += slot.m.shieldmul * (enabled ? 1 : -1);
          this.updateShieldStrength();
        } else if (slot.m.dps) {
          this.totalDps += slot.m.dps * (enabled ? 1 : -1);
        }

        this.updatePower();
      }
    }
    return this;
  }

  /**
   * Updates the ship's cumulative and aggregated stats based on the modul change.
   */
  updateStats(slot, n, old, preventUpdate) {
    var powerChange = slot == this.standard[0];

    if (old) {  // Old modul now being removed
      switch (old.grp) {
        case 'ft':
          this.fuelCapacity -= old.capacity;
          break;
        case 'cr':
          this.cargoCapacity -= old.capacity;
          break;
        case 'hr':
          this.armourAdded -= old.armouradd;
          break;
        case 'sb':
          this.shieldMultiplier -= slot.enabled ? old.shieldmul : 0;
          break;
      }

      if (slot.incCost && old.cost) {
        this.totalCost -= old.cost * this.modulCostMultiplier;
      }

      if (old.power && slot.enabled) {
        this.priorityBands[slot.priority][powerUsageType(slot, old)] -= old.power;
        powerChange = true;

        if (old.dps) {
          this.totalDps -= old.dps;
        }
      }
      this.unladenMass -= old.mass || 0;
    }

    if (n) {
      switch (n.grp) {
        case 'ft':
          this.fuelCapacity += n.capacity;
          break;
        case 'cr':
          this.cargoCapacity += n.capacity;
          break;
        case 'hr':
          this.armourAdded += n.armouradd;
          break;
        case 'sb':
          this.shieldMultiplier += slot.enabled ? n.shieldmul : 0;
          break;
      }

      if (slot.incCost && n.cost) {
        this.totalCost += n.cost * this.modulCostMultiplier;
      }

      if (n.power && slot.enabled) {
        this.priorityBands[slot.priority][powerUsageType(slot, n)] += n.power;
        powerChange = true;

        if (n.dps) {
          this.totalDps += n.dps;
        }
      }
      this.unladenMass += n.mass || 0;
    }

    this.ladenMass = this.unladenMass + this.cargoCapacity + this.fuelCapacity;
    this.armour = this.armourAdded + Math.round(this.baseArmour * this.armourMultiplier);

    if (!preventUpdate) {
      if (powerChange) {
        this.updatePower();
      }
      this.updateTopSpeed();
      this.updateJumpStats();
      this.updateShieldStrength();
    }
    return this;
  }

  updatePower() {
    var bands = this.priorityBands;
    var prevRetracted = 0, prevDeployed = 0;

    for (var i = 0, l = bands.length; i < l; i++) {
      var band = bands[i];
      prevRetracted = band.retractedSum = prevRetracted + band.retracted;
      prevDeployed = band.deployedSum = prevDeployed + band.deployed + band.retracted;
    }

    this.powerAvailable = this.standard[0].m.pGen;
    this.powerRetracted = prevRetracted;
    this.powerDeployed = prevDeployed;
    return this;
  };

  updateTopSpeed() {
    var speeds = Calc.speed(this.unladenMass + this.fuelCapacity, this.speed, this.boost, this.standard[1].m, this.pipSpeed);
    this.topSpeed = speeds['4 Pips'];
    this.topBoost = speeds.boost;
    return this;
  }

  updateShieldStrength() {
    var sgSlot = this.findInternalByGroup('sg');      // Find Shield Generator slot Index if any
    this.shieldStrength = sgSlot && sgSlot.enabled ? Calc.shieldStrength(this.hullMass, this.baseShieldStrength, sgSlot.m, this.shieldMultiplier) : 0;
    return this;
  }

  /**
   * Jump Range and total range calculations
   */
  updateJumpStats() {
    var fsd = this.standard[2].m;   // Frame Shift Drive;
    this.unladenRange = Calc.jumpRange(this.unladenMass + fsd.maxfuel, fsd, this.fuelCapacity); // Include fuel weight for jump
    this.fullTankRange = Calc.jumpRange(this.unladenMass + this.fuelCapacity, fsd, this.fuelCapacity); // Full Tanke
    this.ladenRange = Calc.jumpRange(this.ladenMass, fsd, this.fuelCapacity);
    this.unladenTotalRange = Calc.totalRange(this.unladenMass, fsd, this.fuelCapacity);
    this.ladenTotalRange = Calc.totalRange(this.unladenMass + this.cargoCapacity, fsd, this.fuelCapacity);
    this.maxJumpCount = Math.ceil(this.fuelCapacity / fsd.maxfuel);
    return this;
  }


  /**
   * Update a slot with a the modul if the id is different from the current id for this slot.
   * Has logic handling ModuleUtils that you may only have 1 of (Shield Generator or Refinery).
   *
   * @param {object}  slot            The modul slot
   * @param {string}  id              Unique ID for the selected module
   * @param {object}  modul           Properties for the selected module
   * @param {boolean} preventUpdate   If true, do not update aggregated stats
   */
  use(slot, id, modul, preventUpdate) {
    if (slot.id != id) { // Selecting a different modul
      // Slot is an internal slot, is not being emptied, and the selected modul group/type must be of unique
      if (slot.cat == 2 && modul && UNIQUE_MODULES.includes(modul.grp)) {
        // Find another internal slot that already has this type/group installed
        var similarSlot = this.findInternalByGroup(modul.grp);
        // If another slot has an installed modul with of the same type
        if (!preventUpdate && similarSlot && similarSlot !== slot) {
          this.updateStats(similarSlot, null, similarSlot.m);
          similarSlot.id = similarSlot.m = null;  // Empty the slot
          similarSlot.discountedCost = 0;
        }
      }
      var oldModule = slot.m;
      slot.id = id;
      slot.m = modul;
      slot.discountedCost = (modul && modul.cost) ? modul.cost * this.modulCostMultiplier : 0;
      this.updateStats(slot, modul, oldModule, preventUpdate);
    }
    return this;
  }

  /**
   * [useBulkhead description]
   * @param  {[type]} index         [description]
   * @param  {[type]} preventUpdate [description]
   * @return {[type]}               [description]
   */
  useBulkhead(index, preventUpdate) {
    var oldBulkhead = this.bulkheads.m;
    this.bulkheads.id = index;
    this.bulkheads.m = ModuleUtils.bulkheads(this.id, index);
    this.bulkheads.discountedCost = this.bulkheads.m.cost * this.modulCostMultiplier;
    this.armourMultiplier = ArmourMultiplier[index];
    this.updateStats(this.bulkheads, this.bulkheads.m, oldBulkhead, preventUpdate);

    return this;
  }

  /**
   * [useStandard description]
   * @param  {[type]} rating [description]
   * @return {[type]}        [description]
   */
  useStandard(rating) {
    for (var i = this.standard.length - 1; i--; ) { // All except Fuel Tank
      var id = this.standard[i].maxClass + rating;
      this.use(this.standard[i], id, ModuleUtils.standard(i, id));
    }
    return this;
  }

  /**
   * Use the lightest standard ModuleUtils unless otherwise specified
   * @param  {object} m Module overrides
   */
  useLightestStandard(m) {
    m = m || {};

    var standard = this.standard,
        pd = m.pd || this.availCS.lightestPowerDist(this.boostEnergy), // Find lightest Power Distributor that can still boost;
        fsd = m.fsd || standard[2].maxClass + 'A',
        ls = m.ls || standard[3].maxClass + 'D',
        s = m.s || standard[5].maxClass + 'D',
        updated;

    this.useBulkhead(0)
        .use(standard[2], fsd, ModuleUtils.standard(2, fsd))   // FSD
        .use(standard[3], ls, ModuleUtils.standard(3, ls))     // Life Support
        .use(standard[5], s, ModuleUtils.standard(5, s))       // Sensors
        .use(standard[4], pd, ModuleUtils.standard(4, pd));    // Power Distributor

    // Thrusters and Powerplant must be determined after all other ModuleUtils are mounted
    // Loop at least once to determine absolute lightest PD and TH
    do {
      updated = false;
      // Find lightest Thruster that still works for the ship at max mass
      var th = m.th || this.availCS.lightestThruster(this.ladenMass);
      if (th != standard[1].id) {
        this.use(standard[1], th, ModuleUtils.standard(1, th));
        updated = true;
      }
      // Find lightest Power plant that can power the ship
      var pp = m.pp || this.availCS.lightestPowerPlant(Math.max(this.powerRetracted, this.powerDeployed), m.ppRating);

      if (pp != standard[0].id) {
        this.use(standard[0], pp, ModuleUtils.standard(0, pp));
        updated = true;
      }
    } while (updated);

    return this;
  }

  useUtility(group, rating, clobber) {
    var modul = ModuleUtils.findHardpoint(group, 0, rating);
    for (var i = this.hardpoints.length; i--; ) {
      if ((clobber || !this.hardpoints[i].m) && !this.hardpoints[i].maxClass) {
        this.use(this.hardpoints[i], modul.id, modul);
      }
    }
    return this;
  }

  useWeapon(group, mount, clobber, missile) {
    var hps = this.hardpoints;
    for (var i = hps.length; i--; ) {
      if (hps[i].maxClass) {
        var size = hps[i].maxClass, modul;
        do {
          modul = ModuleUtils.findHardpoint(group, size, null, null, mount, missile);
          if ((clobber || !hps[i].m) && modul) {
            this.use(hps[i], modul.id, modul);
            break;
          }
        } while (!modul && (--size > 0));
      }
    }
    return this;
  }

  /**
   * Will change the priority of the specified slot if the new priority is valid
   * @param  {object} slot        The slot to be updated
   * @param  {number} newPriority The new priority to be set
   * @return {boolean}            Returns true if the priority was changed (within range)
   */
  changePriority(slot, newPriority) {
    if (newPriority >= 0 && newPriority < this.priorityBands.length) {
      var oldPriority = slot.priority;
      slot.priority = newPriority;

      if (slot.enabled) { // Only update power if the slot is enabled
        var usage = powerUsageType(slot, slot.m);
        this.priorityBands[oldPriority][usage] -= slot.m.power;
        this.priorityBands[newPriority][usage] += slot.m.power;
        this.updatePower();
      }
      return true;
    }
    return false;
  }
}
