import * as ModuleUtils from './ModuleUtils';
import { Modifications } from 'coriolis-data/dist';
import React from 'react';
import { STATS_FORMATING, SI_PREFIXES } from './StatsFormating';

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

    if (properties.class != undefined) {
      // We already have a fully-formed module; copy the data over
      for (let p in properties) { this[p] = properties[p]; }
    } else if (properties.template != undefined) {
      // We have a template from coriolis-data; copy the data over
      for (let p in properties.template) { this[p] = properties.template[p]; }
    } else {
      // We don't have a template; find it given the group and ID
      return ModuleUtils.findModule(properties.grp, properties.id);
    }
  }

  /**
   * Clone an existing module
   * @return {Object}  A clone of the existing module
   */
  clone() {
    return new Module(JSON.parse(JSON.stringify(this)));
  }

  /**
   * Get a value for a given modification
   * @param {Number} name The name of the modification
   * @param {Number} raw  True if the value returned should be raw i.e. without the influence of special effects
   * @return {object}     The value of the modification. If it is a numeric value then it is returned as an integer value scaled so that 1.23% == 123
   */
  getModValue(name, raw) {
    let result = this.mods  && this.mods[name] ? this.mods[name] : null;

    // Calculate the percentage change for a synthetic value
    if (STATS_FORMATING[name] && STATS_FORMATING[name].synthetic) {
      const statGetter = this[STATS_FORMATING[name].synthetic];
      let unmodifiedStat = statGetter.call(this, false);
      let modifiedStat = statGetter.call(this, true);
      result = (modifiedStat / unmodifiedStat - 1)  * 10000;
    } else if ((!raw) && this.blueprint && this.blueprint.special) {
      // This module has a special effect, see if we need to alter our returned value
      const modifierActions = Modifications.modifierActions[this.blueprint.special.edname];
      if (modifierActions && modifierActions[name]) {
        // this special effect modifies our returned value
        const modification = Modifications.modifications[name];
        const multiplier = modification.type === 'percentage' ? 10000 : 100;
        if (name === 'explres' || name === 'kinres' || name === 'thermres' || name === 'causres') {
          // Resistance modifications in itself are additive, however their
          // special effects are multiplicative. They affect the overall result
          // by (special effect resistance) * (damage mult after modification),
          // i. e. we need to apply the special effect as a multiplier to the
          // overall result and then calculate the difference.
          let baseMult = this[name] ? 1 - this[name] : 1;
          result = (baseMult - (baseMult - result / multiplier) * (1 - modifierActions[name] / 100)) * multiplier;
        } else if (modification.method === 'additive') {
          result = result + modifierActions[name] * 100;
        } else if (modification.method === 'overwrite') {
          result = modifierActions[name];
        } else {
          // rate of fire is special, as it's really burst interval.  Handle that here
          let mod = null;
          if (name === 'rof') {
            mod = 1 / (1 + modifierActions[name]) - 1;
          } else {
            mod = modifierActions[name];
          }
          result = (((1 + result / multiplier) * (1 + mod)) - 1) * multiplier;
        }
      }
    }

    // Sanitise the resultant value to 4dp equivalent
    return isNaN(result) ? result : Math.round(result);
  }

  /**
   * Set a value for a given modification ID
   * @param {Number} name                 The name of the modification
   * @param {object} value  The value of the modification. If it is a numeric value then it should be an integer scaled so that -2.34% == -234
   * @param {Boolean}   valueiswithspecial   true if the value includes the special effect (when coming from a UI component)
   */
  setModValue(name, value, valueiswithspecial) {
    if (!this.mods) {
      this.mods = {};
    }
    if (!this.origVals) {
      this.origVals = {};
    }
    if (valueiswithspecial && this.blueprint && this.blueprint.special) {
      // This module has a special effect, see if we need to alter the stored value
      const modifierActions = Modifications.modifierActions[this.blueprint.special.edname];
      if (modifierActions && modifierActions[name]) {
        // This special effect modifies the value being set, so we need to revert it prior to storing the value
        const modification = Modifications.modifications[name];
        if (name === 'explres' || name === 'kinres' || name === 'thermres' || name === 'causres') {
          // Resistance modifications in itself are additive but their
          // experimentals are applied multiplicatively therefor we must handle
          // them differently here (cf. documentation in getModValue).
          let baseMult = (this[name] ? 1 - this[name] : 1);
          value = ((baseMult - value / 10000) / (1 - modifierActions[name] / 100) - baseMult) * -10000;
        } else if (modification.method === 'additive') {
          value = value - modifierActions[name];
        } else if (modification.method === 'overwrite') {
          value = null;
        } else {
          // rate of fire is special, as it's really burst interval.  Handle that here
          let mod = null;
          if (name === 'rof') {
            mod = 1 / (1 + modifierActions[name]) - 1;
          } else {
            mod = modifierActions[name];
          }
          value = ((value / 10000 + 1) / (1 + mod) - 1) * 10000;
        }
      }
    }

    if (value == null || value == 0) {
      delete this.mods[name];
    } else {
      this.mods[name] = value;
    }
  }

  /**
   * Helper to obtain a module's value.
   * @param {String} name     The name of the modifier to obtain
   * @param {Number} modified Whether to return the raw or modified value
   * @return {Number} The value queried
   */
  _getValue(name, modified) {
    let val;
    if (modified) {
      val = this._getModifiedValue(name);
    } else {
      val = this[name];
    }
    return isNaN(val) ? null : val;
  }

  /**
   * Helper to obtain a modified value using standard multipliers
   * @param {String}  name     the name of the modifier to obtain
   * @return {Number}          the value queried
   */
  _getModifiedValue(name) {
    const modification = Modifications.modifications[name];
    let result = this[name];

      if (modification) {
        // We store percentages as decimals, so to get them back we need to divide by 10000.  Otherwise
        // we divide by 100.  Both ways we end up with a value with two decimal places
        let modValue;
        if (modification.type === 'percentage') {
          modValue = this.getModValue(name) / 10000;
        } else if (modification.type === 'numeric') {
          modValue = this.getModValue(name) / 100;
        } else {
          modValue = this.getModValue(name);
        }
        if (modValue) {
        if (!result && modification.method === 'additive') {
          // If the modification is additive and no value is given by default we
          // start at zero
          result = 0;
        }

        if (result !== undefined) {
          if (modification.method === 'additive') {
            // Resistance modding for hull reinforcement packages has additional
            // diminishing returns implemented. The mod value gets lowered by
            // the amount of base resistance the hrp has.
            if (this.grp === 'hr' &&
              (name === 'kinres' || name === 'thermres' || name === 'explres')) {
                modValue = modValue * (1 - result);
            }
            result = result + modValue;
          } else if (modification.method === 'overwrite') {
            result = modValue;
          } else if (name === 'shieldboost' || name === 'hullboost') {
            result = (1 + result) * (1 + modValue) - 1;
          } else {
            result = result * (1 + modValue);
          }
        } else if (name === 'burst' || name === 'burstrof') {
          // Burst and burst rate of fire are special, as it can not exist but
          // have a modification
          result = modValue / 100;
      }
      }
    }

    return isNaN(result) ? null : result;
  }

  /**
   * Creates a react element that pretty-prints the queried module value
   * @param {String} name     The name of the value
   * @param {object} language Language object holding formats and util functions
   * @param {String} [unit]   If unit is given not the stat's default formating
   *                          unit will be applied but the given one taking into
   *                          account SI-prefixes such as kilo, milli, etc.
   * @param {Number} [val]    If val is given, not the modules value but given
   *                          one will be formated
   * @returns {React.Component} The formated value as component
   */
  formatModifiedValue(name, language, unit, val) {
    const formatingOptions = STATS_FORMATING[name];
    if (val === undefined) {
      if (formatingOptions && formatingOptions.synthetic) {
        val = (this[formatingOptions.synthetic]).call(this, true);
      } else {
        val = this._getModifiedValue(name);
      }
    }

    val = val || 0;

    if (!formatingOptions) {
      return (
        <span>
          {val}
        </span>
      );
    }

    let { format } = formatingOptions;
    unit = unit || formatingOptions.unit;
    let storedUnit = formatingOptions.storedUnit || formatingOptions.unit;
    let factor = 1;
    if (storedUnit && storedUnit !== unit) {
      // Find out si prefix of storedUnit and unit as si prefixes can only take
      // on charactere it suffices to compare the first character of each string
      let prefixUnit = unit[0];
      let prefixStored = unit[0];
      if (unit.length > storedUnit.length) {
        factor /= SI_PREFIXES[prefixUnit];
      } else if (storedUnit.length > unit.length) {
        factor *= SI_PREFIXES[prefixStored];
      } else if (prefixUnit !== prefixStored) {
        factor *= SI_PREFIXES[prefixStored];
        factor /= SI_PREFIXES[prefixUnit];
      }
    }

    if (format && language.formats[format]) {
      val = (language.formats[format])(val * factor);
    }

    return (
      <span>
        {val}
        {formatingOptions.unit && language.units[formatingOptions.unit]}
      </span>
    );
  }

  /**
   * Get the power generation of this module
   * @param {Boolean} [modified=true] Whether to take modifications into account
   * @return {Number} the power generation of this module
   */
  getPowerGeneration(modified = true) {
    return this._getValue('pgen', modified);
  }

  /**
   * Get the power usage of this module
   * @param {Boolean} [modified=true] Whether to take modifications into account
   * @return {Number} the power usage of this module
   */
  getPowerUsage(modified = true) {
    return this._getValue('power', modified);
  }

  /**
   * Get the integrity of this module
   * @param {Boolean} [modified=true] Whether to take modifications into account
   * @return {Number} the integrity of this module
   */
  getIntegrity(modified = true) {
    return this._getValue('integrity', modified);
  }

  /**
   * Get the mass of this module
   * @param {Boolean} [modified=true] Whether to take modifications into account
   * @return {Number} the mass of this module
   */
  getMass(modified = true) {
    return this._getValue('mass', modified);
  }

  /**
   * Get the thermal efficiency of this module
   * @param {Boolean} [modified=true] Whether to take modifications into account
   * @return {Number} the thermal efficiency of this module
   */
  getThermalEfficiency(modified = true) {
    return this._getValue('eff', modified);
  }

  /**
   * Get the maximum fuel per jump for this module
   * @param {Boolean} [modified=true] Whether to take modifications into account
   * @return {Number} the maximum fuel per jump of this module
   */
  getMaxFuelPerJump(modified = true) {
    return this._getValue('maxfuel', modified);
  }

  /**
   * Get the systems capacity for this module
   * @param {Boolean} [modified=true] Whether to take modifications into account
   * @return {Number} the systems capacity of this module
   */
  getSystemsCapacity(modified = true) {
    return this._getValue('syscap', modified);
  }

  /**
   * Get the engines capacity for this module
   * @param {Boolean} [modified=true] Whether to take modifications into account
   * @return {Number} the engines capacity of this module
   */
  getEnginesCapacity(modified = true) {
    return this._getValue('engcap', modified);
  }

  /**
   * Get the weapons capacity for this module
   * @param {Boolean} [modified=true] Whether to take modifications into account
   * @return {Number} the weapons capacity of this module
   */
  getWeaponsCapacity(modified = true) {
    return this._getValue('wepcap', modified);
  }

  /**
   * Get the systems recharge rate for this module
   * @param {Boolean} [modified=true] Whether to take modifications into account
   * @return {Number} the systems recharge rate of this module
   */
  getSystemsRechargeRate(modified = true) {
    return this._getValue('sysrate', modified);
  }

  /**
   * Get the engines recharge rate for this module
   * @param {Boolean} [modified=true] Whether to take modifications into account
   * @return {Number} the engines recharge rate of this module
   */
  getEnginesRechargeRate(modified = true) {
    return this._getValue('engrate', modified);
  }

  /**
   * Get the weapons recharge rate for this module
   * @param {Boolean} [modified=true] Whether to take modifications into account
   * @return {Number} the weapons recharge rate of this module
   */
  getWeaponsRechargeRate(modified = true) {
    return this._getValue('weprate', modified);
  }

  /**
   * Get the kinetic resistance for this module
   * @param {Boolean} [modified=true] Whether to take modifications into account
   * @return {Number} the kinetic resistance of this module
   */
  getKineticResistance(modified = true) {
    return this._getValue('kinres', modified);
  }

  /**
   * Get the thermal resistance for this module
   * @param {Boolean} [modified=true] Whether to take modifications into account
   * @return {Number} the thermal resistance of this module
   */
  getThermalResistance(modified = true) {
    return this._getValue('thermres', modified);
  }

  /**
   * Get the explosive resistance for this module
   * @param {Boolean} [modified=true] Whether to take modifications into account
   * @return {Number} the explosive resistance of this module
   */
  getExplosiveResistance(modified = true) {
    return this._getValue('explres', modified);
  }

  /**
   * Get the caustic resistance for this module
   * @param {Boolean} [modified=true] Whether to take modifications into account
   * @return {Number} the caustic resistance of this module
   */
  getCausticResistance(modified = true) {
    return this._getValue('causres', modified);
  }

  /**
   * Get the regeneration rate for this module
   * @param {Boolean} [modified=true] Whether to take modifications into account
   * @return {Number} the regeneration rate of this module
   */
  getRegenerationRate(modified = true) {
    return this._getValue('regen', modified);
  }

  /**
   * Get the broken regeneration rate for this module
   * @param {Boolean} [modified=true] Whether to take modifications into account
   * @return {Number} the broken regeneration rate of this module
   */
  getBrokenRegenerationRate(modified = true) {
    return this._getValue('brokenregen', modified);
  }

  /**
   * Get the range for this module
   * @param {Boolean} [modified=true] Whether to take modifications into account
   * @return {Number} the range rate of this module
   */
  getRange(modified = true) {
    return this._getValue('range', modified);
  }

  /**
   * Get the falloff for this module
   * @param {Boolean} [modified=true] Whether to take modifications into account
   * @return {Number} the falloff of this module
   */
  getFalloff(modified = true) {
    if (!modified) {
      const range = this.getRange(false);
      const falloff = this._getValue('falloff', false);
      return (falloff > range ? range : falloff);
    }

    // Falloff from range is mapped to range
    if (this.mods && this.mods['fallofffromrange']) {
      return this.getRange();
    // Need to find out if we have a focused modification, in which case our
    // falloff is scaled to range
    } else if (this.blueprint && this.blueprint.name === 'Focused') {
      const rangeMod = this.getModValue('range') / 10000;
      return this.falloff * (1 + rangeMod);
    // Standard falloff calculation
    } else {
      const range = this.getRange();
      const falloff = this._getModifiedValue('falloff');
      return (falloff > range ? range : falloff);
    }
  }

  /**
   * Get the range (in terms of seconds, for FSDI) for this module
   * @param {Boolean} [modified=true] Whether to take modifications into account
   * @return {Number} the range of this module
   */
  getRangeT(modified = true) {
    return this._getValue('ranget', modified);
  }

  /**
   * Get the scan time for this module
   * @param {Boolean} [modified=true] Whether to take modifications into account
   * @return {Number} the scan time of this module
   */
  getScanTime(modified = true) {
    return this._getValue('scantime', modified);
  }

  /**
   * Get the capture arc for this module
   * @param {Boolean} [modified=true] Whether to take modifications into account
   * @return {Number} the capture arc of this module
   */
  getCaptureArc(modified = true) {
    return this._getValue('arc', modified);
  }

  /**
   * Get the hull reinforcement for this module
   * @param {Boolean} [modified=true] Whether to take modifications into account
   * @return {Number} the hull reinforcement of this module
   */
  getHullReinforcement(modified = true) {
    return this._getValue('hullreinforcement', modified);
  }

  /**
   * Get the protection for this module
   * @param {Boolean} [modified=true] Whether to take modifications into account
   * @return {Number} the protection of this module
   */
  getProtection(modified = true) {
    return this._getValue('protection', modified);
  }

  /**
   * Get the delay for this module
   * @param {Boolean} [modified=true] Whether to take modifications into account
   * @return {Number} the delay of this module
   */
  getDelay(modified = true) {
    return this._getValue('delay', modified);
  }

  /**
   * Get the duration for this module
   * @param {Boolean} [modified=true] Whether to take modifications into account
   * @return {Number} the duration of this module
   */
  getDuration(modified = true) {
    return this._getValue('duration', modified);
  }

  /**
   * Get the shield boost for this module
   * @param {Boolean} [modified=true] Whether to take modifications into account
   * @return {Number} the shield boost of this module
   */
  getShieldBoost(modified = true) {
    return this._getValue('shieldboost', modified);
  }

  /**
   * Get the minimum mass for this module
   * @param {Boolean} [modified=true] Whether to take modifications into account
   * @return {Number} the minimum mass of this module
   */
  getMinMass(modified = true) {
    // Modifier is optmass
    let result = 0;
    if (this['minmass']) {
      result = this['minmass'];
      if (result && modified) {
        let mult = this.getModValue('optmass') / 10000;
        if (mult) { result = result * (1 + mult); }
      }
    }
    return result;
  }

  /**
   * Get the optimum mass for this module
   * @param {Boolean} [modified=true] Whether to take modifications into account
   * @return {Number} the optimum mass of this module
   */
  getOptMass(modified = true) {
    return this._getValue('optmass', modified);
  }

  /**
   * Get the maximum mass for this module
   * @param {Boolean} [modified=true] Whether to take modifications into account
   * @return {Number} the maximum mass of this module
   */
  getMaxMass(modified = true) {
    // Modifier is optmass
    let result = 0;
    if (this['maxmass']) {
      result = this['maxmass'];
      // max mass is only modified for non-shield boosters
      if (result && modified && this.grp !== 'sg') {
        let mult = this.getModValue('optmass') / 10000;
        if (mult) { result = result * (1 + mult); }
      }
    }
    return result;
  }

  /**
   * Get the minimum multiplier for this module
   * @param {string} type the type for which we are obtaining the multiplier.  Can be 'speed', 'rotation', 'acceleration', or null
   * @param {Boolean} [modified=true] Whether to take modifications into account
   * @return {Number} the minimum multiplier of this module
   */
  getMinMul(type = null, modified = true) {
    // Modifier is optmul
    let result = 0;
    if (this['minmul' + type]) {
      result = this['minmul' + type];
    } else if (this['minmul']) {
      result = this['minmul'];
    }
    if (result && modified) {
      let mult = this.getModValue('optmul') / 10000;
      if (mult) { result = result * (1 + mult); }
    }
    return result;
  }

  /**
   * Get the optimum multiplier for this module
   * @param {string} type the type for which we are obtaining the multiplier.  Can be 'speed', 'rotation', 'acceleration', or null
   * @param {Boolean} [modified=true] Whether to take modifications into account
   * @return {Number} the optimum multiplier of this module
   */
  getOptMul(type = null, modified = true) {
    // Modifier is optmul
    let result = 0;
    if (this['optmul' + type]) {
      result = this['optmul' + type];
    } else if (this['optmul']) {
      result = this['optmul'];
    }
    if (result && modified) {
      let mult = this.getModValue('optmul') / 10000;
      if (mult) { result = result * (1 + mult); }
    }
    return result;
  }

  /**
   * Get the maximum multiplier for this module
   * @param {string} type the type for which we are obtaining the multiplier.  Can be 'speed', 'rotation', 'acceleration', or null
   * @param {Boolean} [modified=true] Whether to take modifications into account
   * @return {Number} the maximum multiplier of this module
   */
  getMaxMul(type = null, modified = true) {
    // Modifier is optmul
    let result = 0;
    if (this['maxmul' + type]) {
      result = this['maxmul' + type];
    } else if (this['maxmul']) {
      result = this['maxmul'];
    }
    if (result && modified) {
      let mult = this.getModValue('optmul') / 10000;
      if (mult) { result = result * (1 + mult); }
    }
    return result;
  }

  /**
   * Get the damage for this module
   * @param {Boolean} [modified=true] Whether to take modifications into account
   * @return {Number} the damage of this module
   */
  getDamage(modified = true) {
    return this._getValue('damage', modified);
  }

  /**
   * Get the distributor draw for this module
   * @param {Boolean} [modified=true] Whether to take modifications into account
   * @return {Number} the distributor draw of this module
   */
  getDistDraw(modified = true) {
    return this._getValue('distdraw', modified);
  }

  /**
   * Get the thermal load for this module
   * @param {Boolean} [modified=true] Whether to take modifications into account
   * @return {Number} the thermal load of this module
   */
  getThermalLoad(modified = true) {
    return this._getValue('thermload', modified);
  }

  /**
   * Get the rounds per shot for this module
   * @param {Boolean} [modified=true] Whether to take modifications into account
   * @return {Number} the rounds per shot of this module
   */
  getRoundsPerShot(modified = true) {
    return this._getValue('roundspershot', modified);
  }

  /**
   * Get the DPS for this module
   * @param {Boolean} [modified=true] Whether to take modifications into account
   * @return {Number} the DPS of this module
   */
  getDps(modified = true) {
    // DPS is a synthetic value
    let damage = this.getDamage(modified);
    let rpshot = this.roundspershot || 1;
    let rof = this.getRoF(modified) || 1;

    return damage * rpshot * rof;
  }

  /**
   * Get the DPE for this module
   * @param {Boolean} [modified=true] Whether to take modifications into account
   * @return {Number} the DPE of this module
   */
  getDpe(modified = true) {
    return this.getDps(modified) / this.getEps(modified);
  }

  /**
   * Get the SDPS for this module
   * @param {Boolean} [modified=true] Whether to take modifications into account
   * @return {Number} The SDPS of this module
   */
  getSDps(modified = true) {
    let dps = this.getDps(modified);
    if (this.getClip(modified)) {
      let clipSize = this.getClip(modified);
      // If auto-loader is applied, effective clip size will be nearly doubled
      // as you get one reload for every two shots fired.
      if (this.blueprint && this.blueprint.special && this.blueprint.special.edname === 'special_auto_loader' && modified) {
        clipSize += clipSize - 1;
      }
      let timeToDeplete = clipSize / this.getRoF(modified);
      return dps * timeToDeplete / (timeToDeplete + this.getReload(modified));
    } else {
      return dps;
    }
  }

  /**
   * Get the EPS for this module
   * @param {Boolean} [modified=true] Whether to take modifications into account
   * @return {Number} the EPS of this module
   */
  getEps(modified = true) {
    // EPS is a synthetic value
    let distdraw = this.getDistDraw(modified);
    // We don't use rpshot here as dist draw is per combined shot
    let rof = this.getRoF(modified) || 1;

    return distdraw * rof;
  }

  /**
   * Get the HPS for this module
   * @param {Boolean} [modified=true] Whether to take modifications into account
   * @return {Number} the HPS of this module
   */
  getHps(modified = true) {
    // HPS is a synthetic value
    let heat = this.getThermalLoad(modified);
    // We don't use rpshot here as dist draw is per combined shot
    let rof = this.getRoF(modified) || 1;

    return heat * rof;
  }

  /**
   * Get the clip size for this module
   * @param {Boolean} [modified=true] Whether to take modifications into account
   * @return {Number} the clip size of this module
   */
  getClip(modified = true) {
    // Clip size is always rounded up
    let result = this._getValue('clip', modified);
    if (result) { result = Math.ceil(result); }
    return result;
  }

  /**
   * Get the ammo size for this module
   * @param {Boolean} [modified=true] Whether to take modifications into account
   * @return {Number} the ammo size of this module
   */
  getAmmo(modified = true) {
    return this._getValue('ammo', modified);
  }

  /**
   * Get the reload time for this module
   * @param {Boolean} [modified=true] Whether to take modifications into account
   * @return {Number} the reload time of this module
   */
  getReload(modified = true) {
    return this._getValue('reload', modified);
  }

  /**
   * Get the burst size for this module
   * @param {Boolean} [modified=true] Whether to take modifications into account
   * @return {Number} the burst size of this module
   */
  getBurst(modified = true) {
    return this._getValue('burst', modified);
  }

  /**
   * Get the burst rate of fire for this module
   * @param {Boolean} [modified=true] Whether to take modifications into account
   * @return {Number} the burst rate of fire of this module
   */
  getBurstRoF(modified = true) {
    return this._getValue('burstrof', modified);
  }

  /**
   * Get the rate of fire for this module.
   * The rate of fire is a combination value, and needs to take in to account
   * bursts of fire.
   * Firing goes [burst 1] [burst interval] [burst 2] [burst interval] ... [burst n] [interval]
   * where 'n' is 'burst', 'burst interval' is '1/burstrof' and 'interval' is '1/rof'
   * @param {Boolean} [modified=true] Whether to take modifications into account
   * @return {Number} the rate of fire for this module
   */
  getRoF(modified = true) {
    const burst = this.getBurst(modified) || 1;
    const burstRoF = this.getBurstRoF(modified) || 1;
    const intRoF = this._getValue('rof', modified);

    return burst / (((burst - 1) / burstRoF) + 1 / intRoF);
  }

  /**
   * Get the facing limit for this module
   * @param {Boolean} [modified=true] Whether to take modifications into account
   * @return {Number} the facing limit for this module
   */
  getFacingLimit(modified = true) {
    return this._getValue('facinglimit', modified);
  }

  /**
   * Get the hull boost for this module
   * @param {Boolean} [modified=true] Whether to take modifications into account
   * @return {Number} the hull boost for this module
   */
  getHullBoost(modified = true) {
    return this._getValue('hullboost', modified);
  }

  /**
   * Get the shield reinforcement for this module
   * @param {Boolean} [modified=true] Whether to take modifications into account
   * @return {Number} the shield reinforcement for this module
   */
  getShieldReinforcement(modified = true) {
    return this._getValue('shieldreinforcement', modified);
  }

  /**
   * Get the shield addition for this module
   * @param {Boolean} [modified=true] Whether to take modifications into account
   * @return {Number} the shield addition for this module
   */
  getShieldAddition(modified = true) {
    return this._getValue('shieldaddition', modified);
  }

  /**
   * Get the jump range boost for this module
   * @param {Boolean} [modified=true] Whether to take modifications into account
   * @return {Number} the jump range boost for this module
   */
  getJumpBoost(modified = true) {
    return this._getValue('jumpboost', modified);
  }

  /**
   * Get the piercing for this module
   * @param {Boolean} [modified=true] Whether to take modifications into account
   * @return {Number} the piercing for this module
   */
  getPiercing(modified = true) {
    return this._getValue('piercing', modified);
  }

  /**
   * Get the bays for this module
   * @param {Boolean} [modified=true] Whether to take modifications into account
   * @return {Number} the bays for this module
   */
  getBays(modified) {
    return this._getValue('bays', modified);
  }

  /**
   * Get the rebuilds per bay for this module
   * @param {Boolean} [modified=true] Whether to take modifications into account
   * @return {Number} the rebuilds per bay for this module
   */
  getRebuildsPerBay(modified = true) {
    return this._getValue('rebuildsperbay', modified);
  }

  /**
   * Get the jitter for this module
   * @param {Boolean} [modified=true] Whether to take modifications into account
   * @return {Number} the jitter for this module
   */
  getJitter(modified = true) {
    return this._getValue('jitter', modified);
  }

  /**
   * Get the damage distribution for this module
   * @param {Boolean} [modified=true] Whether to take modifications into account
   * @return {string} the damage distribution for this module
   */
  getDamageDist(modified = true) {
    return (modified && this.getModValue('damagedist')) || this.damagedist;
  }

  /**
   * Get the shot speed for this module
   * @param {Boolean} [modified=true] Whether to take modifications into account
   * @return {string} the shot speed for this module
   */
  getShotSpeed(modified = true) {
    return this._getValue('shotspeed', modified);
  }

  /**
   * Get the spinup for this module
   * @param {Boolean} [modified=true] Whether to take modifications into account
   * @return {string} the spinup for this module
   */
  getSpinup(modified = true) {
    return this._getValue('spinup', modified);
  }

  /**
   * Get the time for this module
   * @param {Boolean} [modified=true] Whether to take modifications into account
   * @return {string} the time for this module
   */
  getTime(modified = true) {
    return this._getValue('time', modified);
  }

  /**
   * Get the hack time for this module
   * @param {Boolean} [modified=true] Whether to take modifications into account
   * @return {string} the time for this module
   */
  getHackTime(modified = true) {
    return this._getValue('hacktime', modified);
  }

}
