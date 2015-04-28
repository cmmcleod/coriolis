angular.module('shipyard').factory('ShipFactory', ['components', 'CalcShieldStrength', 'CalcJumpRange', 'lodash', function (Components, calcShieldStrength, calcJumpRange, _) {

  /**
   * Ship model used to track all ship components and properties.
   *
   * @param {string} id       Unique ship Id / Key
   * @param {object} shipData Data/defaults from the Ship database.
   */
  function Ship(id, shipData) {
    this.id = id;
    this.defaults = shipData.defaultComponents;
    this.incCost = true;
    this.cargoScoop = { enabled: true, c: { name: 'Cargo Scoop', class: 1, rating: 'H', power: 0.6} };
    this.sgSI = null; // Shield Generator Slot Index

    // Copy all base properties from shipData
    angular.forEach(shipData,function(o,k){
      if(typeof o != 'object') {
        this[k] = o;
      }
    }.bind(this));

    angular.forEach(shipData.slotCap, function (slots, slotGroup) {   // Initialize all slots
      this[slotGroup] = [];   // Initialize Slot group (Common, Hardpoints, Internal)
      for(var i = 0; i < slots.length; i++){
        this[slotGroup].push({id: null, c: null, enabled: true, incCost: true, maxClass: slots[i]});
      }
    }.bind(this));
  }

  /**
   * Reset the ship to the original 'manufacturer' defaults.
   */
  Ship.prototype.clear = function() {
    this.buildWith(DB.ships[this.id].defaultComponents);
  };

  /**
   * Reset the current build to the previously used default
   */
  Ship.prototype.reset = function() {
    this.buildWith(this.defaults);
  };

  /**
   * Builds/Updates the ship instance with the components[comps] passed in.
   * @param {object} comps Collection of components used to build the ship
   */
  Ship.prototype.buildWith = function(comps) {
    var internal = this.internal;
    var common = this.common;
    var hps = this.hardpoints;
    var availCommon = DB.components.common;
    var availHardPoints = DB.components.hardpoints;
    var availInternal = DB.components.internal;
    var i,l;

    this.bulkheads = { incCost: true, maxClass: 8, id: comps.bulkheads || 0, c: DB.components.bulkheads[this.id][comps.bulkheads || 0] };

    for(i = 0, l = comps.common.length; i < l; i++) {
      common[i].id = comps.common[i];
      common[i].c = availCommon[i][comps.common[i]];
    }

    for(i = 0, l = comps.hardpoints.length; i < l; i++) {
      if(comps.hardpoints[i] !== 0) {
        hps[i].id = comps.hardpoints[i];
        hps[i].c = availHardPoints[comps.hardpoints[i]];
      }
    }

    for(i = 0, l = comps.internal.length; i < l; i++) {
      if(comps.internal[i] !== 0) {
        internal[i].id = comps.internal[i];
        internal[i].c = Components.findInternal(comps.internal[i]);
        if(internal[i].c.group == 'sg') {
          this.sgSI = i;
        }
      }
    }
    this.code = this.toCode();
    this.updateTotals();
  };

  /**
   * Serializes the selected components for all slots to a URL friendly string.
   * @return {string} Encoded string of components
   */
  Ship.prototype.toCode = function() {
    var data = [
      this.bulkheads.id,
      _.map(this.common, idToStr),
      _.map(this.hardpoints, idToStr),
      _.map(this.internal, idToStr),
    ];

    return _.flatten(data).join('');
  };

  /**
   * Utility function to retrieve a safe string for selected component for a slot.
   * Used for serialization to code only.
   *
   * @private
   * @param  {object} slot The slot object.
   * @return {string}      The id of the selected component or '-' if none selected
   */
  function idToStr(slot) {
    return (slot.id === null)? '-' : slot.id;
  }

  /**
   * Updates the current ship instance's slots with components determined by the
   * code.
   *
   * @param {string} code [description]
   */
  Ship.prototype.buildFromCode = function (code) {
    var commonCount = this.common.length;
    var hpCount = commonCount + this.hardpoints.length;
    var comps = {
      bulkheads: code.charAt(0) * 1,
      common: new Array(this.common.length),
      hardpoints: new Array(this.hardpoints.length),
      internal: new Array(this.internal.length)
    };

    // TODO: improve...
    for (var i = 1, c = 0, l = code.length; i < l; i++) {
      var isNull = code.charAt(i) == '-';
      if (c < commonCount) {
        comps.common[c] = isNull? 0 : code.substring(i, i + 2);
      } else if (c < hpCount) {
        comps.hardpoints[c - commonCount] = isNull? 0 : code.substring(i, i + 2);
      } else {
        comps.internal[c - hpCount] = isNull? 0 : code.substring(i, i + 2);
      }
      if (!isNull) {
        i++;
      }
      c++;
    }
    this.defaults = comps;
    this.buildWith(comps);
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
    // TODO: thermal load and weapon recharge rate
    this.code = this.toCode();
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
    this.bulkheads.c = DB.components.bulkheads[this.id][index];
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
        if(component.group == 'sg') {
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

  /**
   * Ship Factory function. Created a new instance of a ship based on the ship type.
   *
   * @param  {string} id       Id/Key for the Ship type
   * @param  {object} shipData [description]
   * @param  {string} code     [optional] Code to build the ship with
   * @return {Ship}            A new Ship instance
   */
  return function (id, shipData, code) {
    var s = new Ship(id, shipData);
    if (code) {
      s.buildFromCode(code);
    } else {
      s.clear();
    }
    return s;
  };
}]);
