import React from 'react';
import cn from 'classnames';
import TranslatedComponent from './TranslatedComponent';
import { Ships } from 'coriolis-data/dist';
import { slotName, slotComparator } from '../utils/SlotFunctions';
import ShipSelector from './ShipSelector';

/**
 * Damage against a selected ship
 */
export default class DamageDealt extends TranslatedComponent {
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
    this._onShipChange = this._onShipChange.bind(this);

    this.state = {
      predicate: 'n',
      desc: true,
      against: Ships['anaconda'],
    };
  }

  /**
   * Triggered when the comparator ship changes
   */
  _onShipChange(s) {
    this.setState({ against: Ships[s] });
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
   * @param  {Ship} against       The ship to compare against
   * @param  {string} predicate   Sort predicate
   * @param  {Boolean} desc       Sort order descending
   */
  _sort(ship, against, predicate, desc) {
    let weaponList = ship.hardpoints;
    let comp = slotComparator.bind(null, this.context.language.translate);

    switch (predicate) {
      case 'n': comp = comp(null, desc); break;
      case 'd': comp = comp((a, b) => a.m.getDps() - b.m.getDps(), desc); break;
      case 'e': comp = comp((a, b) => (a.m.getPiercing() > a.m.hardness ? a.m.getDps() : a.m.getDps() * a.m.getPiercing() / a.m.hardness) - (b.m.getPiercing() > b.m.hardness ? b.m.getDps() : b.m.getDps() * b.m.getPiercing() / b.m.hardness), desc); break;
    }

    weaponList.sort(comp);
  }

  /**
   * Render individual rows for hardpoints
   * @param  {Function} translate   Translate function
   * @param  {Object}   formats     Localised formats map
   * @param  {Object}   ship        Our ship
   * @param  {Object}   against     The ship against which to compare
   * @return {array}                The individual rows
   *
   */
  _renderRows(translate, formats, ship, against) {
    let rows = [];

    for (let hardpoint in ship.hardpoints) {
      if (ship.hardpoints[hardpoint].m) {
        const m = ship.hardpoints[hardpoint].m;
        const classRating = `${m.class}${m.rating}${m.missile ? '/' + m.missile : ''}`;
        const effectiveness = m.getPiercing() >= against.properties.hardness ? 1 : m.getPiercing() / against.properties.hardness;
        const effectiveDps = m.getDps() * effectiveness;
        const effectiveSDps = m.getClip() ?  (m.getClip() * m.getDps() / m.getRoF()) / ((m.getClip() / m.getRoF()) + m.getReload()) * effectiveness : effectiveDps;

        rows.push(<tr key={hardpoint}>
                    <td>{classRating} {slotName(translate, ship.hardpoints[hardpoint])}</td>
                    <td>{formats.round1(effectiveDps)}</td>
                    <td>{formats.round1(effectiveSDps)}</td>
                    <td>{formats.pct(effectiveness)}</td>
                  </tr>);
      }
    }


    return rows;
  }

  /**
   * Render damage dealt
   * @return {React.Component} contents
   */
  render() {
    const { language, tooltip, termtip } = this.context;
    const { formats, translate } = language;

    const ship = this.props.ship;
    const against = this.state.against;
    const hardness = against.properties.hardness;

    return (
      <span>
        <h1>{translate('damage dealt against')}</h1>
        <ShipSelector currentMenu={this.props.currentMenu} onChange={this._onShipChange} />
        <table style={{ width: '100%' }}>
          <thead>
          <tr className='main'>
            <td>{translate('weapon')}</td>
            <td>{translate('effective dps')}</td>
            <td>{translate('effective sdps')}</td>
            <td>{translate('effectiveness')}</td>
          </tr>
          </thead>
          <tbody>
            {this._renderRows(translate, formats, ship, against)}
          </tbody>
        </table>
      </span>
    );
  }
}
