import React from 'react';
import cn from 'classnames';
import TranslatedComponent from './TranslatedComponent';

/**
 * Defence summary
 */
export default class DefenceSummary extends TranslatedComponent {
  static PropTypes = {
    ship: React.PropTypes.object.isRequired
  };

  /**
   * Constructor
   * @param  {Object} props   React Component properties
   */
  constructor(props) {
    super(props);
  }

  /**
   * Render defence summary
   * @return {React.Component} contents
   */
  render() {
    let ship = this.props.ship;
    let { language, tooltip, termtip } = this.context;
    let { formats, translate, units } = language;
    let hide = tooltip.bind(null, null);

    let sgClassNames = cn({ muted: !ship.findInternalByGroup('sg') });

    return (
      <div>
      <h1>{translate('defence summary')}</h1>
      <br/>
      <table style={{ width: '100%', lineHeight: '1em', backgroundColor: 'transparent' }}>
        <thead>
          <tr>
            <th rowSpan={2}>{translate('damage to')}</th>
            <th colSpan={3}>{translate('damage from')}</th>
          </tr>
          <tr>
            <th>{translate('explosive')}</th>
            <th>{translate('kinetic')}</th>
            <th>{translate('thermal')}</th>
          </tr>
        </thead>
        <tbody>
          { ship.shield ?
            <tr>
              <td className='le {sgClassNames}'>{translate('shields')}</td>
              <td className='ri {sgClassNames}'>{ship.shieldExplRes ? formats.pct(ship.shieldExplRes) : '-'}</td>
              <td className='ri {sgClassNames}'>{ship.shieldKinRes ? formats.pct(ship.shieldKinRes) : '-'}</td>
              <td className='ri {sgClassNames}'>{ship.shieldThermRes ? formats.pct(ship.shieldThermRes) : '-'}</td>
            </tr> : null }
          <tr>
            <td className='le'>{translate('hull')}</td>
            <td className='ri'>{formats.pct(ship.hullExplRes)}</td>
            <td className='ri'>{formats.pct(ship.hullKinRes)}</td>
            <td className='ri'>{formats.pct(ship.hullThermRes)}</td>
          </tr>
        </tbody>
      </table>
      <br />
      { ship.shield ?
        <table style={{ width: '100%', lineHeight: '1em', backgroundColor: 'transparent' }}>
          <thead>
            <tr>
              <th colSpan={3}>{translate('shields')}</th>
            </tr>
            <tr>
              <th>{translate('strength')}</th>
              <th onMouseEnter={termtip.bind(null, 'PHRASE_SG_RECOVER', { cap: 0 })} onMouseLeave={hide}>{translate('recovery')}</th>
              <th onMouseEnter={termtip.bind(null, 'PHRASE_SG_RECHARGE', { cap: 0 })} onMouseLeave={hide}>{translate('recovery')}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className='ri'>{formats.int(ship.shield)} {units.MJ}</td>
              <td className='ri'>{ship.shield ? formats.time(ship.calcShieldRecovery()) : '-'}</td>
              <td className='ri'>{ship.shield ? formats.time(ship.calcShieldRecharge()) : '-'}</td>
            </tr>
          </tbody>
        </table> : null }
      </div>
    );
  }
}
