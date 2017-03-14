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
    sys: React.PropTypes.number.isRequired
  };

  /**
   * Constructor
   * @param  {Object} props   React Component properties
   */
  constructor(props) {
    super(props);

    const { shield, armour, shielddamage } = this._calcMetrics(props.ship, props.opponent, props.sys);
    this.state = { shield, armour, shielddamage };
  }

  /**
   * Update the state if our properties change
   * @param  {Object} nextProps   Incoming/Next properties
   * @return {boolean}            Returns true if the component should be rerendered
   */
  componentWillReceiveProps(nextProps) {
    if (this.props.marker != nextProps.marker || this.props.sys != nextProps.sys) {
      const { shield, armour, shielddamage } = this._calcMetrics(nextProps.ship, nextProps.opponent, nextProps.sys);
      this.setState({ shield, armour, shielddamage });
      return true;
    }
  }

  /**
   * Calculate shield metrics
   * @param   {Object}  ship       The ship
   * @param   {Object}  opponent   The opponent ship
   * @param   {int}     sys        The opponent ship
   * @returns {Object}             Shield metrics
   */
  _calcMetrics(ship, opponent, sys) {
    const sysResistance = this._calcSysResistance(sys);
    const maxSysResistance = this._calcSysResistance(4);

    // Obtain the opponent's sustained DPS for later damage calculations
    // const opponentSDps = Calc.sustainedDps(opponent, range);
    const opponentSDps = {
      absolute: 62.1,
      explosive: 0,
      kinetic: 7.4,
      thermal: 7.4
    };

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
      shield = {
        generator: generatorStrength,
        boosters: boostersStrength,
        cells: ship.shieldCells,
        total: generatorStrength + boostersStrength + ship.shieldCells
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

      shielddamage.absolutesdps = opponentSDps.absolute *= shield.absolute.total;
      shielddamage.explosivesdps = opponentSDps.explosive *= shield.explosive.total;
      shielddamage.kineticsdps = opponentSDps.kinetic *= shield.kinetic.total;
      shielddamage.thermalsdps = opponentSDps.thermal *= shield.thermal.total;
      shielddamage.totalsdps = shielddamage.absolutesdps + shielddamage.explosivesdps + shielddamage.kineticsdps + shielddamage.thermalsdps;
    }

    // Armour from bulkheads
    const armourBulkheads = ship.baseArmour + (ship.baseArmour * ship.bulkheads.m.getHullBoost());
    let armourReinforcement = 0;

    let modulearmour = 0;
    let moduleprotection = 1;

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
        modulearmour += slot.m.getIntegrity();
        moduleprotection = moduleprotection * (1 - slot.m.getProtection());
      }
    }
    moduleprotection = 1 - moduleprotection;

    // Apply diminishing returns
    hullExplDmg = hullExplDmg > 0.7 ? hullExplDmg : 0.7 - (0.7 - hullExplDmg) / 2;
    hullKinDmg = hullKinDmg > 0.7 ? hullKinDmg : 0.7 - (0.7 - hullKinDmg) / 2;
    hullThermDmg = hullThermDmg > 0.7 ? hullThermDmg : 0.7 - (0.7 - hullThermDmg) / 2;

    const armour = {
      bulkheads: armourBulkheads,
      reinforcement: armourReinforcement,
      modulearmour: modulearmour,
      moduleprotection: moduleprotection,
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

    return { shield, armour, shielddamage };
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
    const { shield, armour, shielddamage } = this.state;

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

console.log(`max effective shields are ${shield.absolute.max}/${shield.explosive.max}/${shield.kinetic.max}/${shield.thermal.max}`);
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

    // TODO versions of ship.calcShieldRecovery() and ship.calcShieldRecharge() that take account of SYS pips
    return (
      <span id='defence'>
        {shield.total ? <span>
        <div className='group quarter'>
          <h2>{translate('shield metrics')}</h2>
          <br/>
          <h2 onMouseOver={termtip.bind(null, <div>{shieldTooltipDetails}</div>)} onMouseOut={tooltip.bind(null, null)} className='summary'>{translate('raw shield strength')}: {formats.int(shield.total)}{units.MJ}</h2>
          <h2 onMouseOver={termtip.bind(null, translate('TT_TIME_TO_LOSE_SHIELDS'))} onMouseOut={tooltip.bind(null, null)}>{translate('PHRASE_TIME_TO_LOSE_SHIELDS')} {formats.time(shield.total / shielddamage.totalsdps)}</h2>
          <h2 onMouseOver={termtip.bind(null, translate('PHRASE_SG_RECOVER'))} onMouseOut={tooltip.bind(null, null)}>{translate('PHRASE_TIME_TO_RECOVER_SHIELDS')} {formats.time(ship.calcShieldRecovery())}</h2>
          <h2 onMouseOver={termtip.bind(null, translate('PHRASE_SG_RECHARGE'))} onMouseOut={tooltip.bind(null, null)}>{translate('PHRASE_TIME_TO_RECHARGE_SHIELDS')} {formats.time(ship.calcShieldRecharge())}</h2>
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
