import React from 'react';
import TranslatedComponent from './TranslatedComponent';
import cn from 'classnames';
import { Warning } from './SvgIcons';
import * as Calc from '../shipyard/Calculations';

/**
 * Ship Summary Table / Stats
 */
export default class ShipSummaryTable extends TranslatedComponent {

  static propTypes = {
    ship: React.PropTypes.object.isRequired,
    sys: React.PropTypes.number.isRequired,
    eng: React.PropTypes.number.isRequired,
    wep: React.PropTypes.number.isRequired,
    cargo: React.PropTypes.number.isRequired,
    fuel: React.PropTypes.number.isRequired,
    marker: React.PropTypes.string.isRequired,
  };

  /**
   * Render the table
   * @return {React.Component} Summary table
   */
  render() {
    const { ship, fuel, eng, wep, cargo, boost } = this.props;
    let { language, tooltip, termtip } = this.context;
    let translate = language.translate;
    let u = language.units;
    let formats = language.formats;
    let { time, int, round, f1, f2 } = formats;
    let hide = tooltip.bind(null, null);

    const shieldGenerator = ship.findInternalByGroup('sg');
    const sgClassNames = cn({ warning: shieldGenerator && !ship.shield, muted: !shieldGenerator });
    const timeToDrain = Calc.timeToDrainWep(ship, wep);
    const canThrust = ship.canThrust();
    const canBoost = ship.canBoost();

    return <div id='summary'>
      <table id='summaryTable'>
        <thead>
          <tr className='main'>
            <th rowSpan={2} className={ cn({ 'bg-warning-disabled': !canThrust }) }>{translate('speed')}</th>
            <th rowSpan={2} className={ cn({ 'bg-warning-disabled': !canBoost }) }>{translate('boost')}</th>
            <th onMouseEnter={termtip.bind(null, 'damage per second')} onMouseLeave={hide} rowSpan={2}>{translate('DPS')}</th>
            <th onMouseEnter={termtip.bind(null, 'energy per second')} onMouseLeave={hide} rowSpan={2}>{translate('EPS')}</th>
            <th onMouseEnter={termtip.bind(null, 'time to drain WEP capacitor')} onMouseLeave={hide} rowSpan={2}>{translate('TTD')}</th>
            <th onMouseEnter={termtip.bind(null, 'heat per second')} onMouseLeave={hide} rowSpan={2}>{translate('HPS')}</th>
            <th onMouseEnter={termtip.bind(null, 'hull hardness')} onMouseLeave={hide} rowSpan={2}>{translate('hrd')}</th>
            <th onMouseEnter={termtip.bind(null, 'armour')} onMouseLeave={hide} rowSpan={2}>{translate('arm')}</th>
            <th onMouseEnter={termtip.bind(null, 'shields')} onMouseLeave={hide} rowSpan={2}>{translate('shld')}</th>
            <th colSpan={3}>{translate('mass')}</th>
            <th rowSpan={2}>{translate('cargo')}</th>
            <th rowSpan={2}>{translate('fuel')}</th>
            <th colSpan={2}>{translate('jump range')}</th>
            <th rowSpan={2}>{translate('crew')}</th>
            <th onMouseEnter={termtip.bind(null, 'mass lock factor')} onMouseLeave={hide} rowSpan={2}>{translate('MLF')}</th>
          </tr>
          <tr>
            <th className='lft'>{translate('hull')}</th>
            <th onMouseEnter={termtip.bind(null, 'PHRASE_UNLADEN', { cap: 0 })} onMouseLeave={hide}>{translate('unladen')}</th>
            <th onMouseEnter={termtip.bind(null, 'PHRASE_LADEN', { cap: 0 })} onMouseLeave={hide}>{translate('laden')}</th>
            <th className='lft'>{translate('single')}</th>
            <th>{translate('total')}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{ canThrust ? <span>{int(ship.calcSpeed(eng, fuel, cargo, false))}{u['m/s']}</span> : <span className='warning'>0 <Warning/></span> }</td>
            <td>{ canBoost ? <span>{int(ship.calcSpeed(eng, fuel, cargo, true))}{u['m/s']}</span> : <span className='warning'>0 <Warning/></span> }</td>
            <td>{f1(ship.totalDps)}</td>
            <td>{f1(ship.totalEps)}</td>
            <td>{timeToDrain === Infinity ? '∞' : time(timeToDrain)}</td>
            <td>{f1(ship.totalHps)}</td>
            <td>{int(ship.hardness)}</td>
            <td>{int(ship.armour)}</td>
            <td className={sgClassNames}>{int(ship.shield)}{u.MJ}</td>
            <td>{ship.hullMass}{u.T}</td>
            <td>{int(ship.unladenMass)}{u.T}</td>
            <td>{int(ship.ladenMass)}{u.T}</td>
            <td>{round(ship.cargoCapacity)}{u.T}</td>
            <td>{round(ship.fuelCapacity)}{u.T}</td>
            <td>{f2(Calc.jumpRange(ship.unladenMass + fuel + cargo, ship.standard[2].m, fuel))}{u.LY}</td>
            <td>{f2(Calc.totalJumpRange(ship.unladenMass + fuel + cargo, ship.standard[2].m, fuel))}{u.LY}</td>
            <td>{ship.crew}</td>
            <td>{ship.masslock}</td>
          </tr>
        </tbody>
      </table>
    </div>;
  }
}
