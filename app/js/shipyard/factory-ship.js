angular.module('shipyard').factory('Ship', ['Components', 'calcShieldStrength', 'calcJumpRange', 'lodash', function(Components, calcShieldStrength, calcJumpRange, _) {

  /**
   * Ship model used to track all ship components and properties.
   *
   * @param {string} id         Unique ship Id / Key
   * @param {object} properties Basic ship properties such as name, manufacturer, mass, etc
   * @param {object} slots      Collection of slot groups (standard/common, internal, hardpoints) with their max class size.
   */
  function Ship(id, properties, slots) {
    this.id = id;
    this.cargoScoop = { c: Components.cargoScoop(), type: 'SYS' };
    this.bulkheads = { incCost: true, maxClass: 8, discount: 1 };

    for (var p in properties) { this[p] = properties[p]; }  // Copy all base properties from shipData

    for (var slotType in slots) {   // Initialize all slots
      var slotGroup = slots[slotType];
      var group = this[slotType] = [];   // Initialize Slot group (Common, Hardpoints, Internal)
      for (var i = 0; i < slotGroup.length; i++) {
        group.push({ id: null, c: null, incCost: true, maxClass: slotGroup[i], discount: 1 });
      }
    }
    this.c = { incCost: true, discount: 1, c: { name: this.name, cost: this.cost } };  // Make a 'Ship' component similar to other components

    this.costList = _.union(this.internal, this.common, this.hardpoints);
    this.costList.push(this.bulkheads);  // Add The bulkheads
    this.costList.unshift(this.c); // Add the ship itself to the list

    this.powerList = _.union(this.internal, this.hardpoints);
    this.powerList.unshift(this.cargoScoop);
    this.powerList.unshift(this.common[1]);  // Add Thrusters
    this.powerList.unshift(this.common[5]);  // Add Sensors
    this.powerList.unshift(this.common[4]);  // Add Power Distributor
    this.powerList.unshift(this.common[3]);  // Add Life Support
    this.powerList.unshift(this.common[2]);  // Add FSD
    this.powerList.unshift(this.common[0]);  // Add Power Plant

    this.priorityBands = [
      { deployed: 0, retracted: 0 },
      { deployed: 0, retracted: 0 },
      { deployed: 0, retracted: 0 },
      { deployed: 0, retracted: 0 },
      { deployed: 0, retracted: 0 }
    ];
  }

  /**
   * Builds/Updates the ship instance with the components[comps] passed in.
   * @param {object} comps Collection of components used to build the ship
   */
  Ship.prototype.buildWith = function(comps, priorities, enabled) {
    var internal = this.internal,
        common = this.common,
        hps = this.hardpoints,
        bands = this.priorityBands,
        cl = common.length,
        i, l;

    // Reset Cumulative stats
    this.fuelCapacity = 0;
    this.cargoCapacity = 0;
    this.ladenMass = 0;
    this.armourAdded = 0;
    this.shieldMultiplier = 1;
    this.totalCost = this.cost;
    this.unladenMass = this.mass;
    this.armourTotal = this.armour;

    this.bulkheads.c = null;
    this.useBulkhead(comps.bulkheads || 0, true);
    this.cargoScoop.priority = priorities ? priorities[0] * 1 : 0;
    this.cargoScoop.enabled = enabled ? enabled[0] * 1 : true;

    for (i = 0, l = this.priorityBands.length; i < l; i++) {
      this.priorityBands[i].deployed = 0;
      this.priorityBands[i].retracted = 0;
    }

    if (this.cargoScoop.enabled) {
      bands[this.cargoScoop.priority].retracted += this.cargoScoop.c.power;
    }

    for (i = 0; i < cl; i++) {
      common[i].enabled = enabled ? enabled[i + 1] * 1 : true;
      common[i].priority = priorities ? priorities[i + 1] * 1 : 0;
      common[i].type = 'SYS';
      common[i].c = common[i].id = null; // Resetting 'old' component if there was one
      this.use(common[i], comps.common[i], Components.common(i, comps.common[i]), true);
    }

    common[1].type = 'ENG'; // Thrusters
    common[2].type = 'ENG'; // FSD
    cl++; // Increase accounts for Cargo Scoop

    for (i = 0, l = hps.length; i < l; i++) {
      hps[i].enabled = enabled ? enabled[cl + i] * 1 : true;
      hps[i].priority = priorities ? priorities[cl + i] * 1 : 0;
      hps[i].type = hps[i].maxClass ? 'WEP' : 'SYS';
      hps[i].c = hps[i].id = null; // Resetting 'old' component if there was one

      if (comps.hardpoints[i] !== 0) {
        this.use(hps[i], comps.hardpoints[i], Components.hardpoints(comps.hardpoints[i]), true);
      }
    }

    cl += hps.length; // Increase accounts for hardpoints

    for (i = 0, l = internal.length; i < l; i++) {
      internal[i].enabled = enabled ? enabled[cl + i] * 1 : true;
      internal[i].priority = priorities ? priorities[cl + i] * 1 : 0;
      internal[i].type = 'SYS';
      internal[i].id = internal[i].c = null; // Resetting 'old' component if there was one

      if (comps.internal[i] !== 0) {
        this.use(internal[i], comps.internal[i], Components.internal(comps.internal[i]), true);
      }
    }

    // Update aggragated stats
    this.updatePower();
    this.updateJumpStats();
    this.updateShieldStrength();
  };

  Ship.prototype.useBulkhead = function(index, preventUpdate) {
    var oldBulkhead = this.bulkheads.c;
    this.bulkheads.id = index;
    this.bulkheads.c = Components.bulkheads(this.id, index);
    this.updateStats(this.bulkheads, this.bulkheads.c, oldBulkhead, preventUpdate);
  };

  /**
   * Update a slot with a the component if the id is different from the current id for this slot.
   * Has logic handling components that you may only have 1 of (Shield Generator or Refinery).
   *
   * @param {object}  slot            The component slot
   * @param {string}  id              Unique ID for the selected component
   * @param {object}  component       Properties for the selected component
   * @param {boolean} preventUpdate   If true, do not update aggregated stats
   */
  Ship.prototype.use = function(slot, id, component, preventUpdate) {
    if (slot.id != id) { // Selecting a different component
      var slotIndex = preventUpdate ? -1 : this.internal.indexOf(slot);
      // Slot is an internal slot, is not being emptied, and the selected component group/type must be of unique
      if (slotIndex != -1 && component && _.includes(['sg', 'rf', 'fs'], component.grp)) {
        // Find another internal slot that already has this type/group installed
        var similarSlotIndex = this.findInternalByGroup(component.grp);
        // If another slot has an installed component with of the same type
        if (similarSlotIndex != -1 && similarSlotIndex != slotIndex) {
          // Empty the slot
          var similarSlot = this.internal[similarSlotIndex];
          this.updateStats(similarSlot, null, similarSlot.c, true);  // Update stats but don't trigger a global update
          similarSlot.id = null;
          similarSlot.c = null;
        }
      }
      var oldComponent = slot.c;
      slot.id = id;
      slot.c = component;
      this.updateStats(slot, component, oldComponent, preventUpdate);
    }
  };


  /**
   * Calculate jump range using the installed FSD and the
   * specified mass which can be more or less than ships actual mass
   * @param  {number} mass Mass in tons
   * @param  {number} fuel Fuel available in tons
   * @return {number}      Jump range in Light Years
   */
  Ship.prototype.jumpRangeWithMass = function(mass, fuel) {
    return calcJumpRange(mass, this.common[2].c, fuel);
  };

  /**
   * Find an internal slot that has an installed component of the specific group.
   *
   * @param  {string} group Component group/type
   * @return {number}       The index of the slot in ship.internal
   */
  Ship.prototype.findInternalByGroup = function(group) {
    return _.findIndex(this.internal, function(slot) {
      return slot.c && slot.c.grp == group;
    });
  };

  /**
   * Will change the priority of the specified slot if the new priority is valid
   * @param  {object} slot        The slot to be updated
   * @param  {number} newPriority The new priority to be set
   * @return {boolean}            Returns true if the priority was changed (within range)
   */
  Ship.prototype.changePriority = function(slot, newPriority) {
    if (newPriority >= 0 && newPriority < this.priorityBands.length) {
      var oldPriority = slot.priority;
      slot.priority = newPriority;

      if (slot.enabled) { // Only update power if the slot is enabled
        var usage = (slot.c.passive || this.hardpoints.indexOf(slot) == -1) ? 'retracted' : 'deployed';
        this.priorityBands[oldPriority][usage] -= slot.c.power;
        this.priorityBands[newPriority][usage] += slot.c.power;
        this.updatePower();
      }
      return true;
    }
    return false;
  };

  Ship.prototype.setCostIncluded = function(item, included) {
    if (item.incCost != included && item.c) {
      this.totalCost += included ? item.c.cost : -item.c.cost;
    }
    item.incCost = included;
  };

  Ship.prototype.setSlotEnabled = function(slot, enabled) {
    if (slot.enabled != enabled && slot.c) { // Enabled state is changing
      var usage = (slot.c.passive || this.hardpoints.indexOf(slot) == -1) ? 'retracted' : 'deployed';
      this.priorityBands[slot.priority][usage] += enabled ? slot.c.power : -slot.c.power;
      this.updatePower();
    }
    slot.enabled = enabled;
  };

  Ship.prototype.getSlotStatus = function(slot, deployed) {
    if (!slot.c) { // Empty Slot
      return 0;   // No Status (Not possible)
    } else if (!slot.enabled) {
      return 1;   // Disabled
    } else if (deployed) {
      return this.priorityBands[slot.priority].deployedSum > this.powerAvailable ? 2 : 3; // Offline : Online
    } else if (this.hardpoints.indexOf(slot) != -1 && !slot.c.passive) {  // Active hardpoints have no retracted status
      return 0;  // No Status (Not possible)
    }
    return this.priorityBands[slot.priority].retractedSum > this.powerAvailable ? 2 : 3;    // Offline : Online
  };

  /**
   * Updates the ship's cumulative and aggregated stats based on the component change.
   */
  Ship.prototype.updateStats = function(slot, n, old, preventUpdate) {
    var isHardPoint = this.hardpoints.indexOf(slot) != -1;
    var powerChange = slot == this.common[0];

    if (old) {  // Old component now being removed
      console.log('this shouldn\'t happen', old);
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
          this.shieldMultiplier -= old.shieldmul;
          break;
      }

      if (slot.incCost && old.cost) {
        this.totalCost -= old.cost;
      }

      if (old.power && slot.enabled) {
        this.priorityBands[slot.priority][(isHardPoint && !old.passive) ? 'deployed' : 'retracted'] -= old.power;
        powerChange = true;
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
        case 't':
          this.maxMass = n.maxmass;
          break;
        case 'hr':
          this.armourAdded += n.armouradd;
          break;
        case 'sb':
          this.shieldMultiplier += n.shieldmul;
          break;
      }

      if (slot.incCost && n.cost) {
        this.totalCost += n.cost;
      }

      if (n.power && slot.enabled) {
        this.priorityBands[slot.priority][(isHardPoint && !n.passive) ? 'deployed' : 'retracted'] += n.power;
        powerChange = true;
      }
      this.unladenMass += n.mass || 0;
    }

    this.ladenMass = this.unladenMass + this.cargoCapacity + this.fuelCapacity;
    this.armourTotal = this.armourAdded + this.armour;

    if (!preventUpdate) {
      if (powerChange) {
        this.updatePower();
      }
      this.updateJumpStats();
      this.updateShieldStrength();
    }
  };

  Ship.prototype.updatePower = function() {
    var bands = this.priorityBands;
    var prevRetracted = 0, prevDeployed = 0;

    for (var i = 0, l = bands.length; i < l; i++) {
      var band = bands[i];
      prevRetracted = band.retractedSum = prevRetracted + band.retracted;
      prevDeployed = band.deployedSum = prevDeployed + band.deployed + band.retracted;
    }

    this.powerAvailable = this.common[0].c.pGen;
    this.powerRetracted = prevRetracted;
    this.powerDeployed = prevDeployed;
  };

  Ship.prototype.updateShieldStrength = function() {
    var sgSI = this.findInternalByGroup('sg');      // Find Shield Generator slot Index if any
    this.shieldStrength = sgSI != -1 ? calcShieldStrength(this.mass, this.shields, this.internal[sgSI].c, this.shieldMultiplier) : 0;
  };

  /**
   * Jump Range and total range calculations
   */
  Ship.prototype.updateJumpStats = function() {
    var fsd = this.common[2].c;                     // Frame Shift Drive;
    var fuelRemaining = this.fuelCapacity % fsd.maxfuel;  // Fuel left after making N max jumps
    var jumps = this.fuelCapacity / fsd.maxfuel;
    this.unladenRange = calcJumpRange(this.unladenMass + fsd.maxfuel, fsd, this.fuelCapacity); // Include fuel weight for jump
    this.fullTankRange = calcJumpRange(this.unladenMass + this.fuelCapacity, fsd, this.fuelCapacity); // Full Tanke
    this.ladenRange = calcJumpRange(this.ladenMass, fsd, this.fuelCapacity);
    this.maxJumpCount = Math.ceil(jumps);  // Number of full fuel jumps + final jump to empty tank

    // Going backwards, start with the last jump using the remaining fuel
    this.unladenTotalRange = fuelRemaining > 0 ? calcJumpRange(this.unladenMass + fuelRemaining, fsd, fuelRemaining) : 0;
    this.ladenTotalRange = fuelRemaining > 0 ? calcJumpRange(this.unladenMass + this.cargoCapacity + fuelRemaining, fsd, fuelRemaining) : 0;

    // For each max fuel jump, calculate the max jump range based on fuel left in the tank
    for (var j = 0, l = Math.floor(jumps); j < l; j++) {
      fuelRemaining += fsd.maxfuel;
      this.unladenTotalRange += calcJumpRange(this.unladenMass + fuelRemaining, fsd);
      this.ladenTotalRange += calcJumpRange(this.unladenMass + this.cargoCapacity + fuelRemaining, fsd);
    }
  };

  return Ship;
}]);
