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

    const { shield, armour, damagetaken } = this._calcMetrics(props.ship, props.opponent, props.sys);
    this.state = { shield, armour, damagetaken };
  }

  /**
   * Update the state if our properties change
   * @param  {Object} nextProps   Incoming/Next properties
   * @return {boolean}            Returns true if the component should be rerendered
   */
  componentWillReceiveProps(nextProps) {
    if (this.props.marker != nextProps.marker || this.props.sys != nextProps.sys) {
      const { shield, armour, damagetaken } = this._calcMetrics(nextProps.ship, nextProps.opponent, nextProps.sys);
      this.setState({ shield, armour, damagetaken });
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
        total: 1 - sysResistance
      };

      shield.explosive = {
        generator: 1 - shieldGenerator.getExplosiveResistance(),
        boosters: boosterExplDmg,
        sys: (1 - sysResistance),
        total: (1 - shieldGenerator.getExplosiveResistance()) * boosterExplDmg * (1 - sysResistance)
      };

      shield.kinetic = {
        generator: 1 - shieldGenerator.getKineticResistance(),
        boosters: boosterKinDmg,
        sys: (1 - sysResistance),
        total: (1 - shieldGenerator.getKineticResistance()) * boosterKinDmg * (1 - sysResistance)
      };

      shield.thermal = {
        generator: 1 - shieldGenerator.getThermalResistance(),
        boosters: boosterThermDmg,
        sys: (1 - sysResistance),
        total: (1 - shieldGenerator.getThermalResistance()) * boosterThermDmg * (1 - sysResistance)
      };
    }

    // Armour from bulkheads
    const armourBulkheads = ship.baseArmour + (ship.baseArmour * ship.bulkheads.m.getHullBoost());
    let armourReinforcement = 0

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

    // Use the SDPS for each weapon type of the opponent to work out how long the shields and armour will last
    // const opponentSDps = Calc.sustainedDps(opponent, range);
    const opponentSDps = {
      absolute: 62.1,
      explosive: 0,
      kinetic: 7.4,
      thermal: 7.4
    };

    // Modify according to resistances to see how much damage we actually take
    //opponentSDps.absolute *= shield.absolute.total;
    //opponentSDps.explosive *= shield.explosive.total;
    //opponentSDps.kinetic *= shield.kinetic.total;
    //opponentSDps.thermal *= shield.thermal.total;
    opponentSDps.total = opponentSDps.absolute + opponentSDps.explosive + opponentSDps.kinetic + opponentSDps.thermal;

    const damagetaken = {
      absolutesdps: opponentSDps.absolute,
      explosivesdps: opponentSDps.explosive,
      kineticsdps: opponentSDps.kinetic,
      thermalsdps: opponentSDps.thermal,
      tts: (shield.total + ship.shieldCells) / opponentSDps.total,
    };

    return { shield, armour, damagetaken };
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
    const { shield, armour, damagetaken } = this.state;

    const shieldSourcesData = [];
    const effectiveShieldData = [];
    const damageTakenData = [];
    const shieldTooltipDetails = [];
    const shieldAbsoluteTooltipDetails = [];
    const shieldExplosiveTooltipDetails = [];
    const shieldKineticTooltipDetails = [];
    const shieldThermalTooltipDetails = [];
    let effectiveAbsoluteShield = 0;
    let effectiveExplosiveShield = 0;
    let effectiveKineticShield = 0;
    let effectiveThermalShield = 0;
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

      effectiveAbsoluteShield = shield.total / shield.absolute.total;
      effectiveShieldData.push({ value: Math.round(effectiveAbsoluteShield), label: translate('absolute') });
      effectiveExplosiveShield = shield.total / shield.explosive.total;
      effectiveShieldData.push({ value: Math.round(effectiveExplosiveShield), label: translate('explosive') });
      effectiveKineticShield = shield.total / shield.kinetic.total;
      effectiveShieldData.push({ value: Math.round(effectiveKineticShield), label: translate('kinetic') });
      effectiveThermalShield = shield.total / shield.thermal.total;
      effectiveShieldData.push({ value: Math.round(effectiveThermalShield), label: translate('thermal') });

      damageTakenData.push({ value: Math.round(shield.absolute.total * 100), label: translate('absolute') });
      damageTakenData.push({ value: Math.round(shield.explosive.total * 100), label: translate('explosive') });
      damageTakenData.push({ value: Math.round(shield.kinetic.total * 100), label: translate('kinetic') });
      damageTakenData.push({ value: Math.round(shield.thermal.total * 100), label: translate('thermal') });
    }

    const armourData = [];
    if (Math.round(armour.bulkheads) > 0) armourData.push({ value: Math.round(armour.bulkheads), label: translate('bulkheads') });
    if (Math.round(armour.reinforcement) > 0) armourData.push({ value: Math.round(armour.reinforcement), label: translate('reinforcement') });

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

    return (
      <span id='defence'>
        {shield.total ? <span>
        <div className='group half'>
          <div className='group half'>
            <h2 onMouseOver={termtip.bind(null, <div>{shieldTooltipDetails}</div>)} onMouseOut={tooltip.bind(null, null)} className='summary'>{translate('shields')}: {formats.int(shield.total)}{units.MJ}</h2>
            <table>
              <tbody>
                <tr>
                  <td className='le'>{translate('damage type')}</td>
                  <td className='ce'>
                    <span className='icon' onMouseOver={termtip.bind(null, 'absolute')} onMouseOut={tooltip.bind(null, null)}><DamageAbsolute /></span>&nbsp;
                  </td>
                  <td className='ce'>
                    <span className='icon' onMouseOver={termtip.bind(null, 'explosive')} onMouseOut={tooltip.bind(null, null)}><DamageExplosive /></span>&nbsp;
                  </td>
                  <td className='ce'>
                    <span className='icon' onMouseOver={termtip.bind(null, 'kinetic')} onMouseOut={tooltip.bind(null, null)}><DamageKinetic /></span>&nbsp;
                  </td>
                  <td className='ce'>
                    <span className='icon' onMouseOver={termtip.bind(null, 'thermal')} onMouseOut={tooltip.bind(null, null)}><DamageThermal /></span>&nbsp;
                  </td>
                </tr>
                <tr>
                  <td className='le'>{translate('damage taken')}</td>
                  <td className='ri'>
                    <span onMouseOver={termtip.bind(null, <div>{shieldAbsoluteTooltipDetails}</div>)} onMouseOut={tooltip.bind(null, null)}>{formats.pct1(shield.absolute.total)}</span>
                  </td>
                  <td className='ri'>
                    <span onMouseOver={termtip.bind(null, <div>{shieldExplosiveTooltipDetails}</div>)} onMouseOut={tooltip.bind(null, null)}>{formats.pct1(shield.explosive.total)}</span>
                  </td>
                  <td className='ri'>
                    <span onMouseOver={termtip.bind(null, <div>{shieldKineticTooltipDetails}</div>)} onMouseOut={tooltip.bind(null, null)}>{formats.pct1(shield.kinetic.total)}</span>
                  </td>
                  <td className='ri'>
                    <span onMouseOver={termtip.bind(null, <div>{shieldThermalTooltipDetails}</div>)} onMouseOut={tooltip.bind(null, null)}>{formats.pct1(shield.thermal.total)}</span>
                  </td>
                </tr>
                <tr>
                  <td className='le'>{translate('effective shield')}</td>
                  <td className='ri'>
                    <span>{formats.int(effectiveAbsoluteShield)}{units.MJ}</span>
                  </td>
                  <td className='ri'>
                    <span>{formats.int(effectiveExplosiveShield)}{units.MJ}</span>
                  </td>
                  <td className='ri'>
                    <span>{formats.int(effectiveKineticShield)}{units.MJ}</span>
                  </td>
                  <td className='ri'>
                    <span>{formats.int(effectiveThermalShield)}{units.MJ}</span>
                  </td>
                </tr>
                <tr>
                  <td colSpan='5' className='summary'>{translate('shields will hold against opponent for')} {formats.time(damagetaken.tts)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className='group half'>
            <h2>{translate('shield sources')}</h2>
            <PieChart data={shieldSourcesData} />
          </div>
        </div>
        <div className='group half'>
          <div className='group half'>
            <h2>{translate('effective shield')}(MJ)</h2>
            <VerticalBarChart data={effectiveShieldData} />
          </div>
          <div className='group half'>
            <h2>{translate('damage taken')}(%)</h2>
            <VerticalBarChart data={damageTakenData} />
          </div>
        </div></span> : null }

        <div className='group twothirds'>
        <h2 onMouseOver={termtip.bind(null, <div>{armourTooltipDetails}</div>)} onMouseOut={tooltip.bind(null, null)} className='summary'>{translate('armour')}: {formats.int(armour.total)}</h2>
        <table>
          <tbody>
            <tr>
              <td className='le'>{translate('damage taken')}</td>
              <td className='ri'>
                <span onMouseOver={termtip.bind(null, <div>{armourAbsoluteTooltipDetails}</div>)} onMouseOut={tooltip.bind(null, null)}>{formats.pct1(armour.absolute.total)}</span>
              </td>
              <td className='ri'>
                <span onMouseOver={termtip.bind(null, <div>{armourExplosiveTooltipDetails}</div>)} onMouseOut={tooltip.bind(null, null)}>{formats.pct1(armour.explosive.total)}</span>
              </td>
              <td className='ri'>
                <span onMouseOver={termtip.bind(null, <div>{armourKineticTooltipDetails}</div>)} onMouseOut={tooltip.bind(null, null)}>{formats.pct1(armour.kinetic.total)}</span>
              </td>
              <td className='ri'>
                <span onMouseOver={termtip.bind(null, <div>{armourThermalTooltipDetails}</div>)} onMouseOut={tooltip.bind(null, null)}>{formats.pct1(armour.thermal.total)}</span>
              </td>
            </tr>
          </tbody>
        </table>
        </div>
        <div className='group third'>
          <h2>{translate('armour sources')}</h2>
          <PieChart data={armourData} />
        </div>
      </span>);
  }
}
