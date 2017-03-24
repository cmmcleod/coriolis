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
    wep: React.PropTypes.number.isRequired,
    opponentSys: React.PropTypes.number.isRequired
  };

  /**
   * Constructor
   * @param  {Object} props   React Component properties
   */
  constructor(props) {
    super(props);

    this._sort = this._sort.bind(this);

    const damage = Calc.offenceMetrics(props.ship, props.opponent, props.wep, props.opponentSys, props.engagementrange);
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
    if (this.props.marker != nextProps.marker || this.props.eng != nextProps.eng) {
      const damage = Calc.offenceMetrics(nextProps.ship, nextProps.opponent, nextProps.wep, nextProps.opponentSys, nextProps.engagementrange);
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

    this._sort(predicate, desc);
    this.setState({ predicate, desc });
  }

  /**
   * Sorts the weapon list
   * @param  {string} predicate   Sort predicate
   * @param  {Boolean} desc       Sort order descending
   */
  _sort(predicate, desc) {
    let comp = weaponComparator.bind(null, this.context.language.translate);

    switch (predicate) {
      case 'n': comp = comp(null, desc); break;
      case 'esdpss': comp = comp((a, b) => a.sdps.shields.total - b.sdps.shields.total, desc); break;
      case 'es': comp = comp((a, b) => a.effectiveness.shields.total - b.effectiveness.shields.total, desc); break;
      case 'esdpsh': comp = comp((a, b) => a.sdps.armour.total - b.sdps.armour.total, desc); break;
      case 'eh': comp = comp((a, b) => a.effectiveness.armour.total - b.effectiveness.armour.total, desc); break;
    }

    this.state.damage.sort(comp);
  }

  /**
   * Render offence
   * @return {React.Component} contents
   */
  render() {
    const { ship, opponent, wep, engagementrange } = this.props;
    const { language, tooltip, termtip } = this.context;
    const { formats, translate, units } = language;
    const { damage } = this.state;
    const sortOrder = this._sortOrder;

    const pd = ship.standard[4].m;

    const opponentShields = Calc.shieldMetrics(opponent, 4);
    const opponentArmour = Calc.armourMetrics(opponent);

    const timeToDrain = Calc.timeToDrainWep(ship, wep);

    let absoluteShieldsSDps = 0;
    let explosiveShieldsSDps = 0;
    let kineticShieldsSDps = 0;
    let thermalShieldsSDps = 0;
    let absoluteArmourSDps = 0;
    let explosiveArmourSDps = 0;
    let kineticArmourSDps = 0;
    let thermalArmourSDps = 0;

    let totalSEps = 0;

    const rows = [];
    for (let i = 0; i < damage.length; i++) {
      const weapon = damage[i];

      totalSEps += weapon.seps;
      absoluteShieldsSDps += weapon.sdps.shields.absolute;
      explosiveShieldsSDps += weapon.sdps.shields.explosive;
      kineticShieldsSDps += weapon.sdps.shields.kinetic;
      thermalShieldsSDps += weapon.sdps.shields.thermal;
      absoluteArmourSDps += weapon.sdps.armour.absolute;
      explosiveArmourSDps += weapon.sdps.armour.explosive;
      kineticArmourSDps += weapon.sdps.armour.kinetic;
      thermalArmourSDps += weapon.sdps.armour.thermal;

      const effectivenessShieldsTooltipDetails = [];
      effectivenessShieldsTooltipDetails.push(<div key='range'>{translate('range') + ' ' + formats.pct1(weapon.effectiveness.shields.range)}</div>);
      effectivenessShieldsTooltipDetails.push(<div key='resistance'>{translate('resistance') + ' ' + formats.pct1(weapon.effectiveness.shields.resistance)}</div>);
      effectivenessShieldsTooltipDetails.push(<div key='power distributor'>{translate('power distributor') + ' ' + formats.pct1(weapon.effectiveness.shields.sys)}</div>);

      const effectiveShieldsSDpsTooltipDetails = [];
      if (weapon.sdps.shields.absolute) effectiveShieldsSDpsTooltipDetails.push(<div key='absolute'>{translate('absolute') + ' ' + formats.f1(weapon.sdps.shields.absolute)}</div>);
      if (weapon.sdps.shields.explosive) effectiveShieldsSDpsTooltipDetails.push(<div key='explosive'>{translate('explosive') + ' ' + formats.f1(weapon.sdps.shields.explosive)}</div>);
      if (weapon.sdps.shields.kinetic) effectiveShieldsSDpsTooltipDetails.push(<div key='kinetic'>{translate('kinetic') + ' ' + formats.f1(weapon.sdps.shields.kinetic)}</div>);
      if (weapon.sdps.shields.thermal) effectiveShieldsSDpsTooltipDetails.push(<div key='thermal'>{translate('thermal') + ' ' + formats.f1(weapon.sdps.shields.thermal)}</div>);

      const effectivenessArmourTooltipDetails = [];
      effectivenessArmourTooltipDetails.push(<div key='range'>{translate('range') + ' ' + formats.pct1(weapon.effectiveness.armour.range)}</div>);
      effectivenessArmourTooltipDetails.push(<div key='resistance'>{translate('resistance') + ' ' + formats.pct1(weapon.effectiveness.armour.resistance)}</div>);
      effectivenessArmourTooltipDetails.push(<div key='hardness'>{translate('hardness') + ' ' + formats.pct1(weapon.effectiveness.armour.hardness)}</div>);
      const effectiveArmourSDpsTooltipDetails = [];
      if (weapon.sdps.armour.absolute) effectiveArmourSDpsTooltipDetails.push(<div key='absolute'>{translate('absolute') + ' ' + formats.f1(weapon.sdps.armour.absolute)}</div>);
      if (weapon.sdps.armour.explosive) effectiveArmourSDpsTooltipDetails.push(<div key='explosive'>{translate('explosive') + ' ' + formats.f1(weapon.sdps.armour.explosive)}</div>);
      if (weapon.sdps.armour.kinetic) effectiveArmourSDpsTooltipDetails.push(<div key='kinetic'>{translate('kinetic') + ' ' + formats.f1(weapon.sdps.armour.kinetic)}</div>);
      if (weapon.sdps.armour.thermal) effectiveArmourSDpsTooltipDetails.push(<div key='thermal'>{translate('thermal') + ' ' + formats.f1(weapon.sdps.armour.thermal)}</div>);

      rows.push(
        <tr key={weapon.id}>
          <td className='ri'>
            {weapon.mount == 'F' ? <span onMouseOver={termtip.bind(null, 'fixed')} onMouseOut={tooltip.bind(null, null)}><MountFixed className='icon'/></span> : null}
            {weapon.mount == 'G' ? <span onMouseOver={termtip.bind(null, 'gimballed')} onMouseOut={tooltip.bind(null, null)}><MountGimballed /></span> : null}
            {weapon.mount == 'T' ? <span onMouseOver={termtip.bind(null, 'turreted')} onMouseOut={tooltip.bind(null, null)}><MountTurret /></span> : null}
            {weapon.classRating} {translate(weapon.name)}
            {weapon.engineering ? ' (' + weapon.engineering + ')' : null }
          </td>
          <td className='ri'><span onMouseOver={termtip.bind(null, effectiveShieldsSDpsTooltipDetails)} onMouseOut={tooltip.bind(null, null)}>{formats.f1(weapon.sdps.shields.total)}</span></td>
          <td className='ri'><span onMouseOver={termtip.bind(null, effectivenessShieldsTooltipDetails)} onMouseOut={tooltip.bind(null, null)}>{formats.pct1(weapon.effectiveness.shields.total)}</span></td>
          <td className='ri'><span onMouseOver={termtip.bind(null, effectiveArmourSDpsTooltipDetails)} onMouseOut={tooltip.bind(null, null)}>{formats.f1(weapon.sdps.armour.total)}</span></td>
          <td className='ri'><span onMouseOver={termtip.bind(null, effectivenessArmourTooltipDetails)} onMouseOut={tooltip.bind(null, null)}>{formats.pct1(weapon.effectiveness.armour.total)}</span></td>
        </tr>);
    }    

    const totalShieldsSDps = absoluteShieldsSDps + explosiveShieldsSDps + kineticShieldsSDps + thermalShieldsSDps;
    const totalArmourSDps = absoluteArmourSDps + explosiveArmourSDps + kineticArmourSDps + thermalArmourSDps;

    const shieldsSDpsData = [];
    shieldsSDpsData.push({ value: Math.round(absoluteShieldsSDps), label: translate('absolute') });
    shieldsSDpsData.push({ value: Math.round(explosiveShieldsSDps), label: translate('explosive') });
    shieldsSDpsData.push({ value: Math.round(kineticShieldsSDps), label: translate('kinetic') });
    shieldsSDpsData.push({ value: Math.round(thermalShieldsSDps), label: translate('thermal') });

    const armourSDpsData = [];
    armourSDpsData.push({ value: Math.round(absoluteArmourSDps), label: translate('absolute') });
    armourSDpsData.push({ value: Math.round(explosiveArmourSDps), label: translate('explosive') });
    armourSDpsData.push({ value: Math.round(kineticArmourSDps), label: translate('kinetic') });
    armourSDpsData.push({ value: Math.round(thermalArmourSDps), label: translate('thermal') });

    const timeToDepleteShields = Calc.timeToDeplete(opponentShields.total, totalShieldsSDps, totalSEps, pd.getWeaponsCapacity(), pd.getWeaponsRechargeRate() * (wep / 4));
    const timeToDepleteArmour = Calc.timeToDeplete(opponentArmour.total, totalArmourSDps, totalSEps, pd.getWeaponsCapacity(), pd.getWeaponsRechargeRate() * (wep / 4));

    return (
      <span id='offence'>
        <div className='group full'>
        <table>
          <thead>
          <tr className='main'>
            <th rowSpan='2' className='sortable' onClick={sortOrder.bind(this, 'n')}>{translate('weapon')}</th>
            <th colSpan='2'>{translate('opponent\`s shields')}</th>
            <th colSpan='2'>{translate('opponent\`s armour')}</th>
          </tr>
          <tr>
            <th className='lft sortable' onMouseOver={termtip.bind(null, 'TT_EFFECTIVE_SDPS_SHIELDS')} onMouseOut={tooltip.bind(null, null)} onClick={sortOrder.bind(this, 'esdpss')}>{'sdps'}</th>
            <th className='sortable' onMouseOver={termtip.bind(null, 'TT_EFFECTIVENESS_SHIELDS')} onMouseOut={tooltip.bind(null, null)}onClick={sortOrder.bind(this, 'es')}>{'eft'}</th>
            <th className='lft sortable' onMouseOver={termtip.bind(null, 'TT_EFFECTIVE_SDPS_ARMOUR')} onMouseOut={tooltip.bind(null, null)}onClick={sortOrder.bind(this, 'esdpsh')}>{'sdps'}</th>
            <th className='sortable' onMouseOver={termtip.bind(null, 'TT_EFFECTIVENESS_ARMOUR')} onMouseOut={tooltip.bind(null, null)}onClick={sortOrder.bind(this, 'eh')}>{'eft'}</th>
          </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </table>
        </div>
        <div className='group quarter'>
          <h2>{translate('offence metrics')}</h2>
          <h2 onMouseOver={termtip.bind(null, translate('TT_TIME_TO_DRAIN_WEP'))} onMouseOut={tooltip.bind(null, null)}>{translate('PHRASE_TIME_TO_DRAIN_WEP')}<br/>{timeToDrain === Infinity ? translate('never') : formats.time(timeToDrain)}</h2>
          <h2 onMouseOver={termtip.bind(null, translate('TT_EFFECTIVE_SDPS_SHIELDS'))} onMouseOut={tooltip.bind(null, null)}>{translate('PHRASE_EFFECTIVE_SDPS_SHIELDS')}<br/>{formats.f1(totalShieldsSDps)}</h2>
          <h2 onMouseOver={termtip.bind(null, translate('TT_TIME_TO_REMOVE_SHIELDS'))} onMouseOut={tooltip.bind(null, null)}>{translate('PHRASE_TIME_TO_REMOVE_SHIELDS')}<br/>{timeToDepleteShields === Infinity ? translate('never') : formats.time(timeToDepleteShields)}</h2>
          <h2 onMouseOver={termtip.bind(null, translate('TT_EFFECTIVE_SDPS_ARMOUR'))} onMouseOut={tooltip.bind(null, null)}>{translate('PHRASE_EFFECTIVE_SDPS_ARMOUR')}<br/>{formats.f1(totalArmourSDps)}</h2>
          <h2 onMouseOver={termtip.bind(null, translate('TT_TIME_TO_REMOVE_ARMOUR'))} onMouseOut={tooltip.bind(null, null)}>{translate('PHRASE_TIME_TO_REMOVE_ARMOUR')}<br/>{timeToDepleteArmour === Infinity ? translate('never') : formats.time(timeToDepleteArmour)}</h2>
        </div>
        <div className='group quarter'>
          <h2 onMouseOver={termtip.bind(null, translate('PHRASE_SHIELD_DAMAGE'))} onMouseOut={tooltip.bind(null, null)}>{translate('shield damage sources')}</h2>
          <PieChart data={shieldsSDpsData} />
        </div>
        <div className='group quarter'>
          <h2 onMouseOver={termtip.bind(null, translate('PHRASE_ARMOUR_DAMAGE'))} onMouseOut={tooltip.bind(null, null)}>{translate('armour damage sources')}</h2>
          <PieChart data={armourSDpsData} />
        </div>
      </span>);
  }
}
