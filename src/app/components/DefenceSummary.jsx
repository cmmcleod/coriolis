import React from 'react';
import cn from 'classnames';
import TranslatedComponent from './TranslatedComponent';
import { DamageKinetic, DamageThermal, DamageExplosive } from './SvgIcons';

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

    return (
      <span>
        <h1>{translate('defence summary')}</h1>
        <table className='summary' style={{ marginLeft: 'auto', marginRight: 'auto', lineHeight: '1em', backgroundColor: 'transparent' }}>
          <tbody>
            {ship.shield ?
            <tr>
              <td colSpan='4' className='summary'><h2>{translate('shields')}: {formats.int(ship.shield)} {units.MJ}</h2></td>
            </tr> : null }
            {ship.shield ?
            <tr>
              <td className='ri' onMouseEnter={termtip.bind(null, 'PHRASE_SG_RECOVER', { cap: 0 })} onMouseLeave={hide}>{translate('recovery')}</td>
              <td className='le'>{formats.time(ship.calcShieldRecovery())}</td>
              <td className='ri' onMouseEnter={termtip.bind(null, 'PHRASE_SG_RECHARGE', { cap: 0 })} onMouseLeave={hide}>{translate('recharge')}</td>
              <td className='le'>{formats.time(ship.calcShieldRecharge())}</td>
            </tr> : null }
            {ship.shield ?
            <tr>
              <td className='le'>{translate('damage from')}</td>
              <td className='ri' onMouseOver={termtip.bind(null, 'explosive')} onMouseOut={tooltip.bind(null, null)}><DamageExplosive /> {formats.pct1(ship.shieldExplRes || 1)}</td>
              <td className='ri' onMouseOver={termtip.bind(null, 'kinetic')} onMouseOut={tooltip.bind(null, null)}><DamageKinetic /> {formats.pct1(ship.shieldKinRes || 1)}</td>
              <td className='ri' onMouseOver={termtip.bind(null, 'thermal')} onMouseOut={tooltip.bind(null, null)}><DamageThermal /> {formats.pct1(ship.shieldThermRes || 1)}</td>
            </tr> : null }

            { ship.shield && ship.shieldCells ?
            <tr>
              <td colSpan='4'><h2>{translate('shield cells')}: {formats.int(ship.shieldCells)} {units.MJ}</h2></td>
            </tr> : null }

            <tr>
              <td colSpan='4'><h2>{translate('armour')}: {formats.int(ship.armour)}</h2></td>
            </tr>
            <tr>
              <td className='le'>{translate('damage from')}</td>
              <td className='ri' onMouseOver={termtip.bind(null, 'explosive')} onMouseOut={tooltip.bind(null, null)}><DamageExplosive /> {formats.pct1(ship.hullExplRes || 1)}</td>
              <td className='ri' onMouseOver={termtip.bind(null, 'kinetic')} onMouseOut={tooltip.bind(null, null)}><DamageKinetic /> {formats.pct1(ship.hullKinRes || 1)}</td>
              <td className='ri' onMouseOver={termtip.bind(null, 'thermal')} onMouseOut={tooltip.bind(null, null)}><DamageThermal /> {formats.pct1(ship.hullThermRes || 1)}</td>
            </tr>
          </tbody>
        </table>
      </span>
    );
  }
}
