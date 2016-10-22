import React from 'react';
import TranslatedComponent from './TranslatedComponent';
import cn from 'classnames';
import { SizeMap } from '../shipyard/Constants';
import { Warning } from './SvgIcons';

/**
 * Ship Summary Table / Stats
 */
export default class ShipSummaryTable extends TranslatedComponent {

  static propTypes = {
    ship: React.PropTypes.object.isRequired
  };

  /**
   * Render the table
   * @return {React.Component} Summary table
   */
  render() {
    let ship = this.props.ship;
    let { language, tooltip, termtip } = this.context;
    let translate = language.translate;
    let u = language.units;
    let formats = language.formats;
    let round = formats.round;
    let { time, int } = formats;
    let armourDetails = null;
    let sgClassNames = cn({ warning: ship.sgSlot && !ship.shieldStrength, muted: !ship.sgSlot });
    let sgRecover = '-';
    let sgRecharge = '-';
    let hide = tooltip.bind(null, null);

    if (ship.armourMultiplier > 1 || ship.armourAdded) {
      armourDetails = <u>({
        (ship.armourMultiplier > 1 ? formats.rPct(ship.armourMultiplier) : '') +
        (ship.armourAdded ? ' + ' + ship.armourAdded : '')
      })</u>;
    }

    if (ship.shieldStrength) {
      sgRecover = time(ship.calcShieldRecovery());
      sgRecharge = time(ship.calcShieldRecharge());
    }

    return <div id='summary'>
      <table id='summaryTable'>
        <thead>
          <tr className='main'>
            <th rowSpan={2}>{translate('size')}</th>
            <th onMouseEnter={termtip.bind(null, 'maneuverability')} onMouseLeave={hide} rowSpan={2}>{translate('MNV')}</th>
            <th rowSpan={2} className={ cn({ 'bg-warning-disabled': !ship.canThrust() }) }>{translate('speed')}</th>
            <th rowSpan={2} className={ cn({ 'bg-warning-disabled': !ship.canBoost() }) }>{translate('boost')}</th>
            <th onMouseEnter={termtip.bind(null, 'damage per second')} onMouseLeave={hide} rowSpan={2}>{translate('DPS')}</th>
            <th onMouseEnter={termtip.bind(null, 'energy per second')} onMouseLeave={hide} rowSpan={2}>{translate('EPS')}</th>
            <th onMouseEnter={termtip.bind(null, 'heat per second')} onMouseLeave={hide} rowSpan={2}>{translate('HPS')}</th>
            <th rowSpan={2}>{translate('armour')}</th>
            <th colSpan={3}>{translate('shields')}</th>
            <th colSpan={3}>{translate('mass')}</th>
            <th rowSpan={2}>{translate('cargo')}</th>
            <th rowSpan={2}>{translate('fuel')}</th>
            <th colSpan={3}>{translate('jump range')}</th>
            <th onMouseEnter={termtip.bind(null, 'PHRASE_FASTEST_RANGE')} onMouseLeave={hide} colSpan={3}>{translate('fastest range')}</th>
            <th onMouseEnter={termtip.bind(null, 'mass lock factor')} onMouseLeave={hide} rowSpan={2}>{translate('MLF')}</th>
          </tr>
          <tr>
            <th className='lft'>{translate('strength')}</th>
            <th onMouseEnter={termtip.bind(null, 'PHRASE_SG_RECOVER', { cap: 0 })} onMouseLeave={hide}>{translate('recovery')}</th>
            <th onMouseEnter={termtip.bind(null, 'PHRASE_SG_RECHARGE', { cap: 0 })} onMouseLeave={hide}>{translate('recharge')}</th>
            <th className='lft'>{translate('hull')}</th>
            <th onMouseEnter={termtip.bind(null, 'PHRASE_UNLADEN', { cap: 0 })} onMouseLeave={hide}>{translate('unladen')}</th>
            <th onMouseEnter={termtip.bind(null, 'PHRASE_LADEN', { cap: 0 })} onMouseLeave={hide}>{translate('laden')}</th>
            <th className='lft'>{translate('max')}</th>
            <th>{translate('full tank')}</th>
            <th>{translate('laden')}</th>
            <th className='lft'>{translate('jumps')}</th>
            <th>{translate('unladen')}</th>
            <th>{translate('laden')}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className='cap'>{translate(SizeMap[ship.class])}</td>
            <td>{ship.agility}/10</td>
            <td>{ ship.canThrust() ? <span>{int(ship.topSpeed)} {u['m/s']}</span> : <span className='warning'>0 <Warning/></span> }</td>
            <td>{ ship.canBoost() ? <span>{int(ship.topBoost)} {u['m/s']}</span> : <span className='warning'>0 <Warning/></span> }</td>
            <td>{round(ship.totalDps)}</td>
            <td>{round(ship.totalEps)}</td>
            <td>{round(ship.totalHps)}</td>
            <td>{int(ship.armour)} {armourDetails}</td>
            <td className={sgClassNames}>{int(ship.shieldStrength)} {u.MJ} { ship.shieldMultiplier > 1 && ship.shieldStrength > 0 ? <u>({formats.rPct(ship.shieldMultiplier)})</u> : null }</td>
            <td className={sgClassNames}>{sgRecover}</td>
            <td className={sgClassNames}>{sgRecharge}</td>
            <td>{ship.hullMass} {u.T}</td>
            <td>{round(ship.unladenMass)} {u.T}</td>
            <td>{round(ship.ladenMass)} {u.T}</td>
            <td>{round(ship.cargoCapacity)} {u.T}</td>
            <td>{round(ship.fuelCapacity)} {u.T}</td>
            <td>{round(ship.unladenRange)} {u.LY}</td>
            <td>{round(ship.fullTankRange)} {u.LY}</td>
            <td>{round(ship.ladenRange)} {u.LY}</td>
            <td>{round(ship.maxJumpCount)}</td>
            <td>{round(ship.unladenFastestRange)} {u.LY}</td>
            <td>{round(ship.ladenFastestRange)} {u.LY}</td>
            <td>{ship.masslock}</td>
          </tr>
        </tbody>
      </table>
    </div>;
  }
}
