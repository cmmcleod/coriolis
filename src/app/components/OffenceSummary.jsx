import React from 'react';
import cn from 'classnames';
import TranslatedComponent from './TranslatedComponent';
import { DamageKinetic, DamageThermal, DamageExplosive } from './SvgIcons';

/**
 * Offence summary
 */
export default class OffenceSummary extends TranslatedComponent {
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
   * Render offence summary
   * @return {React.Component} contents
   */
  render() {
    let ship = this.props.ship;
    let { language, tooltip, termtip } = this.context;
    let { formats, translate } = language;

    return (
      <span>
        <h1>{translate('offence summary')}</h1>
        <table className='summary' style={{ marginLeft: 'auto', marginRight: 'auto', lineHeight: '1em', backgroundColor: 'transparent' }}>
          <tbody>
            <tr>
              <td colSpan='4' className='summary'><h2>{translate('dps')}: {formats.f1(ship.totalDps)}</h2></td>
            </tr>
            <tr>
              <td className='le'>{translate('damage by')}</td>
              <td className='ri' onMouseOver={termtip.bind(null, 'explosive')} onMouseOut={tooltip.bind(null, null)}><DamageExplosive /> {formats.f1(ship.totalExplDps)}</td>
              <td className='ri' onMouseOver={termtip.bind(null, 'kinetic')} onMouseOut={tooltip.bind(null, null)}><DamageKinetic /> {formats.f1(ship.totalKinDps)}</td>
              <td className='ri' onMouseOver={termtip.bind(null, 'thermal')} onMouseOut={tooltip.bind(null, null)}><DamageThermal /> {formats.f1(ship.totalThermDps)}</td>
            </tr>
            
            <tr>
              <td colSpan='4' className='summary'><h2>{translate('sdps')}: {formats.f1(ship.totalSDps)}</h2></td>
            </tr>
            <tr>
              <td className='le'>{translate('damage by')}</td>
              <td className='ri' onMouseOver={termtip.bind(null, 'explosive')} onMouseOut={tooltip.bind(null, null)}><DamageExplosive /> {formats.f1(ship.totalExplSDps)}</td>
              <td className='ri' onMouseOver={termtip.bind(null, 'kinetic')} onMouseOut={tooltip.bind(null, null)}><DamageKinetic /> {formats.f1(ship.totalKinSDps)}</td>
              <td className='ri' onMouseOver={termtip.bind(null, 'thermal')} onMouseOut={tooltip.bind(null, null)}><DamageThermal /> {formats.f1(ship.totalThermSDps)}</td>
            </tr>
            
            <tr>
              <td colSpan='4' className='summary'><h2>{translate('dpe')}: {formats.f1(ship.totalDpe)}</h2></td>
            </tr>
            <tr>
              <td className='le'>{translate('damage by')}</td>
              <td className='ri' onMouseOver={termtip.bind(null, 'explosive')} onMouseOut={tooltip.bind(null, null)}><DamageExplosive /> {formats.f1(ship.totalExplDpe)}</td>
              <td className='ri' onMouseOver={termtip.bind(null, 'kinetic')} onMouseOut={tooltip.bind(null, null)}><DamageKinetic /> {formats.f1(ship.totalKinDpe)}</td>
              <td className='ri' onMouseOver={termtip.bind(null, 'thermal')} onMouseOut={tooltip.bind(null, null)}><DamageThermal /> {formats.f1(ship.totalThermDpe)}</td>
            </tr>
          </tbody>
        </table>
      </span>
    );
  }
}
