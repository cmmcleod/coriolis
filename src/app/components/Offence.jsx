import React from 'react';
import TranslatedComponent from './TranslatedComponent';
import * as Calc from '../shipyard/Calculations';
import PieChart from './PieChart';
import { nameComparator } from '../utils/SlotFunctions';
import { MountFixed, MountGimballed, MountTurret } from './SvgIcons';
import VerticalBarChart from './VerticalBarChart';

/**
 * Generates an internationalization friendly weapon comparator that will
 * sort by specified property (if provided) then by name/group, class, rating
 * @param  {function} translate       Translation function
 * @param  {function} propComparator  Optional property comparator
 * @param  {boolean} desc             Use descending order
 * @return {function}                 Comparator function for names
 */
export function weaponComparator(translate, propComparator, desc) {
  return (a, b) => {
    if (!desc) {  // Flip A and B if ascending order
      let t = a;
      a = b;
      b = t;
    }

    // If a property comparator is provided use it first
    let diff = propComparator ? propComparator(a, b) : nameComparator(translate, a, b);

    if (diff) {
      return diff;
    }

    // Property matches so sort by name / group, then class, rating
    if (a.name === b.name && a.grp === b.grp) {
      if(a.class == b.class) {
        return a.rating > b.rating ? 1 : -1;
      }
      return a.class - b.class;
    }

    return nameComparator(translate, a, b);
  };
}

/**
 * Offence information
 * Offence information consists of four panels:
 *   - textual information (time to drain cap, time to take down shields etc.)
 *   - breakdown of damage sources (pie chart)
 *   - comparison of shield resistances (table chart)
 *   - effective sustained DPS of weapons (bar chart)
 */
export default class Offence extends TranslatedComponent {
  static propTypes = {
    marker: React.PropTypes.string.isRequired,
    ship: React.PropTypes.object.isRequired,
    opponent: React.PropTypes.object.isRequired,
    engagementrange: React.PropTypes.number.isRequired,
    wep: React.PropTypes.number.isRequired
  };

  /**
   * Constructor
   * @param  {Object} props   React Component properties
   */
  constructor(props) {
    super(props);

    this._sort = this._sort.bind(this);

    const damage = Calc.offenceMetrics(props.ship, props.opponent, props.eng, props.engagementrange);
    this.state = { 
      predicate: 'n',
      desc: true,
      damage
    };
  }

  /**
   * Update the state if our properties change
   * @param  {Object} nextProps   Incoming/Next properties
   * @return {boolean}            Returns true if the component should be rerendered
   */
  componentWillReceiveProps(nextProps) {
    if (this.props.marker != nextProps.marker || this.props.sys != nextProps.sys) {
      const damage = Calc.offenceMetrics(nextProps.ship, nextProps.opponent, nextProps.wep, nextProps.engagementrange);
      this.setState({ damage });
    }
    return true;
  }

  /**
   * Set the sort order and sort
   * @param  {string} predicate Sort predicate
   */
  _sortOrder(predicate) {
    let desc = this.state.desc;

    if (predicate == this.state.predicate) {
      desc = !desc;
    } else {
      desc = true;
    }

    this._sort(this.props.ship, predicate, desc);
    this.setState({ predicate, desc });
  }

  /**
   * Sorts the weapon list
   * @param  {Ship} ship          Ship instance
   * @param  {string} predicate   Sort predicate
   * @param  {Boolean} desc       Sort order descending
   */
  _sort(ship, predicate, desc) {
    let comp = weaponComparator.bind(null, this.context.language.translate);

    switch (predicate) {
      case 'n': comp = comp(null, desc); break;
      case 'edpss': comp = comp((a, b) => a.effectiveDpsShields - b.effectiveDpsShields, desc); break;
      case 'esdpss': comp = comp((a, b) => a.effectiveSDpsShields - b.effectiveSDpsShields, desc); break;
      case 'es': comp = comp((a, b) => a.effectivenessShields - b.effectivenessShields, desc); break;
      case 'edpsh': comp = comp((a, b) => a.effectiveDpsHull - b.effectiveDpsHull, desc); break;
      case 'esdpsh': comp = comp((a, b) => a.effectiveSDpsHull - b.effectiveSDpsHull, desc); break;
      case 'eh': comp = comp((a, b) => a.effectivenessHull - b.effectivenessHull, desc); break;
    }

    this.state.damage.sort(comp);
  }

  /**
   * Render offence
   * @return {React.Component} contents
   */
  render() {
    const { ship, wep } = this.props;
    const { language, tooltip, termtip } = this.context;
    const { formats, translate, units } = language;
    const { damage } = this.state;
    const sortOrder = this._sortOrder;

    const rows = [];
    for (let i = 0; i < damage.length; i++) {
      const weapon = damage[i];
      rows.push(<tr key={weapon.id}>
                  <td className='ri'>
                    {weapon.mount == 'F' ? <span onMouseOver={termtip.bind(null, 'fixed')} onMouseOut={tooltip.bind(null, null)}><MountFixed className='icon'/></span> : null}
                    {weapon.mount == 'G' ? <span onMouseOver={termtip.bind(null, 'gimballed')} onMouseOut={tooltip.bind(null, null)}><MountGimballed /></span> : null}
                    {weapon.mount == 'T' ? <span onMouseOver={termtip.bind(null, 'turreted')} onMouseOut={tooltip.bind(null, null)}><MountTurret /></span> : null}
                    {weapon.classRating} {translate(weapon.name)}
                    {weapon.engineering ? ' (' + weapon.engineering + ')' : null }
                  </td>
                  <td className='ri'>{formats.f1(weapon.sdpsShields)}</td>
                  <td className='ri'>{formats.pct1(weapon.effectivenessShields)}</td>
                  <td className='ri'>{formats.f1(weapon.sdpsArmour)}</td>
                  <td className='ri'>{formats.pct1(weapon.effectivenessArmour)}</td>
                </tr>);
    }    
//    const shieldSourcesData = [];
//    const effectiveShieldData = [];
//    const shieldDamageTakenData = [];
//    const shieldTooltipDetails = [];
//    const shieldAbsoluteTooltipDetails = [];
//    const shieldExplosiveTooltipDetails = [];
//    const shieldKineticTooltipDetails = [];
//    const shieldThermalTooltipDetails = [];
//    let maxEffectiveShield = 0;
//    if (shield.total) {
//      shieldSourcesData.push({ value: Math.round(shield.generator), label: translate('generator') });
//      shieldSourcesData.push({ value: Math.round(shield.boosters), label: translate('boosters') });
//      shieldSourcesData.push({ value: Math.round(shield.cells), label: translate('cells') });

//      shieldTooltipDetails.push(<div key='generator'>{translate('generator') + ' ' + formats.int(shield.generator)}{units.MJ}</div>);
//      shieldTooltipDetails.push(<div key='boosters'>{translate('boosters') + ' ' + formats.int(shield.boosters)}{units.MJ}</div>);
//      shieldTooltipDetails.push(<div key='cells'>{translate('cells') + ' ' + formats.int(shield.cells)}{units.MJ}</div>);

//      shieldAbsoluteTooltipDetails.push(<div key='generator'>{translate('generator') + ' ' + formats.pct1(shield.absolute.generator)}</div>);
//      shieldAbsoluteTooltipDetails.push(<div key='boosters'>{translate('boosters') + ' ' + formats.pct1(shield.absolute.boosters)}</div>);
//      shieldAbsoluteTooltipDetails.push(<div key='power distributor'>{translate('power distributor') + ' ' + formats.pct1(shield.absolute.sys)}</div>);

//      shieldExplosiveTooltipDetails.push(<div key='generator'>{translate('generator') + ' ' + formats.pct1(shield.explosive.generator)}</div>);
//      shieldExplosiveTooltipDetails.push(<div key='boosters'>{translate('boosters') + ' ' + formats.pct1(shield.explosive.boosters)}</div>);
//      shieldExplosiveTooltipDetails.push(<div key='power distributor'>{translate('power distributor') + ' ' + formats.pct1(shield.explosive.sys)}</div>);

//      shieldKineticTooltipDetails.push(<div key='generator'>{translate('generator') + ' ' + formats.pct1(shield.kinetic.generator)}</div>);
//      shieldKineticTooltipDetails.push(<div key='boosters'>{translate('boosters') + ' ' + formats.pct1(shield.kinetic.boosters)}</div>);
//      shieldKineticTooltipDetails.push(<div key='power distributor'>{translate('power distributor') + ' ' + formats.pct1(shield.kinetic.sys)}</div>);

//      shieldThermalTooltipDetails.push(<div key='generator'>{translate('generator') + ' ' + formats.pct1(shield.thermal.generator)}</div>);
//      shieldThermalTooltipDetails.push(<div key='boosters'>{translate('boosters') + ' ' + formats.pct1(shield.thermal.boosters)}</div>);
//      shieldThermalTooltipDetails.push(<div key='power distributor'>{translate('power distributor') + ' ' + formats.pct1(shield.thermal.sys)}</div>);

//      const effectiveAbsoluteShield = shield.total / shield.absolute.total;
//      effectiveShieldData.push({ value: Math.round(effectiveAbsoluteShield), label: translate('absolute') });
//      const effectiveExplosiveShield = shield.total / shield.explosive.total;
//      effectiveShieldData.push({ value: Math.round(effectiveExplosiveShield), label: translate('explosive') });
//      const effectiveKineticShield = shield.total / shield.kinetic.total;
//      effectiveShieldData.push({ value: Math.round(effectiveKineticShield), label: translate('kinetic') });
//      const effectiveThermalShield = shield.total / shield.thermal.total;
//      effectiveShieldData.push({ value: Math.round(effectiveThermalShield), label: translate('thermal') });

//      shieldDamageTakenData.push({ value: Math.round(shield.absolute.total * 100), label: translate('absolute') });
//      shieldDamageTakenData.push({ value: Math.round(shield.explosive.total * 100), label: translate('explosive') });
//      shieldDamageTakenData.push({ value: Math.round(shield.kinetic.total * 100), label: translate('kinetic') });
//      shieldDamageTakenData.push({ value: Math.round(shield.thermal.total * 100), label: translate('thermal') });

//      maxEffectiveShield = Math.max(shield.total / shield.absolute.max, shield.total / shield.explosive.max, shield.total / shield.kinetic.max, shield.total / shield.thermal.max);
//    }

//    const armourSourcesData = [];
//    armourSourcesData.push({ value: Math.round(armour.bulkheads), label: translate('bulkheads') });
//    armourSourcesData.push({ value: Math.round(armour.reinforcement), label: translate('reinforcement') });

//    const armourTooltipDetails = [];
//    armourTooltipDetails.push(<div key='bulkheads'>{translate('bulkheads') + ' ' + formats.int(armour.bulkheads)}</div>);
//    armourTooltipDetails.push(<div key='reinforcement'>{translate('reinforcement') + ' ' + formats.int(armour.reinforcement)}</div>);

//    const armourAbsoluteTooltipDetails = [];
//    armourAbsoluteTooltipDetails.push(<div key='bulkheads'>{translate('bulkheads') + ' ' + formats.pct1(armour.absolute.bulkheads)}</div>);
//    armourAbsoluteTooltipDetails.push(<div key='reinforcement'>{translate('reinforcement') + ' ' + formats.pct1(armour.absolute.reinforcement)}</div>);

//    const armourExplosiveTooltipDetails = [];
//    armourExplosiveTooltipDetails.push(<div key='bulkheads'>{translate('bulkheads') + ' ' + formats.pct1(armour.explosive.bulkheads)}</div>);
//    armourExplosiveTooltipDetails.push(<div key='reinforcement'>{translate('reinforcement') + ' ' + formats.pct1(armour.explosive.reinforcement)}</div>);

//    const armourKineticTooltipDetails = [];
//    armourKineticTooltipDetails.push(<div key='bulkheads'>{translate('bulkheads') + ' ' + formats.pct1(armour.kinetic.bulkheads)}</div>);
//    armourKineticTooltipDetails.push(<div key='reinforcement'>{translate('reinforcement') + ' ' + formats.pct1(armour.kinetic.reinforcement)}</div>);

//    const armourThermalTooltipDetails = [];
//    armourThermalTooltipDetails.push(<div key='bulkheads'>{translate('bulkheads') + ' ' + formats.pct1(armour.thermal.bulkheads)}</div>);
//    armourThermalTooltipDetails.push(<div key='reinforcement'>{translate('reinforcement') + ' ' + formats.pct1(armour.thermal.reinforcement)}</div>);

//    const effectiveArmourData = [];
//    const effectiveAbsoluteArmour = armour.total / armour.absolute.total;
//    effectiveArmourData.push({ value: Math.round(effectiveAbsoluteArmour), label: translate('absolute') });
//    const effectiveExplosiveArmour = armour.total / armour.explosive.total;
//    effectiveArmourData.push({ value: Math.round(effectiveExplosiveArmour), label: translate('explosive') });
//    const effectiveKineticArmour = armour.total / armour.kinetic.total;
//    effectiveArmourData.push({ value: Math.round(effectiveKineticArmour), label: translate('kinetic') });
//    const effectiveThermalArmour = armour.total / armour.thermal.total;
//    effectiveArmourData.push({ value: Math.round(effectiveThermalArmour), label: translate('thermal') });

//    const armourDamageTakenData = [];
//    armourDamageTakenData.push({ value: Math.round(armour.absolute.total * 100), label: translate('absolute') });
//    armourDamageTakenData.push({ value: Math.round(armour.explosive.total * 100), label: translate('explosive') });
//    armourDamageTakenData.push({ value: Math.round(armour.kinetic.total * 100), label: translate('kinetic') });
//    armourDamageTakenData.push({ value: Math.round(armour.thermal.total * 100), label: translate('thermal') });

    return (
      <span id='offence'>
        <table width='100%'>
          <thead>
          <tr className='main'>
            <th rowSpan='2' className='sortable' onClick={sortOrder.bind(this, 'n')}>{translate('weapon')}</th>
            <th colSpan='2'>{translate('opponent shields')}</th>
            <th colSpan='2'>{translate('opponent armour')}</th>
          </tr>
          <tr>
            <th className='lft sortable' onClick={sortOrder.bind(this, 'esdpss')}>{translate('effective sdps')}</th>
            <th className='sortable' onClick={sortOrder.bind(this, 'es')}>{translate('effectiveness')}</th>
            <th className='lft sortable' onClick={sortOrder.bind(this, 'esdpsh')}>{translate('effective sdps')}</th>
            <th className='sortable' onClick={sortOrder.bind(this, 'eh')}>{translate('effectiveness')}</th>
          </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </table>
      </span>);
  }
}
