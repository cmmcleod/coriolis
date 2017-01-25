import React from 'react';
import TranslatedComponent from './TranslatedComponent';
import { Modules } from 'coriolis-data/dist';
import { nameComparator } from '../utils/SlotFunctions';
import { CollapseSection, ExpandSection, MountFixed, MountGimballed, MountTurret } from './SvgIcons';
import Module from '../shipyard/Module';
import Slider from '../components/Slider';

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
 * Damage received by a selected ship
 */
export default class DamageReceived extends TranslatedComponent {
  static PropTypes = {
    ship: React.PropTypes.object.isRequired,
    code: React.PropTypes.string.isRequired
  };

  /**
   * Constructor
   * @param  {Object} props   React Component properties
   */
  constructor(props) {
    super(props);

    this._sort = this._sort.bind(this);
    this._onCollapseExpand = this._onCollapseExpand.bind(this);

    this.state = {
      predicate: 'n',
      desc: true,
      expanded: false,
      range: 0.1667,
      maxRange: 6000
    };
  }

  /**
   * Set the initial weapons state
   */
  componentWillMount() {
    this.setState({ weapons: this._calcWeapons(this.props.ship, this.state.range * this.state.maxRange) });
  }

  /**
   * Set the updated weapons state
   * @param  {Object} nextProps   Incoming/Next properties
   * @param  {Object} nextContext Incoming/Next conext
   * @return {boolean}            Returns true if the component should be rerendered
   */
  componentWillReceiveProps(nextProps, nextContext) {
    if (nextProps.code != this.props.code) {
      this.setState({ weapons: this._calcWeapons(nextProps.ship, this.state.range * this.state.maxRange) });
    }
    return true;
  }

  /**
   * Calculate the damage received by a ship
   * @param  {Object} ship        The ship which will receive the damage
   * @param  {Object} range       The engagement range
   * @return {boolean}            Returns the per-weapon damage
   */
  _calcWeapons(ship, range) {
    // Tidy up the range so that it's to 4 decimal places
    range = Math.round(10000 * range) / 10000;

    let weapons = [];
    for (let grp in Modules.hardpoints) {
      if (Modules.hardpoints[grp][0].damage && Modules.hardpoints[grp][0].damagedist) {
        for (let mId in Modules.hardpoints[grp]) {
          const m = new Module(Modules.hardpoints[grp][mId]);
          let dropoff = 1;
          if (m.getFalloff()) {
            // Calculate the dropoff % due to range
            if (range > m.getRange()) {
              // Weapon is out of range
              dropoff = 0;
            } else {
              const falloff = m.getFalloff();
              if (range > falloff) {
                const dropoffRange = m.getRange() - falloff;
                // Assuming straight-line falloff
                dropoff = 1 - (range - falloff) / dropoffRange;
              }
            }
          }
          const classRating = `${m.class}${m.rating}${m.missile ? '/' + m.missile : ''}`;

          // Base DPS
          const baseDps = m.getDps() * dropoff;
          const baseSDps = m.getClip() ?  ((m.getClip() * baseDps / m.getRoF()) / ((m.getClip() / m.getRoF()) + m.getReload())) * dropoff : baseDps;

          // Effective DPS taking in to account shield resistance
          let effectivenessShields = 0;
          if (m.getDamageDist().E) {
            effectivenessShields += m.getDamageDist().E * (1 - ship.shieldExplRes);
          }
          if (m.getDamageDist().K) {
            effectivenessShields += m.getDamageDist().K * (1 - ship.shieldKinRes);
          }
          if (m.getDamageDist().T) {
            effectivenessShields += m.getDamageDist().T * (1 - ship.shieldThermRes);
          }
          if (m.getDamageDist().A) {
            effectivenessShields += m.getDamageDist().A;
          }
          effectivenessShields *= dropoff;
          const effectiveDpsShields = baseDps * effectivenessShields;
          const effectiveSDpsShields = baseSDps * effectivenessShields;

          // Effective DPS taking in to account hull hardness and resistance
          let effectivenessHull = 0;
          if (m.getDamageDist().E) {
            effectivenessHull += m.getDamageDist().E * (1 - ship.hullExplRes);
          }
          if (m.getDamageDist().K) {
            effectivenessHull += m.getDamageDist().K * (1 - ship.hullKinRes);
          }
          if (m.getDamageDist().T) {
            effectivenessHull += m.getDamageDist().T * (1 - ship.hullThermRes);
          }
          if (m.getDamageDist().A) {
            effectivenessHull += m.getDamageDist().A;
          }
          effectivenessHull *= Math.min(m.getPiercing() / ship.hardness, 1) * dropoff;
          const effectiveDpsHull = baseDps * effectivenessHull;
          const effectiveSDpsHull = baseSDps * effectivenessHull;

          weapons.push({ id: m.id,
                         classRating,
                         name: m.name || m.grp,
                         mount: m.mount,
                         effectiveDpsShields,
                         effectiveSDpsShields,
                         effectivenessShields,
                         effectiveDpsHull,
                         effectiveSDpsHull,
                         effectivenessHull });
        }
      }
    }

    return weapons;
  }

  /**
   * Triggered when the collapse or expand icons are clicked
   */
  _onCollapseExpand() {
    this.setState({ expanded: !this.state.expanded });
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

    this.state.weapons.sort(comp);
  }

  /**
   * Render individual rows for weapons
   * @param  {Function} translate   Translate function
   * @param  {Object}   formats     Localised formats map
   * @return {array}                The individual rows
   *
   */
  _renderRows(translate, formats) {
    const { termtip, tooltip } = this.context;

    let rows = [];

    for (let i = 0; i < this.state.weapons.length; i++) {
      const weapon = this.state.weapons[i];
      rows.push(<tr key={weapon.id}>
                  <td className='ri'>
                      {weapon.mount == 'F' ? <span onMouseOver={termtip.bind(null, 'fixed')} onMouseOut={tooltip.bind(null, null)}><MountFixed className='icon'/></span> : null}
                      {weapon.mount == 'G' ? <span onMouseOver={termtip.bind(null, 'gimballed')} onMouseOut={tooltip.bind(null, null)}><MountGimballed /></span> : null}
                      {weapon.mount == 'T' ? <span onMouseOver={termtip.bind(null, 'turreted')} onMouseOut={tooltip.bind(null, null)}><MountTurret /></span> : null}
                    {weapon.classRating} {translate(weapon.name)}
                  </td>
                  <td>{formats.round1(weapon.effectiveDpsShields)}</td>
                  <td>{formats.round1(weapon.effectiveSDpsShields)}</td>
                  <td>{formats.pct(weapon.effectivenessShields)}</td>
                  <td>{formats.round1(weapon.effectiveDpsHull)}</td>
                  <td>{formats.round1(weapon.effectiveSDpsHull)}</td>
                  <td>{formats.pct(weapon.effectivenessHull)}</td>
                </tr>);
    }
    return rows;
  }

  /**
   * Update current range
   * @param  {number} range Range 0-1
   */
  _rangeChange(range) {
    this.setState({ range, weapons: this._calcWeapons(this.props.ship, this.state.range * this.state.maxRange) });
  }

  /**
   * Render damage received
   * @return {React.Component} contents
   */
  render() {
    const { language, onWindowResize, sizeRatio, tooltip, termtip } = this.context;
    const { formats, translate, units } = language;
    const { expanded, maxRange, range } = this.state;

    const sortOrder = this._sortOrder;
    const onCollapseExpand = this._onCollapseExpand;

    return (
      <span>
        <h1>{translate('damage received by')} {expanded ? <span onClick={onCollapseExpand}><CollapseSection className='summary'/></span> : <span onClick={onCollapseExpand}><ExpandSection className='summary'/></span>}</h1>
	{expanded ? <span>
        <table className='summary' style={{ width: '100%' }}>
          <thead>
          <tr className='main'>
            <th rowSpan={2} className='sortable' onClick={sortOrder.bind(this, 'n')} >{translate('weapon')}</th>
            <th colSpan={3} >{translate('against shields')}</th>
            <th colSpan={3} >{translate('against hull')}</th>
            </tr>
          <tr>
            <th className='sortable lft' onClick={sortOrder.bind(this, 'edpss')} onMouseOver={termtip.bind(null, 'dps')} onMouseOut={tooltip.bind(null, null)}>{translate('DPS')}</th>
            <th className='sortable' onClick={sortOrder.bind(this, 'esdpss')} onMouseOver={termtip.bind(null, 'sdps')} onMouseOut={tooltip.bind(null, null)}>{translate('SDPS')}</th>
            <th className='sortable' onClick={sortOrder.bind(this, 'es')} >{translate('effectiveness')}</th>
            <th className='sortable lft' onClick={sortOrder.bind(this, 'edpsh')} onMouseOver={termtip.bind(null, 'dps')} onMouseOut={tooltip.bind(null, null)}>{translate('DPS')}</th>
            <th className='sortable' onClick={sortOrder.bind(this, 'esdpsh')} onMouseOver={termtip.bind(null, 'sdps')} onMouseOut={tooltip.bind(null, null)}>{translate('SDPS')}</th>
            <th className='sortable' onClick={sortOrder.bind(this, 'eh')} >{translate('effectiveness')}</th>
          </tr>
          </thead>
          <tbody>
            {this._renderRows(translate, formats)}
          </tbody>
        </table>
        <table style={{ width: '80%', lineHeight: '1em', backgroundColor: 'transparent', margin: 'auto' }}>
          <tbody >
            <tr>
              <td style={{ verticalAlign: 'top', padding: 0, width: '2.5em' }} onMouseEnter={termtip.bind(null, 'PHRASE_ENGAGEMENT_RANGE')} onMouseLeave={tooltip.bind(null, null)}>{translate('engagement range')}</td>
              <td>
                <Slider
                  axis={true}
                  onChange={this._rangeChange.bind(this)}
                  axisUnit={translate('m')}
                  percent={range}
                  max={maxRange}
                  scale={sizeRatio}
                  onResize={onWindowResize}
                />
              </td>
              <td className='primary' style={{ width: '10em', verticalAlign: 'top', fontSize: '0.9em', textAlign: 'left' }}>
                {formats.f2(range * maxRange / 1000)}{units.km}
              </td>
            </tr>
          </tbody>
        </table></span> : null }
      </span>
    );
  }
}
