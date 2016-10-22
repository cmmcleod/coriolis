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
  }

  /**
   * Get a value for a given modification ID
   * @param {Number} modId   The ID of the modification
   * @return {Number}        The value of the modification
   */
  _getModValue(modId) {
    let result = null;
    if (this.mods) {
      let mod = _.find(this.mods, function(o) { return o.id == modId; });
      if (mod) {
        result = mod.value;
      }
    }
    return result;
  }

  /**
   * Get the power generation of this module, taking in to account modifications
   * @return {Number} the power generation of this module
   */
  getPowerGeneration() {
    let result = 0;
    if (this.pGen) {
      result = this.pGen;
      if (result) {
        let mult = this._getModValue(1);
        if (mult) { result = result * (1 + (mult / 1000)); }
      }
    }
    return result;
  }

  /**
   * Get the power usage of this module, taking in to account modifications
   * @return {Number} the power usage of this module
   */
  getPowerUsage() {
    let result = 0;
    if (this.power) {
      result = this.power;
      if (result) {
        let mult = this._getModValue(2);
        if (mult) { result = result * (1 + (mult / 1000)); }
      }
    }
    return result;
  }

  /**
   * Get the mass of this module, taking in to account modifications
   * @return {Number} the mass of this module
   */
  getMass() {
    let result = 0;
    if (this.mass) {
      result = this.mass;
      if (result) {
        let mult = this._getModValue(3);
        if (mult) { result = result * (1 + (mult / 1000)); }
      }
    }
    return result;
  }

  /**
   * Get the integrity of this module, taking in to account modifications
   * @return {Number} the integrity of this module
   */
  getIntegrity() {
    let result = 0;
    if (this.health) {
      result = this.health;
      if (result) {
        let mult = this._getModValue(4);
        if (mult) { result = result * (1 + (mult / 1000)); }
      }
    }
    return result;
  }
}
