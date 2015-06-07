angular.module('shipyard').factory('Ship', ['Components', 'calcShieldStrength', 'calcJumpRange', 'lodash', function (Components, calcShieldStrength, calcJumpRange, _) {

  /**
   * Ship model used to track all ship components and properties.
   *
   * @param {string} id         Unique ship Id / Key
   * @param {object} properties Basic ship properties such as name, manufacturer, mass, etc
   * @param {object} slots      Collection of slot groups (standard/common, internal, hardpoints) with their max class size.
   */
  function Ship(id, properties, slots) {
    this.id = id;
    this.incCost = true;
    this.cargoScoop = { enabled: true, c: Components.cargoScoop() };
    this.bulkheads = { incCost: true, maxClass: 8 };
    this.deployed = false;

    for (var p in properties) { this[p] = properties[p]; }  // Copy all base properties from shipData

    for (var slotType in slots) {   // Initialize all slots
      var slotGroup = slots[slotType];
      var group = this[slotType] = [];   // Initialize Slot group (Common, Hardpoints, Internal)
      for(var i = 0; i < slotGroup.length; i++){
        group.push({id: null, c: null, enabled: true, incCost: true, maxClass: slotGroup[i]});
      }
    }
  }

  /**
   * Builds/Updates the ship instance with the components[comps] passed in.
   * @param {object} comps Collection of components used to build the ship
   */
  Ship.prototype.buildWith = function(comps) {
    var internal = this.internal;
    var common = this.common;
    var hps = this.hardpoints;
    var i,l;

    this.bulkheads.id = comps.bulkheads || 0;
    this.bulkheads.c = Components.bulkheads(this.id, this.bulkheads.id);

    for(i = 0, l = comps.common.length; i < l; i++) {
      common[i].id = comps.common[i];
      common[i].c = Components.common(i, comps.common[i]);
    }

    for(i = 0, l = comps.hardpoints.length; i < l; i++) {
      if (comps.hardpoints[i] !== 0) {
        hps[i].id = comps.hardpoints[i];
        hps[i].c = Components.hardpoints(comps.hardpoints[i]);
      } else {
        hps[i].c = hps[i].id = null;
      }
    }

    for(i = 0, l = comps.internal.length; i < l; i++) {
      if (comps.internal[i] !== 0) {
        internal[i].id = comps.internal[i];
        internal[i].c = Components.internal(comps.internal[i]);
      } else {
          internal[i].id = internal[i].c = null;
      }
    }
    this.updateTotals();
  };

  /**
   * Updates the ship totals based on the components for every slot.
   */
  Ship.prototype.updateTotals = function() {
    var c = _.reduce(this.common, optsSum, {cost: 0, power: 0, mass: 0});
    var i = _.reduce(this.internal, optsSum, {cost: 0, power: 0, mass: 0, fuel: 0, cargo: 0, armouradd: 0});
    var h = _.reduce(this.hardpoints, hpSum, {cost: 0, active: 0, passive: 0, mass: 0, shieldmul: 1});
    var fsd = this.common[2].c;                     // Frame Shift Drive;
    var sgSI = this.findInternalByGroup('sg');      // Find Shield Generator slot Index if any

    this.totalCost = c.cost + i.cost + h.cost + (this.incCost? this.cost : 0) + (this.bulkheads.incCost? this.bulkheads.c.cost : 0);
    this.unladenMass = c.mass + i.mass + h.mass + this.mass + this.bulkheads.c.mass;
    this.powerAvailable = this.common[0].c.pGen;            // Power Plant
    this.fuelCapacity = this.common[6].c.capacity + i.fuel; // Fuel Tank + Internal Fuel Tanks
    this.maxMass = this.common[1].c.maxmass;                // Thrusters Max Mass
    this.cargoCapacity = i.cargo;
    this.ladenMass = this.unladenMass + this.cargoCapacity + this.fuelCapacity;
    this.powerRetracted = c.power + i.power + h.passive + (this.cargoScoop.enabled? this.cargoScoop.c.power : 0);
    this.powerDeployed = this.powerRetracted + h.active;
    this.armourAdded = i.armouradd;
    this.shieldMultiplier = h.shieldmul;
    this.shieldStrength = sgSI != -1? calcShieldStrength(this.mass, this.shields, this.internal[sgSI].c, this.shieldMultiplier) : 0;
    this.armourTotal = this.armourAdded + this.armour;

    // Jump Range and total range calculations
    var fuelRemaining = this.fuelCapacity % fsd.maxfuel;  // Fuel left after making N max jumps
    var jumps = this.fuelCapacity / fsd.maxfuel;
    this.unladenRange = calcJumpRange(this.unladenMass + fsd.maxfuel, fsd, this.fuelCapacity); // Include fuel weight for jump
    this.fullTankRange = calcJumpRange(this.unladenMass + this.fuelCapacity, fsd, this.fuelCapacity); // Full Tanke
    this.ladenRange = calcJumpRange(this.ladenMass, fsd, this.fuelCapacity);
    this.maxJumpCount = Math.ceil(jumps);  // Number of full fuel jumps + final jump to empty tank

    // Going backwards, start with the last jump using the remaining fuel
    this.unladenTotalRange = fuelRemaining > 0? calcJumpRange(this.unladenMass + fuelRemaining, fsd, fuelRemaining): 0;
    this.ladenTotalRange = fuelRemaining > 0? calcJumpRange(this.unladenMass + this.cargoCapacity + fuelRemaining, fsd, fuelRemaining): 0;

    // For each max fuel jump, calculate the max jump range based on fuel left in the tank
    for (var j = 0, jumps = Math.floor(jumps); j < jumps; j++) {
      fuelRemaining += fsd.maxfuel;
      this.unladenTotalRange += calcJumpRange(this.unladenMass + fuelRemaining, fsd);
      this.ladenTotalRange += calcJumpRange(this.unladenMass + this.cargoCapacity + fuelRemaining, fsd);
    }

    // TODO: armor bonus / damage reduction for bulkheads
    // TODO: Damage / DPS total (for all weapons)
  };

  /**
   * Utilify function for summing the components properties
   *
   * @private
   * @param  {object} sum     Sum of cost, power, mass, capacity
   * @param  {object} slot    Slot object
   * @return {object}         The mutated sum object
   */
  function optsSum(sum, slot) {
    var c = slot.c;
    if (c) { // The slot has a component installed
      sum.cost += (slot.incCost && c.cost)? c.cost : 0;
      sum.power += (slot.enabled && c.power)? c.power : 0;
      sum.mass += c.mass || 0;
      if (c.grp == 'ft') {  // Internal Fuel Tank
        sum.fuel += c.capacity;
      }
      else if (c.grp == 'cr') { // Internal Cargo Rack
        sum.cargo += c.capacity;
      }
      sum.armouradd += c.armouradd || 0;
    }
    return sum;
  }

    /**
   * Utilify function for summing the hardpoint properties
   *
   * @private
   * @param  {object} sum     Sum of cost, power, etc
   * @param  {object} slot    Slot object
   * @return {object}         The mutated sum object
   */
  function hpSum(sum, slot) {
    var c = slot.c;
    if (c) { // The slot has a component installed
      sum.cost += (slot.incCost && c.cost)? c.cost : 0;
      sum[c.passive? 'passive': 'active'] += slot.enabled? c.power : 0;
      sum.mass += c.mass || 0;
      sum.shieldmul += c.shieldmul || 0;
    }
    return sum;
  }

  Ship.prototype.useBulkhead = function(index) {
    this.bulkheads.id = index;
    this.bulkheads.c = Components.bulkheads(this.id, index);
    this.updateTotals();  // Update mass, range, shield strength, armor
  };

  /**
   * Update a slot with a the component if the id is different from the current id for this slot.
   * Has logic handling components that you may only have 1 of (Shield Generator or Refinery).
   *
   * @param {object} slot      The component slot
   * @param {string} id        Unique ID for the selected component
   * @param {object} component Properties for the selected component
   */
  Ship.prototype.use = function(slot, id, component) {
    if (slot.id != id) { // Selecting a different component
      var slotIndex = this.internal.indexOf(slot);
      // Slot is an internal slot, is not being emptied, and the selected component group/type must be of unique
      if(slotIndex != -1 && component && _.includes(['sg','rf','fs'],component.grp)) {
        // Find another internal slot that already has this type/group installed
        var similarSlotIndex = this.findInternalByGroup(component.grp);
        // If another slot has an installed component with of the same type
        if (similarSlotIndex != -1 && similarSlotIndex != slotIndex) {
          // Empty the slot
          this.internal[similarSlotIndex].id = null;
          this.internal[similarSlotIndex].c = null;
        }
      }
      // Update slot with selected component (or empty)
      slot.id = id;
      slot.c = component;
      this.updateTotals();
    }
  };

  /**
   * Calculate jump range using the installed FSD and the
   * specified mass which can be more or less than ships actual mass
   * @param  {number} mass Mass in tons
   * @param  {number} fuel Fuel available in tons
   * @return {number}      Jump range in Light Years
   */
  Ship.prototype.jumpRangeWithMass = function (mass, fuel) {
    return calcJumpRange(mass, this.common[2].c, fuel);
  };

  /**
   * Find an internal slot that has an installed component of the specific group.
   *
   * @param  {string} group Component group/type
   * @return {number}       The index of the slot in ship.internal
   */
  Ship.prototype.findInternalByGroup = function(group) {
    return _.findIndex(this.internal, function (slot) {
      return slot.c && slot.c.grp == group;
    });
  };

  return Ship;
}]);
