import React from 'react';
import TranslatedComponent from './TranslatedComponent';
import { Ships } from 'coriolis-data/dist';
import ShipSelector from './ShipSelector';
import { nameComparator } from '../utils/SlotFunctions';
import { CollapseSection, ExpandSection, MountFixed, MountGimballed, MountTurret } from './SvgIcons';
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
 * Damage against a selected ship
 */
export default class DamageDealt extends TranslatedComponent {
  static PropTypes = {
    ship: React.PropTypes.object.isRequired,
    code: React.PropTypes.string.isRequired
  };

  static DEFAULT_AGAINST = Ships['anaconda'];

  /**
   * Constructor
   * @param  {Object} props   React Component properties
   */
  constructor(props) {
    super(props);

    this._sort = this._sort.bind(this);
    this._onShipChange = this._onShipChange.bind(this);
    this._onCollapseExpand = this._onCollapseExpand.bind(this);

    this.state = {
      predicate: 'n',
      desc: true,
      against: DamageDealt.DEFAULT_AGAINST,
      expanded: false,
      range: 0.1667,
      maxRange: 6000
    };
  }

  /**
   * Set the initial weapons state
   */
  componentWillMount() {
    const data = this._calcWeapons(this.props.ship, this.state.against, this.state.range * this.state.maxRange);
    this.setState({ weapons: data.weapons, totals: data.totals });
  }

  /**
   * Set the updated weapons state if our ship changes
   * @param  {Object} nextProps   Incoming/Next properties
   * @param  {Object} nextContext Incoming/Next conext
   * @return {boolean}            Returns true if the component should be rerendered
   */
  componentWillReceiveProps(nextProps, nextContext) {
    if (nextProps.code != this.props.code) {
      const data = this._calcWeapons(this.props.ship, this.state.against, this.state.range * this.state.maxRange);
      this.setState({ weapons: data.weapons, totals: data.totals });
    }
    return true;
  }

  /**
   * Calculate the damage dealt by a ship
   * @param  {Object} ship        The ship which will deal the damage 
   * @param  {Object} against     The ship against which damage will be dealt
   * @param  {Object} range       The engagement range
   * @return {boolean}            Returns the per-weapon damage
   */
  _calcWeapons(ship, against, range) {
    // Tidy up the range so that it's to 4 decimal places
    range = Math.round(10000 * range) / 10000;

    // Track totals
    let totals = {};
    totals.effectivenessShields = 0;
    totals.effectiveDpsShields = 0;
    totals.effectiveSDpsShields = 0;
    totals.effectivenessHull = 0;
    totals.effectiveDpsHull = 0;
    totals.effectiveSDpsHull = 0;
    let totalDps = 0;

    let weapons = [];
    for (let i = 0; i < ship.hardpoints.length; i++) {
      if (ship.hardpoints[i].m && ship.hardpoints[i].enabled) {
        const m = ship.hardpoints[i].m;
        if (m.getDamage() && m.grp !== 'po') {
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
          const effectivenessShields = dropoff;
          const effectiveDpsShields = m.getDps() * effectivenessShields;
          const effectiveSDpsShields = (m.getClip() ?  (m.getClip() * m.getDps() / m.getRoF()) / ((m.getClip() / m.getRoF()) + m.getReload()) * effectivenessShields : effectiveDpsShields);
          const effectivenessHull = (m.getPiercing() >= against.properties.hardness ? 1 : m.getPiercing() / against.properties.hardness) * dropoff;
          const effectiveDpsHull = m.getDps() * effectivenessHull;
          const effectiveSDpsHull = (m.getClip() ?  (m.getClip() * m.getDps() / m.getRoF()) / ((m.getClip() / m.getRoF()) + m.getReload()) * effectivenessHull : effectiveDpsHull);
          totals.effectiveDpsShields += effectiveDpsShields;
          totals.effectiveSDpsShields += effectiveSDpsShields;
          totals.effectiveDpsHull += effectiveDpsHull;
          totals.effectiveSDpsHull += effectiveSDpsHull;
          totalDps += m.getDps();


          weapons.push({ id: i,
                         mount: m.mount,
                         name: m.name || m.grp,
                         classRating,
                         effectiveDpsShields,
                         effectiveSDpsShields,
                         effectivenessShields,
                         effectiveDpsHull,
                         effectiveSDpsHull,
                         effectivenessHull });
        }
      }
    }
console.log('total dps is ' + totalDps);
    totals.effectivenessShields = totalDps == 0 ? 0 : totals.effectiveDpsShields / totalDps;
console.log('total effective dps shields is ' + totals.effectiveDpsShields);
    totals.effectivenessHull = totalDps == 0 ? 0 : totals.effectiveDpsHull / totalDps;
    
    return { weapons, totals };
  }

  /**
   * Triggered when the collapse or expand icons are clicked
   */
  _onCollapseExpand() {
    this.setState({ expanded: !this.state.expanded });
  }

  /**
   * Triggered when the ship we compare against changes
   * @param {string} s the new ship ID
   */
  _onShipChange(s) {
    const against = Ships[s];
    const data = this._calcWeapons(this.props.ship, against, this.state.range * this.state.maxRange);
    this.setState({ against, weapons: data.weapons, totals: data.totals });
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
   * Render individual rows for hardpoints
   * @param  {Function} translate   Translate function
   * @param  {Object}   formats     Localised formats map
   * @return {array}                The individual rows
   *
   */
  _renderRows(translate, formats) {
    const { termtip, tooltip } = this.context;

    let rows = [];

    if (this.state.weapons) {
      for (let i = 0; i < this.state.weapons.length; i++) {
        const weapon = this.state.weapons[i];

        rows.push(<tr key={weapon.id}>
                    <td className='ri'>
                      {weapon.mount == 'F' ? <span onMouseOver={termtip.bind(null, 'fixed')} onMouseOut={tooltip.bind(null, null)}><MountFixed className='icon'/></span> : null}
                      {weapon.mount == 'G' ? <span onMouseOver={termtip.bind(null, 'gimballed')} onMouseOut={tooltip.bind(null, null)}><MountGimballed /></span> : null}
                      {weapon.mount == 'T' ? <span onMouseOver={termtip.bind(null, 'turreted')} onMouseOut={tooltip.bind(null, null)}><MountTurret /></span> : null}
                      {weapon.classRating} {translate(weapon.name)}
                    </td>
                    <td className='ri'>{formats.round1(weapon.effectiveDpsShields)}</td>
                    <td className='ri'>{formats.round1(weapon.effectiveSDpsShields)}</td>
                    <td className='ri'>{formats.pct(weapon.effectivenessShields)}</td>
                    <td className='ri'>{formats.round1(weapon.effectiveDpsHull)}</td>
                    <td className='ri'>{formats.round1(weapon.effectiveSDpsHull)}</td>
                    <td className='ri'>{formats.pct(weapon.effectivenessHull)}</td>
                  </tr>);
      }
    }

    return rows;
  }

  /**
   * Update current range
   * @param  {number} range Range 0-1
   */
  _rangeChange(range) {
    const data = this._calcWeapons(this.props.ship, this.state.against, this.state.range * this.state.maxRange);
    this.setState({ range, weapons: data.weapons, totals: data.totals });
  }

  /**
   * Render damage dealt
   * @return {React.Component} contents
   */
  render() {
    const { language, onWindowResize, sizeRatio, tooltip, termtip } = this.context;
    const { formats, translate, units } = language;
    const { expanded, maxRange, range, totals } = this.state;

    const sortOrder = this._sortOrder;
    const onCollapseExpand = this._onCollapseExpand;

    return (
      <span>
        <h1>{translate('damage dealt against')} {expanded ? <span onClick={onCollapseExpand}><CollapseSection className='summary'/></span> : <span onClick={onCollapseExpand}><ExpandSection className='summary'/></span>}</h1>
        {expanded ?  <span>
        <ShipSelector initial={this.state.against} currentMenu={this.props.currentMenu} onChange={this._onShipChange} />
        <table className='summary' style={{ width: '100%' }}>
          <thead>
            <tr className='main'>
              <th rowSpan='2' className='sortable' onClick={sortOrder.bind(this, 'n')}>{translate('weapon')}</th>
              <th colSpan='3'>{translate('shields')}</th>
              <th colSpan='3'>{translate('armour')}</th>
            </tr>
            <tr>
              <th className='lft sortable' onClick={sortOrder.bind(this, 'edpss')}>{translate('effective dps')}</th>
              <th className='sortable' onClick={sortOrder.bind(this, 'esdpss')}>{translate('effective sdps')}</th>
              <th className='sortable' onClick={sortOrder.bind(this, 'es')}>{translate('effectiveness')}</th>
              <th className='lft sortable' onClick={sortOrder.bind(this, 'edpsh')}>{translate('effective dps')}</th>
              <th className='sortable' onClick={sortOrder.bind(this, 'esdpsh')}>{translate('effective sdps')}</th>
              <th className='sortable' onClick={sortOrder.bind(this, 'eh')}>{translate('effectiveness')}</th>
            </tr>
          </thead>
          <tbody>
            {this._renderRows(translate, formats)}
          </tbody>
          <tfoot>
            <tr className='main'>
              <td className='ri'><i>{translate('total')}</i></td>
              <td className='ri'><i>{formats.round1(totals.effectiveDpsShields)}</i></td>
              <td className='ri'><i>{formats.round1(totals.effectiveSDpsShields)}</i></td>
              <td className='ri'><i>{formats.pct(totals.effectivenessShields)}</i></td>
              <td className='ri'><i>{formats.round1(totals.effectiveDpsHull)}</i></td>
              <td className='ri'><i>{formats.round1(totals.effectiveSDpsHull)}</i></td>
              <td className='ri'><i>{formats.pct(totals.effectivenessHull)}</i></td>
            </tr>
          </tfoot>
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
