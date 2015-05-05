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
    this.sgSI = null;    // Shield Generator Index

    for (p in properties) { this[p] = properties[p]; }  // Copy all base properties from shipData

    for (slotType in slots) {   // Initialize all slots
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
        if (internal[i].c.grp == 'sg') {
          this.sgSI = i;
        }
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
    var c = _.reduce(this.common, optsSum, {cost: 0, power: 0, mass: 0, capacity: 0});
    var i = _.reduce(this.internal, optsSum, {cost: 0, power: 0, mass: 0, capacity: 0, armouradd: 0});
    var h = _.reduce(this.hardpoints, optsSum, {cost: 0, power: 0, mass: 0, shieldmul: 1});
    var fsd = this.common[2].c;   // Frame Shift Drive;

    this.totalCost = c.cost + i.cost + h.cost + (this.incCost? this.cost : 0) + (this.bulkheads.incCost? this.bulkheads.c.cost : 0);
    this.unladenMass = c.mass + i.mass + h.mass + this.mass + this.bulkheads.c.mass;
    this.powerAvailable = this.common[0].c.pGen;
    this.fuelCapacity = this.common[6].c.capacity;
    this.maxMass = this.common[1].c.maxmass;
    this.cargoCapacity = i.capacity;
    this.ladenMass = this.unladenMass + this.cargoCapacity + this.fuelCapacity;
    this.powerRetracted = c.power + i.power + (this.cargoScoop.enabled? this.cargoScoop.c.power : 0);
    this.powerDeployed = this.powerRetracted + h.power;
    this.armourAdded = i.armouradd;
    this.shieldMultiplier = h.shieldmul;
    this.unladenJumpRange = calcJumpRange(this.unladenMass + fsd.maxfuel, fsd); // Include fuel weight for jump
    this.ladenJumpRange = calcJumpRange(this.ladenMass, fsd);
    this.shieldStrength = this.sgSI !== null? calcShieldStrength(this.mass, this.shields, this.internal[this.sgSI].c, this.shieldMultiplier) : 0;
    this.armourTotal = this.armourAdded + this.armour;
    // TODO: shield recharge rate
    // TODO: armor bonus / damage reduction for bulkheads
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
    var c = slot.c
    if (c) { // The slot has a component mounted
      sum.cost += (slot.incCost && c.cost)? c.cost : 0;
      sum.power += (slot.enabled && c.power)? c.power : 0;
      sum.mass += c.mass || 0;
      sum.capacity += c.capacity || 0;
      sum.shieldmul += c.shieldmul || 0;
      sum.armouradd += c.armouradd || 0;
    }
    return sum;
  }

  Ship.prototype.useBulkhead = function(index) {
    this.bulkheads.id = index;
    this.bulkheads.c = Components.bulkheads(this.id, index);
    this.updateTotals();  // Update mass, range, shield strength, armor
  }

  /**
   * Update a slot with a the component if the id is different from the current id for this slot.
   * Frees the slot of the current component if the id matches the current id for the slot.
   *
   * @param {object} slot      The component slot
   * @param {string} id        Unique ID for the selected component
   * @param {object} component Properties for the selected component
   */
  Ship.prototype.use = function(slot, id, component) {
    // TODO: only single refinery allowed
    if (slot.id != id) { // Selecting a different component
      slot.id = id;
      slot.c = component;
      var slotIndex = this.internal.indexOf(slot);
      if(slot.id == null) { // Slot has been emptied
        if(this.sgSI == slotIndex) {  // The slot containing the shield generator was emptied
          this.sgSI = null;
        }
      } else {
        // Selected component is a Shield Generator
        if(component.grp == 'sg') {
          // You can only have one shield Generator
          if (this.sgSI !== null && this.sgSI != slotIndex) {
            // A shield generator is already selected in a different slot
            this.internal[this.sgSI].id = null;
            this.internal[this.sgSI].c = null;
          }
          this.sgSI = slotIndex;
        // Replacing a shield generator with something else
        } else if (this.sgSI == slotIndex) {
          this.sgSI = null;
        }
      }
      this.updateTotals();
    }
  };

  return Ship;
}]);
