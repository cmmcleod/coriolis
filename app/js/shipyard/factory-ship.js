angular.module('shipyard').factory('ShipFactory', ['components', 'lodash', function (Components, _) {

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
    this.cargoScoop = { enabled: true, c: { name: 'Cargo Scoop', class: 1, rating: 'H', power: .6} };

    angular.forEach(shipData,function(o,k){
      if(typeof o != 'object') {
        this[k] = o;
      } else if (k == 'slotCap') {
        angular.forEach(o,function(arr,g){
          this[g] = [];
          for(var i = 0; i < arr.length; i++){
            this[g].push({
              enabled: true,
              incCost: true,
              maxClass: arr[i]
            });
          }
        }.bind(this))
      }
    }.bind(this));
  }

  /**
   * Reset the ship to the original purchase defaults.
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

    this.bulkheads = { incCost: true, id: comps.bulkheads || 0, c: DB.components.bulkheads[this.id][comps.bulkheads || 0] };

    for(var i = 0, l = comps.common.length; i < l; i++) {
      common[i].id = comps.common[i];
      common[i].c = availCommon[i][comps.common[i]];
    }

    for(var i = 0, l = comps.hardpoints.length; i < l; i++) {
      if(comps.hardpoints[i] !== 0) {
        hps[i].id = comps.hardpoints[i];
        hps[i].c = availHardPoints[comps.hardpoints[i]];
      }
    }

    for(var i = 0, l = comps.internal.length; i < l; i++) {
      if(comps.internal[i] !== 0) {
        internal[i].id = comps.internal[i];
        internal[i].c = availInternal[comps.internal[i]];
      }
    }
    this.updateTotals();
  }

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
    return o.id === undefined? '-' : o.id;
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
      if(code.charAt(i) != '-') {
        if (c < commonCount) {
          comps.common[c] = code.substring(i, i + 2);
        } else if (c < hpCount) {
          comps.hardpoints[c - commonCount] = code.substring(i, i + 2)
        } else {
          comps.internal[c - hpCount] = code.substring(i, i + 2)
        }
        i++;
      }
      c++;
    }

    this.defaults = comps;
    this.buildWidth(data);
  };

  /**
   * Updates the ship totals based on currently selected component in each slot.
   */
  Ship.prototype.updateTotals = function() {
    var c = _.reduce(this.common, optsSum, {cost: 0, power: 0, mass: 0, capacity: 0});
    var i = _.reduce(this.internal, optsSum, {cost: 0, power: 0, mass: 0, capacity: 0});
    var h = _.reduce(this.hardpoints, optsSum, {cost: 0, power: 0, mass: 0, capacity: 0});

    this.totalCost = c.cost + i.cost + h.cost + (this.incCost? this.cost : 0) + (this.bulkheads.incCost? this.bulkheads.c.cost : 0);
    this.unladenMass = c.mass + i.mass + h.mass + this.mass + this.bulkheads.c.mass;
    this.powerAvailable = this.common[0].c.pGen;
    this.fuelCapacity = this.common[6].c.capacity;
    this.cargoCapacity = i.capacity;
    this.ladenMass = this.unladenMass + this.cargoCapacity + this.fuelCapacity;
    this.powerRetracted = c.power + i.power + (this.cargoScoop.enabled? this.cargoScoop.c.power : 0);
    this.powerDeployed = this.powerRetracted + h.power;

    // TODO: range
    this.armourAdded = 0; // internal.armoradd TODO: Armour (reinforcement, bulkheads)
    this.armorTotal = this.armourAdded + this.armour;

  }

  /**
   * Update a slot with a the component if the id is different from the current id for this slot.
   * Frees the slot of the current component if the id matches the current id for the slot.
   *
   * @param {object} slot          The component slot
   * @param {string} id            Unique ID for the selected component
   * @param {object} componentData Properties for the selected component
   */
  Ship.prototype.use = function(slot, id, componentData) {
    if (slot.id != id) { // Selecting a different option
      slot.id = id;
      slot.c = componentData;

      // New componnent is a Shield Generator
      if(componentData.group == 'sg') {
        // You can only have one shield Generator
        // TODO: find shield generator that is not this one
        // set c.id = null, c.c = null;
      }
    // Deselecting current option
    } else {
      slot.id = null;
      slot.c = null;
    }
    this.updateTotals();
  };

  /**
   * Calculate the a ships shield strength based on mass, shield generator and shield boosters used.
   *
   * @private
   * @param  {number} mass       Current mass of the ship
   * @param  {number} shields    Base Shield strength MJ for ship
   * @param  {object} sg         The shield generator used
   * @param  {number} multiplier Shield multiplier for ship (1 + shield boosters if any)
   * @return {number}            Approximate shield strengh in MJ
   */
  function calcShieldStrength (mass, shields, sg, multiplier) {
    if (mass <= sg.minmass) {
      return shields * multiplier * sg.minmul;
    }
    if (mass < sg.optmass) {
      return shields * multiplier * (sg.minmul + (mass - sg.minmass) / (sg.optmass - sg.minmass) * (sg.optmul - sg.minmul));
    }
    if (mass < sg.maxmass) {
      return shields * multiplier * (sg.optmul + (mass - sg.optmass) / (sg.maxmass - sg.optmass) * (sg.maxmul - sg.optmul));
    }
    return shields * multiplier * sg.maxmul;
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
    if (slot.c) { // The slot has a component selected
      sum.cost += (slot.incCost && slot.c.cost)? slot.c.cost : 0;
      sum.power += (slot.enabled && slot.c.power)? slot.c.power : 0;
      sum.mass += slot.c.mass || 0;
      sum.capacity += slot.c.capacity || 0;
    }
    return sum;
  }

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
