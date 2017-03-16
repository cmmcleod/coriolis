import React from 'react';
import cn from 'classnames';
import TranslatedComponent from './TranslatedComponent';
import * as Calc from '../shipyard/Calculations';
import { DamageAbsolute, DamageExplosive, DamageKinetic, DamageThermal } from './SvgIcons';
import PieChart from './PieChart';
import VerticalBarChart from './VerticalBarChart';

/**
 * Defence information
 * Shield information consists of four panels:
 *   - textual information (time to lose shields etc.)
 *   - breakdown of shield sources (pie chart)
 *   - comparison of shield resistances (bar chart)
 *   - effective shield (bar chart)
 */
export default class Defence extends TranslatedComponent {
  static propTypes = {
    marker: React.PropTypes.string.isRequired,
    ship: React.PropTypes.object.isRequired,
    opponent: React.PropTypes.object.isRequired,
    engagementrange: React.PropTypes.number.isRequired,
    sys: React.PropTypes.number.isRequired
  };

  /**
   * Constructor
   * @param  {Object} props   React Component properties
   */
  constructor(props) {
    super(props);

    const { shield, armour, shielddamage, armourdamage } = this._calcMetrics(props.ship, props.opponent, props.sys, props.engagementrange);
    this.state = { shield, armour, shielddamage, armourdamage };
  }

  /**
   * Update the state if our properties change
   * @param  {Object} nextProps   Incoming/Next properties
   * @return {boolean}            Returns true if the component should be rerendered
   */
  componentWillReceiveProps(nextProps) {
    if (this.props.marker != nextProps.marker || this.props.sys != nextProps.sys) {
      const { shield, armour, shielddamage, armourdamage } = this._calcMetrics(nextProps.ship, nextProps.opponent, nextProps.sys, nextProps.engagementrange);
      this.setState({ shield, armour, shielddamage, armourdamage });
      return true;
    }
  }

  /**
   * Calculate the sustained DPS for a ship at a given range, excluding resistances
   * @param   {Object}  ship            The ship
   * @param   {Object}  opponent        The opponent ship
   * @param   {int}     engagementrange The range between the ship and opponent
   * @returns {Object}                  Sustained DPS for shield and armour
   */
  _calcSustainedDps(ship, opponent, engagementrange) {
    const shieldsdps = {
      absolute: 0,
      explosive: 0,
      kinetic: 0,
      thermal: 0
    };

    const armoursdps = {
      absolute: 0,
      explosive: 0,
      kinetic: 0,
      thermal: 0
    };

    for (let i = 0; i < ship.hardpoints.length; i++) {
      if (ship.hardpoints[i].m && ship.hardpoints[i].enabled && ship.hardpoints[i].maxClass > 0) {
        const m = ship.hardpoints[i].m;
        // Initial sustained DPS
        let sDps = m.getClip() ?  (m.getClip() * m.getDps() / m.getRoF()) / ((m.getClip() / m.getRoF()) + m.getReload()) : m.getDps();
        // Take fall-off in to account
        const falloff = m.getFalloff();
        if (falloff && engagementrange > falloff) {
          const dropoffRange = m.getRange() - falloff;
          sDps *= 1 - Math.min((engagementrange - falloff) / dropoffRange, 1);
        }
        // Piercing/hardness modifier (for armour only)
        const armourMultiple = m.getPiercing() >= opponent.hardness ? 1 : m.getPiercing() / opponent.hardness;
        // Break out the damage according to type
        if (m.getDamageDist().A) {
          shieldsdps.absolute += sDps * m.getDamageDist().A;
          armoursdps.absolute += sDps * m.getDamageDist().A * armourMultiple;
        }
        if (m.getDamageDist().E) {
          shieldsdps.explosive += sDps * m.getDamageDist().E;
          armoursdps.explosive += sDps * m.getDamageDist().E * armourMultiple;
        }
        if (m.getDamageDist().K) {
          shieldsdps.kinetic += sDps * m.getDamageDist().K;
          armoursdps.kinetic += sDps * m.getDamageDist().K * armourMultiple;
        }
        if (m.getDamageDist().T) {
          shieldsdps.thermal += sDps * m.getDamageDist().T;
          armoursdps.thermal += sDps * m.getDamageDist().T * armourMultiple;
        }
      }
    }
    return { shieldsdps, armoursdps };
  }

  /**
   * Calculate shield metrics
   * @param   {Object}  ship            The ship
   * @param   {Object}  opponent        The opponent ship
   * @param   {int}     sys             The opponent ship
   * @param   {int}     engagementrange The range between the ship and opponent
   * @returns {Object}                  Shield metrics
   */
  _calcMetrics(ship, opponent, sys, engagementrange) {
    const sysResistance = this._calcSysResistance(sys);
    const maxSysResistance = this._calcSysResistance(4);

    // Obtain the opponent's sustained DPS on us for later damage calculations
    const { shieldsdps, armoursdps } = this._calcSustainedDps(opponent, ship, engagementrange);

    let shielddamage = {};
    let shield = {};
    const shieldGeneratorSlot = ship.findInternalByGroup('sg');
    if (shieldGeneratorSlot && shieldGeneratorSlot.enabled && shieldGeneratorSlot.m) {
      const shieldGenerator = shieldGeneratorSlot.m;

      // Boosters
      let boost = 1;
      let boosterExplDmg = 1;
      let boosterKinDmg = 1;
      let boosterThermDmg = 1;
      for (let slot of ship.hardpoints) {
        if (slot.enabled && slot.m && slot.m.grp == 'sb') {
          boost += slot.m.getShieldBoost();
          boosterExplDmg = boosterExplDmg * (1 - slot.m.getExplosiveResistance());
          boosterKinDmg = boosterKinDmg * (1 - slot.m.getKineticResistance());
          boosterThermDmg = boosterThermDmg * (1 - slot.m.getThermalResistance());
        }
      }

      // Calculate diminishing returns for boosters
      boost = Math.min(boost, (1 - Math.pow(Math.E, -0.7 * boost)) * 2.5);
      // Remove base shield generator strength
      boost -= 1;
      // Apply diminishing returns
      boosterExplDmg = boosterExplDmg > 0.7 ? boosterExplDmg : 0.7 - (0.7 - boosterExplDmg) / 2;
      boosterKinDmg = boosterKinDmg > 0.7 ? boosterKinDmg : 0.7 - (0.7 - boosterKinDmg) / 2;
      boosterThermDmg = boosterThermDmg > 0.7 ? boosterThermDmg : 0.7 - (0.7 - boosterThermDmg) / 2;

      const generatorStrength = Calc.shieldStrength(ship.hullMass, ship.baseShieldStrength, shieldGenerator, 1);
      const boostersStrength = generatorStrength * boost;

      // Recover time is the time taken to go from 0 to 50%.  It includes a 15-second wait before shields start to recover
      // Note that the shields use the broken regeneration rate to define how much energy goes in to the shields, and the normal
      // regeneration rate to define how much energy is taken from the SYS capacitor
      const shieldToRecover = (generatorStrength + boostersStrength) / 2;
      const powerDistributor = ship.standard[4].m;
      // Our initial regeneration comes from the SYS capacitor store, which is replenished as it goes
      const capacitorDrain = shieldGenerator.getRegenerationRate() - powerDistributor.getSystemsRechargeRate() * (sys / 4);
console.log(`shieldToRecover is ${shieldToRecover}`);
console.log(`Regeneration rate is ${shieldGenerator.getRegenerationRate()}`);
console.log(`Power distributor recharge is ${powerDistributor.getSystemsRechargeRate() * sys / 4}`);
console.log(`capacitor drain is ${capacitorDrain}`);
      const capacitorLifetime = powerDistributor.getSystemsCapacity() / capacitorDrain;

console.log(`Need to recover ${shieldToRecover}`);
console.log(`SYS contains ${powerDistributor.getSystemsCapacity()} and recharges at ${powerDistributor.getSystemsRechargeRate() * (sys / 4)}`);
      let recover = 15;
      if (capacitorDrain <= 0 || shieldToRecover < capacitorLifetime * shieldGenerator.getBrokenRegenerationRate()) {
        // We can recover the entire shield from the capacitor store
        recover += shieldToRecover / shieldGenerator.getBrokenRegenerationRate();
console.log(`We can recover the entire shield before the capacitor drains - takes ${recover}`);
      } else {
        // We can recover some of the shield from the capacitor store
        recover += capacitorLifetime;
console.log(`We can recover ${capacitorLifetime * shieldGenerator.getBrokenRegenerationRate()} before capacitor is empty`);
console.log(`Sys is ${sys}`);
        const remainingShieldToRecover = shieldToRecover - capacitorLifetime * shieldGenerator.getBrokenRegenerationRate();
        if (sys === 0) {
          // No system pips so will never recover shields
console.log(`Cannot recover shields`);
          recover = Math.Inf;
	} else {
	  // Recover remaining shields at the rate of the power distributor's recharge
          recover += remainingShieldToRecover / (powerDistributor.getSystemsRechargeRate() * sys / 4);
	}
      }

      shield = {
        generator: generatorStrength,
        boosters: boostersStrength,
        cells: ship.shieldCells,
        total: generatorStrength + boostersStrength + ship.shieldCells,
        recover
      };

      // Shield resistances have three components: the shield generator, the shield boosters and the SYS pips.
      // We re-cast these as damage percentages
      shield.absolute = {
        generator: 1,
        boosters: 1,
        sys: 1 - sysResistance,
        total: 1 - sysResistance,
        max: 1 - maxSysResistance
      };

      shield.explosive = {
        generator: 1 - shieldGenerator.getExplosiveResistance(),
        boosters: boosterExplDmg,
        sys: (1 - sysResistance),
        total: (1 - shieldGenerator.getExplosiveResistance()) * boosterExplDmg * (1 - sysResistance),
        max: (1 - shieldGenerator.getExplosiveResistance()) * boosterExplDmg * (1 - maxSysResistance)
      };

      shield.kinetic = {
        generator: 1 - shieldGenerator.getKineticResistance(),
        boosters: boosterKinDmg,
        sys: (1 - sysResistance),
        total: (1 - shieldGenerator.getKineticResistance()) * boosterKinDmg * (1 - sysResistance),
        max: (1 - shieldGenerator.getKineticResistance()) * boosterKinDmg * (1 - maxSysResistance)
      };

      shield.thermal = {
        generator: 1 - shieldGenerator.getThermalResistance(),
        boosters: boosterThermDmg,
        sys: (1 - sysResistance),
        total: (1 - shieldGenerator.getThermalResistance()) * boosterThermDmg * (1 - sysResistance),
        max: (1 - shieldGenerator.getThermalResistance()) * boosterThermDmg * (1 - maxSysResistance)
      };

      shielddamage.absolutesdps = shieldsdps.absolute *= shield.absolute.total;
      shielddamage.explosivesdps = shieldsdps.explosive *= shield.explosive.total;
      shielddamage.kineticsdps = shieldsdps.kinetic *= shield.kinetic.total;
      shielddamage.thermalsdps = shieldsdps.thermal *= shield.thermal.total;
      shielddamage.totalsdps = shielddamage.absolutesdps + shielddamage.explosivesdps + shielddamage.kineticsdps + shielddamage.thermalsdps;
    }

    // Armour from bulkheads
    const armourBulkheads = ship.baseArmour + (ship.baseArmour * ship.bulkheads.m.getHullBoost());
    let armourReinforcement = 0;

    let moduleArmour = 0;
    let moduleProtection = 1;

    let hullExplDmg = 1;
    let hullKinDmg = 1;
    let hullThermDmg = 1;

    // Armour from HRPs and module armour from MRPs
    for (let slot of ship.internal) {
      if (slot.m && slot.m.grp == 'hr') {
        armourReinforcement += slot.m.getHullReinforcement();
        // Hull boost for HRPs is applied against the ship's base armour
        armourReinforcement += ship.baseArmour * slot.m.getModValue('hullboost') / 10000;

        hullExplDmg = hullExplDmg * (1 - slot.m.getExplosiveResistance());
        hullKinDmg = hullKinDmg * (1 - slot.m.getKineticResistance());
        hullThermDmg = hullThermDmg * (1 - slot.m.getThermalResistance());
      }
      if (slot.m && slot.m.grp == 'mrp') {
        moduleArmour += slot.m.getIntegrity();
        moduleProtection = moduleProtection * (1 - slot.m.getProtection());
      }
    }
    moduleProtection = 1 - moduleProtection;

    // Apply diminishing returns
    hullExplDmg = hullExplDmg > 0.7 ? hullExplDmg : 0.7 - (0.7 - hullExplDmg) / 2;
    hullKinDmg = hullKinDmg > 0.7 ? hullKinDmg : 0.7 - (0.7 - hullKinDmg) / 2;
    hullThermDmg = hullThermDmg > 0.7 ? hullThermDmg : 0.7 - (0.7 - hullThermDmg) / 2;

    const armour = {
      bulkheads: armourBulkheads,
      reinforcement: armourReinforcement,
      modulearmour: moduleArmour,
      moduleprotection: moduleProtection,
      total: armourBulkheads + armourReinforcement
    };

    // Armour resistances have two components: bulkheads and HRPs
    // We re-cast these as damage percentages
    armour.absolute = {
      bulkheads: 1,
      reinforcement: 1,
      total: 1
    };

    armour.explosive = {
      bulkheads: 1 - ship.bulkheads.m.getExplosiveResistance(),
      reinforcement: hullExplDmg,
      total: (1 - ship.bulkheads.m.getExplosiveResistance()) * hullExplDmg
    };

    armour.kinetic = {
      bulkheads: 1 - ship.bulkheads.m.getKineticResistance(),
      reinforcement: hullKinDmg,
      total: (1 - ship.bulkheads.m.getKineticResistance()) * hullKinDmg
    };

    armour.thermal = {
      bulkheads: 1 - ship.bulkheads.m.getThermalResistance(),
      reinforcement: hullThermDmg,
      total: (1 - ship.bulkheads.m.getThermalResistance()) * hullThermDmg
    };

    const armourdamage = {
      absolutesdps: armoursdps.absolute *= armour.absolute.total,
      explosivesdps: armoursdps.explosive *= armour.explosive.total,
      kineticsdps: armoursdps.kinetic *= armour.kinetic.total,
      thermalsdps: armoursdps.thermal *= armour.thermal.total
    };
    armourdamage.totalsdps = armourdamage.absolutesdps + armourdamage.explosivesdps + armourdamage.kineticsdps + armourdamage.thermalsdps;

    return { shield, armour, shielddamage, armourdamage };
  }

  /**
   * Calculate the resistance provided by SYS pips
   * @param {integer} sys  the value of the SYS pips
   * @returns {integer}    the resistance for the given pips
   */
  _calcSysResistance(sys) {
    return Math.pow(sys,0.85) * 0.6 / Math.pow(4,0.85);
  }

  /**
   * Render shields
   * @return {React.Component} contents
   */
  render() {
    const { ship, sys } = this.props;
    const { language, tooltip, termtip } = this.context;
    const { formats, translate, units } = language;
    const { shield, armour, shielddamage, armourdamage } = this.state;

    const shieldSourcesData = [];
    const effectiveShieldData = [];
    const shieldDamageTakenData = [];
    const shieldTooltipDetails = [];
    const shieldAbsoluteTooltipDetails = [];
    const shieldExplosiveTooltipDetails = [];
    const shieldKineticTooltipDetails = [];
    const shieldThermalTooltipDetails = [];
    let maxEffectiveShield = 0;
    if (shield.total) {
      if (Math.round(shield.generator) > 0) shieldSourcesData.push({ value: Math.round(shield.generator), label: translate('generator') });
      if (Math.round(shield.boosters) > 0) shieldSourcesData.push({ value: Math.round(shield.boosters), label: translate('boosters') });
      if (Math.round(shield.cells) > 0) shieldSourcesData.push({ value: Math.round(shield.cells), label: translate('cells') });

      if (Math.round(shield.generator) > 0) shieldTooltipDetails.push(<div key='generator'>{translate('generator') + ' ' + formats.int(shield.generator)}{units.MJ}</div>);
      if (Math.round(shield.boosters) > 0) shieldTooltipDetails.push(<div key='boosters'>{translate('boosters') + ' ' + formats.int(shield.boosters)}{units.MJ}</div>);
      if (Math.round(shield.cells) > 0) shieldTooltipDetails.push(<div key='cells'>{translate('cells') + ' ' + formats.int(shield.cells)}{units.MJ}</div>);

      shieldAbsoluteTooltipDetails.push(<div key='generator'>{translate('generator') + ' ' + formats.pct1(shield.absolute.generator)}</div>);
      shieldAbsoluteTooltipDetails.push(<div key='boosters'>{translate('boosters') + ' ' + formats.pct1(shield.absolute.boosters)}</div>);
      shieldAbsoluteTooltipDetails.push(<div key='power distributor'>{translate('power distributor') + ' ' + formats.pct1(shield.absolute.sys)}</div>);

      shieldExplosiveTooltipDetails.push(<div key='generator'>{translate('generator') + ' ' + formats.pct1(shield.explosive.generator)}</div>);
      shieldExplosiveTooltipDetails.push(<div key='boosters'>{translate('boosters') + ' ' + formats.pct1(shield.explosive.boosters)}</div>);
      shieldExplosiveTooltipDetails.push(<div key='power distributor'>{translate('power distributor') + ' ' + formats.pct1(shield.explosive.sys)}</div>);

      shieldKineticTooltipDetails.push(<div key='generator'>{translate('generator') + ' ' + formats.pct1(shield.kinetic.generator)}</div>);
      shieldKineticTooltipDetails.push(<div key='boosters'>{translate('boosters') + ' ' + formats.pct1(shield.kinetic.boosters)}</div>);
      shieldKineticTooltipDetails.push(<div key='power distributor'>{translate('power distributor') + ' ' + formats.pct1(shield.kinetic.sys)}</div>);

      shieldThermalTooltipDetails.push(<div key='generator'>{translate('generator') + ' ' + formats.pct1(shield.thermal.generator)}</div>);
      shieldThermalTooltipDetails.push(<div key='boosters'>{translate('boosters') + ' ' + formats.pct1(shield.thermal.boosters)}</div>);
      shieldThermalTooltipDetails.push(<div key='power distributor'>{translate('power distributor') + ' ' + formats.pct1(shield.thermal.sys)}</div>);

      const effectiveAbsoluteShield = shield.total / shield.absolute.total;
      effectiveShieldData.push({ value: Math.round(effectiveAbsoluteShield), label: translate('absolute') });
      const effectiveExplosiveShield = shield.total / shield.explosive.total;
      effectiveShieldData.push({ value: Math.round(effectiveExplosiveShield), label: translate('explosive') });
      const effectiveKineticShield = shield.total / shield.kinetic.total;
      effectiveShieldData.push({ value: Math.round(effectiveKineticShield), label: translate('kinetic') });
      const effectiveThermalShield = shield.total / shield.thermal.total;
      effectiveShieldData.push({ value: Math.round(effectiveThermalShield), label: translate('thermal') });

      shieldDamageTakenData.push({ value: Math.round(shield.absolute.total * 100), label: translate('absolute') });
      shieldDamageTakenData.push({ value: Math.round(shield.explosive.total * 100), label: translate('explosive') });
      shieldDamageTakenData.push({ value: Math.round(shield.kinetic.total * 100), label: translate('kinetic') });
      shieldDamageTakenData.push({ value: Math.round(shield.thermal.total * 100), label: translate('thermal') });

      maxEffectiveShield = Math.max(shield.total / shield.absolute.max, shield.total / shield.explosive.max, shield.total / shield.kinetic.max, shield.total / shield.thermal.max);
    }

    const armourSourcesData = [];
    if (Math.round(armour.bulkheads) > 0) armourSourcesData.push({ value: Math.round(armour.bulkheads), label: translate('bulkheads') });
    if (Math.round(armour.reinforcement) > 0) armourSourcesData.push({ value: Math.round(armour.reinforcement), label: translate('reinforcement') });

    const armourTooltipDetails = [];
    if (armour.bulkheads > 0) armourTooltipDetails.push(<div key='bulkheads'>{translate('bulkheads') + ' ' + formats.int(armour.bulkheads)}</div>);
    if (armour.reinforcement > 0) armourTooltipDetails.push(<div key='reinforcement'>{translate('reinforcement') + ' ' + formats.int(armour.reinforcement)}</div>);

    const armourAbsoluteTooltipDetails = [];
    armourAbsoluteTooltipDetails.push(<div key='bulkheads'>{translate('bulkheads') + ' ' + formats.pct1(armour.absolute.bulkheads)}</div>);
    armourAbsoluteTooltipDetails.push(<div key='reinforcement'>{translate('reinforcement') + ' ' + formats.pct1(armour.absolute.reinforcement)}</div>);

    const armourExplosiveTooltipDetails = [];
    armourExplosiveTooltipDetails.push(<div key='bulkheads'>{translate('bulkheads') + ' ' + formats.pct1(armour.explosive.bulkheads)}</div>);
    armourExplosiveTooltipDetails.push(<div key='reinforcement'>{translate('reinforcement') + ' ' + formats.pct1(armour.explosive.reinforcement)}</div>);

    const armourKineticTooltipDetails = [];
    armourKineticTooltipDetails.push(<div key='bulkheads'>{translate('bulkheads') + ' ' + formats.pct1(armour.kinetic.bulkheads)}</div>);
    armourKineticTooltipDetails.push(<div key='reinforcement'>{translate('reinforcement') + ' ' + formats.pct1(armour.kinetic.reinforcement)}</div>);

    const armourThermalTooltipDetails = [];
    armourThermalTooltipDetails.push(<div key='bulkheads'>{translate('bulkheads') + ' ' + formats.pct1(armour.thermal.bulkheads)}</div>);
    armourThermalTooltipDetails.push(<div key='reinforcement'>{translate('reinforcement') + ' ' + formats.pct1(armour.thermal.reinforcement)}</div>);

    const effectiveArmourData = [];
    const effectiveAbsoluteArmour = armour.total / armour.absolute.total;
    effectiveArmourData.push({ value: Math.round(effectiveAbsoluteArmour), label: translate('absolute') });
    const effectiveExplosiveArmour = armour.total / armour.explosive.total;
    effectiveArmourData.push({ value: Math.round(effectiveExplosiveArmour), label: translate('explosive') });
    const effectiveKineticArmour = armour.total / armour.kinetic.total;
    effectiveArmourData.push({ value: Math.round(effectiveKineticArmour), label: translate('kinetic') });
    const effectiveThermalArmour = armour.total / armour.thermal.total;
    effectiveArmourData.push({ value: Math.round(effectiveThermalArmour), label: translate('thermal') });

    // TODO these aren't updating when HRP metrics are altered (maybe - need to confirm)
    const armourDamageTakenData = [];
    armourDamageTakenData.push({ value: Math.round(armour.absolute.total * 100), label: translate('absolute') });
    armourDamageTakenData.push({ value: Math.round(armour.explosive.total * 100), label: translate('explosive') });
    armourDamageTakenData.push({ value: Math.round(armour.kinetic.total * 100), label: translate('kinetic') });
    armourDamageTakenData.push({ value: Math.round(armour.thermal.total * 100), label: translate('thermal') });

    return (
      <span id='defence'>
        {shield.total ? <span>
        <div className='group quarter'>
          <h2>{translate('shield metrics')}</h2>
          <br/>
          <h2 onMouseOver={termtip.bind(null, <div>{shieldTooltipDetails}</div>)} onMouseOut={tooltip.bind(null, null)} className='summary'>{translate('raw shield strength')}<br/>{formats.int(shield.total)}{units.MJ}</h2>
          <h2 onMouseOver={termtip.bind(null, translate('TT_TIME_TO_LOSE_SHIELDS'))} onMouseOut={tooltip.bind(null, null)}>{translate('PHRASE_TIME_TO_LOSE_SHIELDS')}<br/>{shielddamage.totalsdps == 0 ? translate('infinity') : formats.time(shield.total / shielddamage.totalsdps)}</h2>
          <h2 onMouseOver={termtip.bind(null, translate('PHRASE_SG_RECOVER'))} onMouseOut={tooltip.bind(null, null)}>{translate('PHRASE_TIME_TO_RECOVER_SHIELDS')}<br/>{formats.time(shield.recover)}</h2>
          <h2 onMouseOver={termtip.bind(null, translate('PHRASE_SG_RECHARGE'))} onMouseOut={tooltip.bind(null, null)}>{translate('PHRASE_TIME_TO_RECHARGE_SHIELDS')}<br/>{formats.time(ship.calcShieldRecharge())}</h2>
        </div>
        <div className='group quarter'>
          <h2 onMouseOver={termtip.bind(null, translate('PHRASE_SHIELD_SOURCES'))} onMouseOut={tooltip.bind(null, null)}>{translate('shield sources')}</h2>
          <PieChart data={shieldSourcesData} />
        </div>
        <div className='group quarter'>
          <h2 onMouseOver={termtip.bind(null, translate('PHRASE_DAMAGE_TAKEN'))} onMouseOut={tooltip.bind(null, null)}>{translate('damage taken')}(%)</h2>
          <VerticalBarChart data={shieldDamageTakenData} yMax={100} />
        </div>
        <div className='group quarter'>
          <h2 onMouseOver={termtip.bind(null, translate('PHRASE_EFFECTIVE_SHIELD'))} onMouseOut={tooltip.bind(null, null)}>{translate('effective shield')}(MJ)</h2>
          <VerticalBarChart data={effectiveShieldData} yMax={maxEffectiveShield}/>
        </div>
        </span> : null }

        <div className='group quarter'>
          <h2>{translate('armour metrics')}</h2>
          <h2 onMouseOver={termtip.bind(null, <div>{armourTooltipDetails}</div>)} onMouseOut={tooltip.bind(null, null)} className='summary'>{translate('raw armour strength')}<br/>{formats.int(armour.total)}</h2>
          <h2 onMouseOver={termtip.bind(null, translate('TT_TIME_TO_LOSE_ARMOUR'))} onMouseOut={tooltip.bind(null, null)}>{translate('PHRASE_TIME_TO_LOSE_ARMOUR')}<br/>{armourdamage.totalsdps == 0 ? translate('infinity') : formats.time(armour.total / armourdamage.totalsdps)}</h2>
          <h2 onMouseOver={termtip.bind(null, translate('TT_MODULE_ARMOUR'))} onMouseOut={tooltip.bind(null, null)}>{translate('raw module armour')}<br/>{formats.int(armour.modulearmour)}</h2>
          <h2 onMouseOver={termtip.bind(null, translate('TT_MODULE_PROTECTION_EXTERNAL'))} onMouseOut={tooltip.bind(null, null)}>{translate('PHRASE_MODULE_PROTECTION_EXTERNAL')}<br/>{formats.pct1(armour.moduleprotection / 2)}</h2>
          <h2 onMouseOver={termtip.bind(null, translate('TT_MODULE_PROTECTION_INTERNAL'))} onMouseOut={tooltip.bind(null, null)}>{translate('PHRASE_MODULE_PROTECTION_INTERNAL')}<br/>{formats.pct1(armour.moduleprotection)}</h2>
          <br/>
        </div>
        <div className='group quarter'>
          <h2 onMouseOver={termtip.bind(null, translate('PHRASE_ARMOUR_SOURCES'))} onMouseOut={tooltip.bind(null, null)}>{translate('armour sources')}</h2>
          <PieChart data={armourSourcesData} />
        </div>
        <div className='group quarter'>
          <h2 onMouseOver={termtip.bind(null, translate('PHRASE_DAMAGE_TAKEN'))} onMouseOut={tooltip.bind(null, null)}>{translate('damage taken')}(%)</h2>
          <VerticalBarChart data={armourDamageTakenData} yMax={100} />
        </div>
        <div className='group quarter'>
          <h2 onMouseOver={termtip.bind(null, translate('PHRASE_EFFECTIVE_ARMOUR'))} onMouseOut={tooltip.bind(null, null)}>{translate('effective armour')}</h2>
          <VerticalBarChart data={effectiveArmourData} />
        </div>
      </span>);
  }
}
