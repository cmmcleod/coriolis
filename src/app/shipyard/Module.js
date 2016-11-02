import * as ModuleUtils from './ModuleUtils';
import * as _ from 'lodash';

/**
 * Module - active module in a ship's buildout
 */
export default class Module {

  /**
   * Construct a new module
   * @param {Object} params   Module parameters.  Either grp/id or template
   */
  constructor(params) {
    let properties = Object.assign({ grp: null, id: null, template: null }, params);

    let template;
    if (properties.template == undefined) {
      return ModuleUtils.findModule(properties.grp, properties.id);
    } else {
      template = properties.template;
      if (template) {
        // Copy all properties from coriolis-data template
        for (let p in template) { this[p] = template[p]; }
      }
    }
    this.mods = {};
  }

  /**
   * Get a value for a given modification
   * @param {Number} name  The name of the modification
   * @return {Number}      The value of the modification, as a decimal value where 1 is 100%
   */
  getModValue(name) {
    return this.mods  && this.mods[name] ? this.mods[name] / 10000 : null;
  }

  /**
   * Set a value for a given modification ID
   * @param {Number} name   The name of the modification
   * @param {Number} value  The value of the modification, as a decimal value where 1 is 100%
   */
  setModValue(name, value) {
    if (value == null || value == 0) {
      delete this.mods[name];
    } else {
      // Store value with 2dp
      this.mods[name] = Math.round(value * 10000);
    }
  }

  /**
   * Helper to obtain a modified value using standard multipliers
   * @param {String}  name the name of the modifier to obtain
   * @return {Number} the mass of this module
   */
  _getModifiedValue(name) {
    let result = 0;
    if (this[name]) {
      result = this[name];
      if (result) {
        let mult = this.getModValue(name);
        if (mult) { result = result * (1 + mult); }
      }
    }
    return result;
  }
  /**
   * Get the power generation of this module, taking in to account modifications
   * @return {Number} the power generation of this module
   */
  getPowerGeneration() {
    return this._getModifiedValue('pGen');
  }

  /**
   * Get the power usage of this module, taking in to account modifications
   * @return {Number} the power usage of this module
   */
  getPowerUsage() {
    return this._getModifiedValue('power');
  }

  /**
   * Get the integrity of this module, taking in to account modifications
   * @return {Number} the integrity of this module
   */
  getIntegrity() {
    return this._getModifiedValue('integrity');
  }

  /**
   * Get the mass of this module, taking in to account modifications
   * @return {Number} the mass of this module
   */
  getMass() {
    return this._getModifiedValue('mass');
  }

  /**
   * Get the thermal efficiency of this module, taking in to account modifications
   * @return {Number} the thermal efficiency of this module
   */
  getThermalEfficiency() {
    return this._getModifiedValue('eff');
  }

  /**
   * Get the maximum mass of this module, taking in to account modifications
   * @return {Number} the maximum mass of this module
   */
  getMaxMass() {
    return this._getModifiedValue('maxmass');
  }

  /**
   * Get the optimal mass of this module, taking in to account modifications
   * @return {Number} the optimal mass of this module
   */
  getOptimalMass() {
    return this._getModifiedValue('optmass');
  }

  /**
   * Get the optimal multiplier of this module, taking in to account modifications
   * @return {Number} the optimal multiplier of this module
   */
  getOptimalMultiplier() {
    return this._getModifiedValue('optmult');
  }

  /**
   * Get the damage per second for this module, taking in to account modifications
   * @return {Number} the damage per second of this module
   */
  getDamagePerSecond() {
    return this._getModifiedValue('dps');
  }

  /**
   * Get the energy per second for this module, taking in to account modifications
   * @return {Number} the energy per second of this module
   */
  getEnergyPerSecond() {
    return this._getModifiedValue('eps');
  }

  /**
   * Get the heat per second for this module, taking in to account modifications
   * @return {Number} the heat per second of this module
   */
  getHeatPerSecond() {
    // Modifier for hps is thermload
    let result = 0;
    if (this['hps']) {
      result = this['hps'];
      if (result) {
        let mult = this.getModValue('thermload');
        if (mult) { result = result * (1 + mult); }
      }
    }
    return result;
  }

  /**
   * Get the maximum fuel per jump for this module, taking in to account modifications
   * @return {Number} the maximum fuel per jump of this module
   */
  getMaxFuelPerJump() {
    return this._getModifiedValue('maxfuel');
  }

  /**
   * Get the systems capacity for this module, taking in to account modifications
   * @return {Number} the systems capacity of this module
   */
  getSystemsCapacity() {
    return this._getModifiedValue('syscap');
  }

  /**
   * Get the engines capacity for this module, taking in to account modifications
   * @return {Number} the engines capacity of this module
   */
  getEnginesCapacity() {
    return this._getModifiedValue('engcap');
  }

  /**
   * Get the weapons capacity for this module, taking in to account modifications
   * @return {Number} the weapons capacity of this module
   */
  getWeaponsCapacity() {
    return this._getModifiedValue('wepcap');
  }

  /**
   * Get the systems recharge rate for this module, taking in to account modifications
   * @return {Number} the systems recharge rate of this module
   */
  getSystemsRechargeRate() {
    return this._getModifiedValue('sysrate');
  }

  /**
   * Get the engines recharge rate for this module, taking in to account modifications
   * @return {Number} the engines recharge rate of this module
   */
  getEnginesRechargeRate() {
    return this._getModifiedValue('engrate');
  }

  /**
   * Get the weapons recharge rate for this module, taking in to account modifications
   * @return {Number} the weapons recharge rate of this module
   */
  getWeaponsRechargeRate() {
    return this._getModifiedValue('weprate');
  }

  /**
   * Get the kinetic resistance for this module, taking in to account modifications
   * @return {Number} the kinetic resistance of this module
   */
  getKineticResistance() {
    return this._getModifiedValue('kinres');
  }

  /**
   * Get the thermal resistance for this module, taking in to account modifications
   * @return {Number} the thermal resistance of this module
   */
  getThermalResistance() {
    return this._getModifiedValue('thermres');
  }

  /**
   * Get the explosive resistance for this module, taking in to account modifications
   * @return {Number} the explosive resistance of this module
   */
  getExplosiveResistance() {
    return this._getModifiedValue('explres');
  }

  /**
   * Get the regeneration rate for this module, taking in to account modifications
   * @return {Number} the regeneration rate of this module
   */
  getRegenerationRate() {
    return this._getModifiedValue('regen');
  }

  /**
   * Get the broken regeneration rate for this module, taking in to account modifications
   * @return {Number} the broken regeneration rate of this module
   */
  getBrokenRegenerationRate() {
    return this._getModifiedValue('brokenregen');
  }

  /**
   * Get the range for this module, taking in to account modifications
   * @return {Number} the range rate of this module
   */
  getRange() {
    return this._getModifiedValue('range');
  }

  /**
   * Get the range (in terms of seconds, for FSDI) for this module, taking in to account modifications
   * @return {Number} the range of this module
   */
  getRangeT() {
    return this._getModifiedValue('ranget');
  }

  /**
   * Get the capture arc for this module, taking in to account modifications
   * @return {Number} the capture arc of this module
   */
  getCaptureArc() {
    return this._getModifiedValue('arc');
  }

  /**
   * Get the hull reinforcement for this module, taking in to account modifications
   * @return {Number} the hull reinforcement of this module
   */
  getHullReinforcement() {
    return this._getModifiedValue('hullreinforcement');
  }

  /**
   * Get the delay for this module, taking in to account modifications
   * @return {Number} the delay of this module
   */
  getDelay() {
    return this._getModifiedValue('delay');
  }

  /**
   * Get the duration for this module, taking in to account modifications
   * @return {Number} the duration of this module
   */
  getDuration() {
    return this._getModifiedValue('duration');
  }

  /**
   * Get the shield reinforcement for this module, taking in to account modifications
   * @return {Number} the shield reinforcement of this module
   */
  getShieldReinforcement() {
    return this._getModifiedValue('shieldreinforcement');
  }

  /**
   * Get the minimum mass for this module, taking in to account modifications
   * @return {Number} the minimum mass of this module
   */
  getMinMass() {
    // Modifier is optmass
    let result = 0;
    if (this['minmass']) {
      result = this['minmass'];
      if (result) {
        let mult = this.getModValue('optmass');
        if (mult) { result = result * (1 + mult); }
      }
    }
    return result;
  }

  /**
   * Get the optimum mass for this module, taking in to account modifications
   * @return {Number} the optimum mass of this module
   */
  getOptMass() {
    return this._getModifiedValue('optmass');
  }

  /**
   * Get the maximum mass for this module, taking in to account modifications
   * @return {Number} the maximum mass of this module
   */
  getMaxMass() {
    // Modifier is optmass
    let result = 0;
    if (this['maxmass']) {
      result = this['maxmass'];
      if (result) {
        let mult = this.getModValue('optmass');
        if (mult) { result = result * (1 + mult); }
      }
    }
    return result;
  }

  /**
   * Get the minimum multiplier for this module, taking in to account modifications
   * @return {Number} the minimum multiplier of this module
   */
  getMinMul() {
    // Modifier is optmul
    let result = 0;
    if (this['minmul']) {
      result = this['minmul'];
      if (result) {
        let mult = this.getModValue('optmul');
        if (mult) { result = result * (1 + mult); }
      }
    }
    return result;
  }

  /**
   * Get the optimum multiplier for this module, taking in to account modifications
   * @return {Number} the optimum multiplier of this module
   */
  getOptMul() {
    return this._getModifiedValue('optmul');
  }

  /**
   * Get the maximum multiplier for this module, taking in to account modifications
   * @return {Number} the maximum multiplier of this module
   */
  getMaxMul() {
    // Modifier is optmul
    let result = 0;
    if (this['maxmul']) {
      result = this['maxmul'];
      if (result) {
        let mult = this.getModValue('optmul');
        if (mult) { result = result * (1 + mult); }
      }
    }
    return result;
  }

  /**
   * Get the shield multiplier for this module, taking in to account modifications
   * @return {Number} the shield multiplier of this module
   */
  getShieldMul() {
    return this._getModifiedValue('shieldmul');
  }


  /**
   * Get the DPS for this module, taking in to account modifications
   * @return {Number} the DPS of this module
   */
  getDps() {
    // Modifications are not made to DPS directly, but to damage and rate of fire
    
    // Obtain unmodified rate of fire
    let rof = this['rof'];

    // Obtain unmodified damage
    let damage = this['dps'] / rof;

    // Obtain modified rate of fire
    let modRof = this._getModifiedValue('rof');

    // Obtain modified damage
    let damageMult = this.getModValue('damage');
    let modDamage = damageMult ? damage * (1 + damageMult) : damage;

    return modDamage * modRof;
  }

  /**
   * Get the heat generated per second for this module, taking in to account modifications
   * @return {Number} the heat generated per second of this module
   */
  getHps() {
    // TODO this is not correct; need to include other factors such as rate of fire, damage, etc.
    return this._getModifiedValue('hps');
  }

  /**
   * Get the energy used per second for this module, taking in to account modifications
   * @return {Number} the energy used per second of this module
   */
  getEps() {
    // TODO this is not correct; need to include other factors such as rate of fire, damage, etc.
    return this._getModifiedValue('eps');
  }

  /**
   * Get the clip size for this module, taking in to account modifications
   * @return {Number} the clip size of this module
   */
  getClip() {
    return this._getModifiedValue('clip');
  }

  /**
   * Get the ammo size for this module, taking in to account modifications
   * @return {Number} the ammo size of this module
   */
  getAmmo() {
    return this._getModifiedValue('ammo');
  }

  /**
   * Get the reload time for this module, taking in to account modifications
   * @return {Number} the reload time of this module
   */
  getReload() {
    return this._getModifiedValue('reload');
  }

  /**
   * Get the rate of fire for this module, taking in to account modifications
   * @return {Number} the rate of fire for this module
   */
  getRoF() {
    return this._getModifiedValue('rof');
  }

  /**
   * Get the facing limit for this module, taking in to account modifications
   * @return {Number} the facing limit for this module
   */
  getFacingLimit() {
    return this._getModifiedValue('facinglimit');
  }

  /**
   * Get the hull boost for this module, taking in to account modifications
   * @return {Number} the hull boost for this module
   */
  getHullBoost() {
    return this._getModifiedValue('hullboost');
  }

}
