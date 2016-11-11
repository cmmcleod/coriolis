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
    let properties = Object.assign({ grp: null, id: null, template: null, }, params);

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
    if (!this.mods) {
      this.mods = {};
    }

    if (value == null || value == 0) {
      delete this.mods[name];
    } else {
      // Store value with 2dp
      this.mods[name] = Math.round(value * 10000);
    }
  }

  /**
   * Helper to obtain a modified value using standard multipliers
   * @param {String}  name     the name of the modifier to obtain
   * @param {Boolean} additive Optional true if the value is additive rather than multiplicative
   * @return {Number}          the mass of this module
   */
  _getModifiedValue(name, additive) {
    let result = this[name] || (additive ? 0 : null); // Additive NULL === 0
    if (result != null) {
      const modValue = this.getModValue(name);
      if (modValue) {
        if (additive) {
          result = result + modValue;
        } else {
          result = result * (1 + modValue);
        }
      }
    }
    return result;
  }

  /**
   * Get the power generation of this module, taking in to account modifications
   * @return {Number} the power generation of this module
   */
  getPowerGeneration() {
    return this._getModifiedValue('pgen');
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
    return this._getModifiedValue('kinres', true);
  }

  /**
   * Get the thermal resistance for this module, taking in to account modifications
   * @return {Number} the thermal resistance of this module
   */
  getThermalResistance() {
    return this._getModifiedValue('thermres', true);
  }

  /**
   * Get the explosive resistance for this module, taking in to account modifications
   * @return {Number} the explosive resistance of this module
   */
  getExplosiveResistance() {
    return this._getModifiedValue('explres', true);
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
   * Get the shield boost for this module, taking in to account modifications
   * @return {Number} the shield boost of this module
   */
  getShieldBoost() {
    return this._getModifiedValue('shieldboost');
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
   * Get the damage for this module, taking in to account modifications
   * @return {Number} the damage of this module
   */
  getDamage() {
    return this._getModifiedValue('damage');
  }

  /**
   * Get the distributor draw for this module, taking in to account modifications
   * @return {Number} the distributor draw of this module
   */
  getDistDraw() {
    return this._getModifiedValue('distdraw');
  }

  /**
   * Get the thermal load for this module, taking in to account modifications
   * @return {Number} the thermal load of this module
   */
  getThermalLoad() {
    return this._getModifiedValue('thermload');
  }

  /**
   * Get the rounds per shot for this module, taking in to account modifications
   * @return {Number} the rounds per shot of this module
   */
  getRoundsPerShot() {
    return this._getModifiedValue('roundspershot');
  }

  /**
   * Get the DPS for this module, taking in to account modifications
   * @return {Number} the DPS of this module
   */
  getDps() {
    // DPS is a synthetic value
    let damage = this.getDamage();
    let rpshot = this.getRoundsPerShot() || 1;
    let rof = this.getRoF() || 1;

    return damage * rpshot * rof;
  }

  /**
   * Get the EPS for this module, taking in to account modifications
   * @return {Number} the EPS of this module
   */
  getEps() {
    // EPS is a synthetic value
    let distdraw = this.getDistDraw();
    let rpshot = this.getRoundsPerShot() || 1;
    let rof = this.getRoF() || 1;

    return distdraw * rpshot * rof;
  }

  /**
   * Get the HPS for this module, taking in to account modifications
   * @return {Number} the HPS of this module
   */
  getHps() {
    // HPS is a synthetic value
    let heat = this.getThermalLoad();
    let rpshot = this.getRoundsPerShot() || 1;
    let rof = this.getRoF() || 1;

    return heat * rpshot * rof;
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

  /**
   * Get the shield reinforcement for this module, taking in to account modifications
   * @return {Number} the shield reinforcement for this module
   */
  getShieldReinforcement() {
    return this._getModifiedValue('shieldreinforcement');
  }

  /**
   * Get the cells for this module, taking in to account modifications
   * @return {Number} the cells for this module
   */
  getCells() {
    return this._getModifiedValue('cells');
  }

}
