import React from 'react';
import cn from 'classnames';
import TranslatedComponent from './TranslatedComponent';

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
    let { formats, translate, units } = language;
    let hide = tooltip.bind(null, null);

    return (
      <div>
      <h1>{translate('offence summary')}</h1>
      <br/>
      <table style={{ width: '100%', lineHeight: '1em', backgroundColor: 'transparent' }}>
        <thead>
          <tr>
            <th colSpan={4}>{translate('dps')}</th>
          </tr>
          <tr>
            <th>{translate('explosive')}</th>
            <th>{translate('kinetic')}</th>
            <th>{translate('thermal')}</th>
            <th>{translate('total')}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className='ri'>{formats.f1(ship.totalExplDps)}</td>
            <td className='ri'>{formats.f1(ship.totalKinDps)}</td>
            <td className='ri'>{formats.f1(ship.totalThermDps)}</td>
            <td className='ri'>{formats.f1(ship.totalDps)}</td>
          </tr>
        </tbody>
      </table>
      <br/>
      <table style={{ width: '100%', lineHeight: '1em', backgroundColor: 'transparent' }}>
        <thead>
          <tr>
            <th colSpan={4}>{translate('sustained dps')}</th>
          </tr>
          <tr>
            <th>{translate('explosive')}</th>
            <th>{translate('kinetic')}</th>
            <th>{translate('thermal')}</th>
            <th>{translate('total')}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className='ri'>{formats.f1(ship.totalExplSDps)}</td>
            <td className='ri'>{formats.f1(ship.totalKinSDps)}</td>
            <td className='ri'>{formats.f1(ship.totalThermSDps)}</td>
            <td className='ri'>{formats.f1(ship.totalSDps)}</td>
          </tr>
        </tbody>
      </table>
      <br/>
      <table style={{ width: '100%', lineHeight: '1em', backgroundColor: 'transparent' }}>
        <thead>
          <tr>
            <th colSpan={4}>{translate('dpe')}</th>
          </tr>
          <tr>
            <th>{translate('explosive')}</th>
            <th>{translate('kinetic')}</th>
            <th>{translate('thermal')}</th>
            <th>{translate('total')}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className='ri'>{formats.f1(ship.totalExplDpe)}</td>
            <td className='ri'>{formats.f1(ship.totalKinDpe)}</td>
            <td className='ri'>{formats.f1(ship.totalThermDpe)}</td>
            <td className='ri'>{formats.f1(ship.totalDpe)}</td>
          </tr>
        </tbody>
      </table>
      </div>
    );
  }
}
