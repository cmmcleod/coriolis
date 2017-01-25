import React from 'react';
import cn from 'classnames';
import TranslatedComponent from './TranslatedComponent';

/**
 * Movement summary
 */
export default class MovementSummary extends TranslatedComponent {
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
   * Render movement summary
   * @return {React.Component} contents
   */
  render() {
    let ship = this.props.ship;
    let { language, tooltip, termtip } = this.context;
    let { formats, translate, units } = language;
    let hide = tooltip.bind(null, null);
    let boostMultiplier = ship.topBoost / ship.topSpeed;

    return (
      <span>
        <h1>{translate('movement summary')}</h1>
        <table style={{ marginLeft: 'auto', marginRight: 'auto', lineHeight: '1em', backgroundColor: 'transparent', borderSpacing: '0.5em' }}>
          <tbody>
            <tr>
              <td >&nbsp;</td>
              <td colSpan='6'>{translate('engine pips')}</td>
            </tr>
            <tr>
              <td>&nbsp;</td>
              <td>0</td>
              <td>1</td>
              <td>2</td>
              <td>3</td>
              <td>4</td>
              <td onMouseOver={termtip.bind(null, '4b')} onMouseOut={tooltip.bind(null, null)}>4B</td>
            </tr>
            <tr>
              <td className='ri'>{translate('speed')} ({units['m/s']})</td>
              <td className='ri'>{formats.int(ship.speeds[0])}</td>
              <td className='ri'>{formats.int(ship.speeds[1])}</td>
              <td className='ri'>{formats.int(ship.speeds[2])}</td>
              <td className='ri'>{formats.int(ship.speeds[3])}</td>
              <td className='ri'>{formats.int(ship.speeds[4])}</td>
              <td className='ri'>{formats.int(ship.speeds[4] * boostMultiplier)}</td>
            </tr>
            <tr>
              <td className='ri'>{translate('pitch')} ({units['°/s']})</td>
              <td className='ri'>{formats.int(ship.pitches[0])}</td>
              <td className='ri'>{formats.int(ship.pitches[1])}</td>
              <td className='ri'>{formats.int(ship.pitches[2])}</td>
              <td className='ri'>{formats.int(ship.pitches[3])}</td>
              <td className='ri'>{formats.int(ship.pitches[4])}</td>
              <td className='ri'>{formats.int(ship.pitches[4] * boostMultiplier)}</td>
            </tr>
            <tr>
              <td className='ri'>{translate('roll')} ({units['°/s']})</td>
              <td className='ri'>{formats.int(ship.rolls[0])}</td>
              <td className='ri'>{formats.int(ship.rolls[1])}</td>
              <td className='ri'>{formats.int(ship.rolls[2])}</td>
              <td className='ri'>{formats.int(ship.rolls[3])}</td>
              <td className='ri'>{formats.int(ship.rolls[4])}</td>
              <td className='ri'>{formats.int(ship.rolls[4] * boostMultiplier)}</td>
            </tr>
            <tr>
              <td className='ri'>{translate('yaw')} ({units['°/s']})</td>
              <td className='ri'>{formats.int(ship.yaws[0])}</td>
              <td className='ri'>{formats.int(ship.yaws[1])}</td>
              <td className='ri'>{formats.int(ship.yaws[2])}</td>
              <td className='ri'>{formats.int(ship.yaws[3])}</td>
              <td className='ri'>{formats.int(ship.yaws[4])}</td>
              <td className='ri'>{formats.int(ship.yaws[4] * boostMultiplier)}</td>
            </tr>
          </tbody>
        </table>
      </span>
    );
  }
}
