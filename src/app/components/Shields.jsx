import React from 'react';
import cn from 'classnames';
import TranslatedComponent from './TranslatedComponent';
import * as Calc from '../shipyard/Calculations';
import { DamageAbsolute, DamageExplosive, DamageKinetic, DamageThermal } from './SvgIcons';

/**
 * Shields
 * Effective shield strength (including SCBs)
 * Time for opponent to down shields
 *   - need sustained DPS for each type of damage (K/T/E/R)
 *   - turn in to % of shields removed per second
 */
export default class Shields extends TranslatedComponent {
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

    const { shield, absolute, explosive, kinetic, thermal } = this._calcMetrics(props.ship, props.opponent, props.sys);
    this.state = { shield, absolute, explosive, kinetic, thermal };
  }

  /**
   * Update the state if our properties change
   * @param  {Object} nextProps   Incoming/Next properties
   * @return {boolean}            Returns true if the component should be rerendered
   */
  componentWillReceiveProps(nextProps) {
    if (this.props.marker != nextProps.marker || this.props.sys != nextProps.sys) {
      const { shield, absolute, explosive, kinetic, thermal } = this._calcMetrics(nextProps.ship, nextProps.opponent, nextProps.sys);
      this.setState({ shield, absolute, explosive, kinetic, thermal });
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

    const shieldGenerator = ship.findShieldGenerator();

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
    boosterExplDmg = boosterExplDmg > 0.7 ? boosterExplDmg : 0.7 - (0.7 - boosterExplDmg) / 2;
    boosterKinDmg = boosterKinDmg > 0.7 ? boosterKinDmg : 0.7 - (0.7 - boosterKinDmg) / 2;
    boosterThermDmg = boosterThermDmg > 0.7 ? boosterThermDmg : 0.7 - (0.7 - boosterThermDmg) / 2;

    const generatorStrength = Calc.shieldStrength(ship.hullMass, ship.baseShieldStrength, shieldGenerator, 1);
    const boostersStrength = generatorStrength * boost;
    const shield = {
      generator: generatorStrength,
      boosters: boostersStrength,
      total: generatorStrength + boostersStrength
    };

    // Resistances have three components: the shield generator, the shield boosters and the SYS pips.
    // We re-cast these as damage percentages
    const absolute = {
      generator: 1,
      boosters: 1,
      sys: 1 - sysResistance,
      total: 1 - sysResistance
    };

    const explosive = {
      generator: 1 - shieldGenerator.getExplosiveResistance(),
      boosters: boosterExplDmg,
      sys: (1 - sysResistance),
      total: (1 - shieldGenerator.getExplosiveResistance()) * boosterExplDmg * (1 - sysResistance)
    };

    const kinetic = {
      generator: 1 - shieldGenerator.getKineticResistance(),
      boosters: boosterKinDmg,
      sys: (1 - sysResistance),
      total: (1 - shieldGenerator.getKineticResistance()) * boosterKinDmg * (1 - sysResistance)
    };

    const thermal = {
      generator: 1 - shieldGenerator.getThermalResistance(),
      boosters: boosterThermDmg,
      sys: (1 - sysResistance),
      total: (1 - shieldGenerator.getThermalResistance()) * boosterThermDmg * (1 - sysResistance)
    };

    return { shield, absolute, explosive, kinetic, thermal };
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
    const { shield, absolute, explosive, kinetic, thermal } = this.state;

    const shieldTooltipDetails = [];
    shieldTooltipDetails.push(<div key='generator'>{translate('generator') + ' ' + formats.int(shield.generator)}{units.MJ}</div>);
    shieldTooltipDetails.push(<div key='boosters'>{translate('boosters') + ' ' + formats.int(shield.boosters)}{units.MJ}</div>);

    const absoluteTooltipDetails = [];
    absoluteTooltipDetails.push(<div key='generator'>{translate('generator') + ' ' + formats.pct1(absolute.generator)}</div>);
    absoluteTooltipDetails.push(<div key='boosters'>{translate('boosters') + ' ' + formats.pct1(absolute.boosters)}</div>);
    absoluteTooltipDetails.push(<div key='power distributor'>{translate('power distributor') + ' ' + formats.pct1(absolute.sys)}</div>);

    const explosiveTooltipDetails = [];
    explosiveTooltipDetails.push(<div key='generator'>{translate('generator') + ' ' + formats.pct1(explosive.generator)}</div>);
    explosiveTooltipDetails.push(<div key='boosters'>{translate('boosters') + ' ' + formats.pct1(explosive.boosters)}</div>);
    explosiveTooltipDetails.push(<div key='power distributor'>{translate('power distributor') + ' ' + formats.pct1(explosive.sys)}</div>);

    const kineticTooltipDetails = [];
    kineticTooltipDetails.push(<div key='generator'>{translate('generator') + ' ' + formats.pct1(kinetic.generator)}</div>);
    kineticTooltipDetails.push(<div key='boosters'>{translate('boosters') + ' ' + formats.pct1(kinetic.boosters)}</div>);
    kineticTooltipDetails.push(<div key='power distributor'>{translate('power distributor') + ' ' + formats.pct1(kinetic.sys)}</div>);

    const thermalTooltipDetails = [];
    thermalTooltipDetails.push(<div key='generator'>{translate('generator') + ' ' + formats.pct1(thermal.generator)}</div>);
    thermalTooltipDetails.push(<div key='boosters'>{translate('boosters') + ' ' + formats.pct1(thermal.boosters)}</div>);
    thermalTooltipDetails.push(<div key='power distributor'>{translate('power distributor') + ' ' + formats.pct1(thermal.sys)}</div>);

    return (
      <span id='shields'>
        <table>
          <tbody>
            <tr>
              <td colSpan='5' onMouseOver={termtip.bind(null, <div>{shieldTooltipDetails}</div>)} onMouseOut={tooltip.bind(null, null)} className='summary'>{translate('shields')}: {formats.int(shield.total)}{units.MJ}</td>
            </tr>
            <tr>
              <td className='le'>{translate('damage from')}</td>
              <td className='ri'>
                <span onMouseOver={termtip.bind(null, 'absolute')} onMouseOut={tooltip.bind(null, null)}><DamageAbsolute /></span>&nbsp;
                <span onMouseOver={termtip.bind(null, <div>{absoluteTooltipDetails}</div>)} onMouseOut={tooltip.bind(null, null)}>{formats.pct1(absolute.total)}</span>
              </td>
              <td className='ri'>
                <span onMouseOver={termtip.bind(null, 'explosive')} onMouseOut={tooltip.bind(null, null)}><DamageExplosive /></span>&nbsp;
                <span onMouseOver={termtip.bind(null, <div>{explosiveTooltipDetails}</div>)} onMouseOut={tooltip.bind(null, null)}>{formats.pct1(explosive.total)}</span>
              </td>
              <td className='ri'>
                <span onMouseOver={termtip.bind(null, 'kinetic')} onMouseOut={tooltip.bind(null, null)}><DamageKinetic /></span>&nbsp;
                <span onMouseOver={termtip.bind(null, <div>{kineticTooltipDetails}</div>)} onMouseOut={tooltip.bind(null, null)}>{formats.pct1(kinetic.total)}</span>
              </td>
              <td className='ri'>
                <span onMouseOver={termtip.bind(null, 'thermal')} onMouseOut={tooltip.bind(null, null)}><DamageThermal /></span>&nbsp;
                <span onMouseOver={termtip.bind(null, <div>{thermalTooltipDetails}</div>)} onMouseOut={tooltip.bind(null, null)}>{formats.pct1(thermal.total)}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </span>);
  }
}
