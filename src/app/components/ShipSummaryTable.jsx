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
    let { time, int, round, f1, f2, pct } = formats;
    let sgClassNames = cn({ warning: ship.sgSlot && !ship.shield, muted: !ship.sgSlot });
    let sgRecover = '-';
    let sgRecharge = '-';
    let hide = tooltip.bind(null, null);

    if (ship.shield) {
      sgRecover = time(ship.calcShieldRecovery());
      sgRecharge = time(ship.calcShieldRecharge());
    }

            // <th colSpan={3}>{translate('shield resistance')}</th>
            // <th colSpan={3}>{translate('hull resistance')}</th>
            // <th className='lft'>{translate('explosive')}</th>
            // <th className='lft'>{translate('kinetic')}</th>
            // <th className='lft'>{translate('thermal')}</th>
            // <th className='lft'>{translate('explosive')}</th>
            // <th className='lft'>{translate('kinetic')}</th>
            // <th className='lft'>{translate('thermal')}</th>
            // <td>{pct(ship.shieldExplRes)}</td>
            // <td>{pct(ship.shieldKinRes)}</td>
            // <td>{pct(ship.shieldThermRes)}</td>
            // <td>{pct(ship.hullExplRes)}</td>
            // <td>{pct(ship.hullKinRes)}</td>
            // <td>{pct(ship.hullThermRes)}</td>
    return <div id='summary'>
      <table id='summaryTable'>
        <thead>
          <tr className='main'>
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
            <td>{ ship.canThrust() ? <span>{int(ship.topSpeed)} {u['m/s']}</span> : <span className='warning'>0 <Warning/></span> }</td>
            <td>{ ship.canBoost() ? <span>{int(ship.topBoost)} {u['m/s']}</span> : <span className='warning'>0 <Warning/></span> }</td>
            <td>{f1(ship.totalDps)}</td>
            <td>{f1(ship.totalEps)}</td>
            <td>{f1(ship.totalHps)}</td>
            <td>{int(ship.armour)}</td>
            <td className={sgClassNames}>{int(ship.shield)} {u.MJ}</td>
            <td className={sgClassNames}>{sgRecover}</td>
            <td className={sgClassNames}>{sgRecharge}</td>
            <td>{ship.hullMass} {u.T}</td>
            <td>{int(ship.unladenMass)} {u.T}</td>
            <td>{int(ship.ladenMass)} {u.T}</td>
            <td>{round(ship.cargoCapacity)} {u.T}</td>
            <td>{round(ship.fuelCapacity)} {u.T}</td>
            <td>{f2(ship.unladenRange)} {u.LY}</td>
            <td>{f2(ship.fullTankRange)} {u.LY}</td>
            <td>{f2(ship.ladenRange)} {u.LY}</td>
            <td>{int(ship.maxJumpCount)}</td>
            <td>{f2(ship.unladenFastestRange)} {u.LY}</td>
            <td>{f2(ship.ladenFastestRange)} {u.LY}</td>
            <td>{ship.masslock}</td>
          </tr>
        </tbody>
      </table>
    </div>;
  }
}
