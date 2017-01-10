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

    const shieldGenerator = ship.findShieldGenerator();

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
              <td className='ri'>
                <span onMouseOver={termtip.bind(null, 'explosive')} onMouseOut={tooltip.bind(null, null)}><DamageExplosive /></span>&nbsp;
                <span onMouseOver={termtip.bind(null, translate('base') + ' ' + formats.pct1(1 - shieldGenerator.explres))} onMouseOut={tooltip.bind(null, null)}>{formats.pct1(ship.shieldExplRes || 1)}</span>
              </td>
              <td className='ri'>
                <span onMouseOver={termtip.bind(null, 'kinetic')} onMouseOut={tooltip.bind(null, null)}><DamageKinetic /></span>&nbsp;
                <span onMouseOver={termtip.bind(null, translate('base') + ' ' + formats.pct1(1 - shieldGenerator.kinres))} onMouseOut={tooltip.bind(null, null)}>{formats.pct1(ship.shieldKinRes || 1)}</span>
              </td>
              <td className='ri'>
                <span onMouseOver={termtip.bind(null, 'thermal')} onMouseOut={tooltip.bind(null, null)}><DamageThermal /></span>&nbsp;
                <span onMouseOver={termtip.bind(null, translate('base') + ' ' + formats.pct1(1 - shieldGenerator.thermres))} onMouseOut={tooltip.bind(null, null)}>{formats.pct1(ship.shieldThermRes || 1)}</span>
              </td>
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
              <td className='ri'>
                <span onMouseOver={termtip.bind(null, 'explosive')} onMouseOut={tooltip.bind(null, null)}><DamageExplosive /></span>&nbsp;
                <span onMouseOver={termtip.bind(null, translate('base') + ' ' + formats.pct1(1 - ship.bulkheads.m.explres))} onMouseOut={tooltip.bind(null, null)}>{formats.pct1(ship.hullExplRes || 1)}</span></td>
              <td className='ri'>
                <span onMouseOver={termtip.bind(null, 'kinetic')} onMouseOut={tooltip.bind(null, null)}><DamageKinetic /></span>&nbsp;
                <span onMouseOver={termtip.bind(null, translate('base') + ' ' + formats.pct1(1 - ship.bulkheads.m.kinres))} onMouseOut={tooltip.bind(null, null)}>{formats.pct1(ship.hullKinRes || 1)}</span>
              </td>
              <td className='ri'>
                <span onMouseOver={termtip.bind(null, 'thermal')} onMouseOut={tooltip.bind(null, null)}><DamageThermal /></span>&nbsp;
                <span onMouseOver={termtip.bind(null, translate('base') + ' ' + formats.pct1(1 - ship.bulkheads.m.thermres))} onMouseOut={tooltip.bind(null, null)}>{formats.pct1(ship.hullThermRes || 1)}</span>
              </td>
            </tr>

	    {ship.modulearmour > 0 ?
            <tr>
              <td colSpan='4'><h2>{translate('module armour')}: {formats.int(ship.modulearmour)}</h2></td>
            </tr> : null }

	    {ship.moduleprotection > 0 ?
            <tr>
              <td colSpan='2' className='cn'>{translate('internal protection')} {formats.pct1(ship.moduleprotection)}</td>
              <td colSpan='2' className='cn'>{translate('external protection')} {formats.pct1(ship.moduleprotection / 2)}</td>
            </tr> : null }
          </tbody>
        </table>
      </span>
    );
  }
}
