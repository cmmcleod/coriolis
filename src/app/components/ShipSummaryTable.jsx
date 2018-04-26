import React from 'react';
import PropTypes from 'prop-types';
import TranslatedComponent from './TranslatedComponent';
import cn from 'classnames';
import { Warning } from './SvgIcons';
import * as Calc from '../shipyard/Calculations';

/**
 * Ship Summary Table / Stats
 */
export default class ShipSummaryTable extends TranslatedComponent {

  static propTypes = {
    ship: PropTypes.object.isRequired,
    cargo: PropTypes.number.isRequired,
    fuel: PropTypes.number.isRequired,
    marker: PropTypes.string.isRequired,
  };

  /**
   * Render the table
   * @return {React.Component} Summary table
   */
  render() {
    const { ship, cargo, fuel } = this.props;
    let { language, tooltip, termtip } = this.context;
    let translate = language.translate;
    let u = language.units;
    let formats = language.formats;
    let { time, int, round, f1, f2 } = formats;
    let hide = tooltip.bind(null, null);
    const shieldGenerator = ship.findInternalByGroup('sg');
    const sgClassNames = cn({ warning: shieldGenerator && !ship.shield, muted: !shieldGenerator });
    const sgTooltip = shieldGenerator ? 'TT_SUMMARY_SHIELDS' : 'TT_SUMMARY_SHIELDS_NONFUNCTIONAL';
    const timeToDrain = Calc.timeToDrainWep(ship, 4);
    const canThrust = ship.canThrust(cargo, ship.fuelCapacity);
    const speedTooltip = canThrust ? 'TT_SUMMARY_SPEED' : 'TT_SUMMARY_SPEED_NONFUNCTIONAL';
    const canBoost = ship.canBoost(cargo, ship.fuelCapacity);
    const boostTooltip = canBoost ? 'TT_SUMMARY_BOOST' : canThrust ? 'TT_SUMMARY_BOOST_NONFUNCTIONAL' : 'TT_SUMMARY_SPEED_NONFUNCTIONAL';

    const sgMetrics = Calc.shieldMetrics(ship, 4);
    const armourMetrics = Calc.armourMetrics(ship);
    console.log(sgMetrics);
    console.log(armourMetrics);
    return <div id='summary'>
      <table className={'summaryTable'}>
        <thead>
          <tr className='main'>
            <th rowSpan={2} className={ cn({ 'bg-warning-disabled': !canThrust }) }>{translate('speed')}</th>
            <th rowSpan={2} className={ cn({ 'bg-warning-disabled': !canBoost }) }>{translate('boost')}</th>
            <th colSpan={5}>{translate('jump range')}</th>
            <th rowSpan={2}>{translate('shield')}</th>
            <th rowSpan={2}>{translate('integrity')}</th>
            <th rowSpan={2}>{translate('DPS')}</th>
            <th rowSpan={2}>{translate('EPS')}</th>
            <th rowSpan={2}>{translate('TTD')}</th>
            {/* <th onMouseEnter={termtip.bind(null, 'heat per second')} onMouseLeave={hide} rowSpan={2}>{translate('HPS')}</th> */}
            <th rowSpan={2}>{translate('cargo')}</th>
            <th rowSpan={2}>{translate('pax')}</th>
            <th rowSpan={2}>{translate('fuel')}</th>
            <th colSpan={3}>{translate('mass')}</th>
            <th onMouseEnter={termtip.bind(null, 'hull hardness', { cap: 0 })} onMouseLeave={hide} rowSpan={2}>{translate('hrd')}</th>
            <th rowSpan={2}>{translate('crew')}</th>
            <th onMouseEnter={termtip.bind(null, 'mass lock factor', { cap: 0 })} onMouseLeave={hide} rowSpan={2}>{translate('MLF')}</th>
          </tr>
          <tr>
            <th className='lft'>{translate('max')}</th>
            <th>{translate('unladen')}</th>
            <th>{translate('laden')}</th>
            <th>{translate('total unladen')}</th>
            <th>{translate('total laden')}</th>
            <th className='lft'>{translate('hull')}</th>
            <th>{translate('unladen')}</th>
            <th>{translate('laden')}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td onMouseEnter={termtip.bind(null, speedTooltip, { cap: 0 })} onMouseLeave={hide}>{ canThrust ? <span>{int(ship.calcSpeed(4, ship.fuelCapacity, 0, false))}{u['m/s']}</span> : <span className='warning'>0 <Warning/></span> }</td>
            <td onMouseEnter={termtip.bind(null, boostTooltip, { cap: 0 })} onMouseLeave={hide}>{ canBoost ? <span>{int(ship.calcSpeed(4, ship.fuelCapacity, 0, true))}{u['m/s']}</span> : <span className='warning'>0 <Warning/></span> }</td>
            <td><span onMouseEnter={termtip.bind(null, 'TT_SUMMARY_MAX_SINGLE_JUMP', { cap: 0 })} onMouseLeave={hide}>{f2(Calc.jumpRange(ship.unladenMass + ship.standard[2].m.getMaxFuelPerJump(), ship.standard[2].m, ship.standard[2].m.getMaxFuelPerJump()))}{u.LY}</span></td>
            <td><span onMouseEnter={termtip.bind(null, 'TT_SUMMARY_UNLADEN_SINGLE_JUMP', { cap: 0 })} onMouseLeave={hide}>{f2(Calc.jumpRange(ship.unladenMass + ship.fuelCapacity, ship.standard[2].m, ship.fuelCapacity))}{u.LY}</span></td>
            <td><span onMouseEnter={termtip.bind(null, 'TT_SUMMARY_LADEN_SINGLE_JUMP', { cap: 0 })} onMouseLeave={hide}>{f2(Calc.jumpRange(ship.unladenMass + ship.fuelCapacity + ship.cargoCapacity, ship.standard[2].m, ship.fuelCapacity))}{u.LY}</span></td>
            <td onMouseEnter={termtip.bind(null, 'TT_SUMMARY_UNLADEN_TOTAL_JUMP', { cap: 0 })} onMouseLeave={hide}>{f2(Calc.totalJumpRange(ship.unladenMass + ship.fuelCapacity, ship.standard[2].m, ship.fuelCapacity))}{u.LY}</td>
            <td onMouseEnter={termtip.bind(null, 'TT_SUMMARY_LADEN_TOTAL_JUMP', { cap: 0 })} onMouseLeave={hide}>{f2(Calc.totalJumpRange(ship.unladenMass + ship.fuelCapacity + ship.cargoCapacity, ship.standard[2].m, ship.fuelCapacity))}{u.LY}</td>
            <td className={sgClassNames} onMouseEnter={termtip.bind(null, sgTooltip, { cap: 0 })} onMouseLeave={hide}>{int(ship.shield)}{u.MJ}</td>
            <td onMouseEnter={termtip.bind(null, 'TT_SUMMARY_INTEGRITY', { cap: 0 })} onMouseLeave={hide}>{int(ship.armour)}</td>
            <td onMouseEnter={termtip.bind(null, 'TT_SUMMARY_DPS', { cap: 0 })} onMouseLeave={hide}>{f1(ship.totalDps)}</td>
            <td onMouseEnter={termtip.bind(null, 'TT_SUMMARY_EPS', { cap: 0 })} onMouseLeave={hide}>{f1(ship.totalEps)}</td>
            <td onMouseEnter={termtip.bind(null, 'TT_SUMMARY_TTD', { cap: 0 })} onMouseLeave={hide}>{timeToDrain === Infinity ? '∞' : time(timeToDrain)}</td>
            {/* <td>{f1(ship.totalHps)}</td> */}
            <td>{round(ship.cargoCapacity)}{u.T}</td>
            <td>{ship.passengerCapacity}</td>
            <td>{round(ship.fuelCapacity)}{u.T}</td>
            <td onMouseEnter={termtip.bind(null, 'TT_SUMMARY_HULL_MASS', { cap: 0 })} onMouseLeave={hide}>{ship.hullMass}{u.T}</td>
            <td onMouseEnter={termtip.bind(null, 'TT_SUMMARY_UNLADEN_MASS', { cap: 0 })} onMouseLeave={hide}>{int(ship.unladenMass)}{u.T}</td>
            <td onMouseEnter={termtip.bind(null, 'TT_SUMMARY_LADEN_MASS', { cap: 0 })} onMouseLeave={hide}>{int(ship.ladenMass)}{u.T}</td>
            <td>{int(ship.hardness)}</td>
            <td>{ship.crew}</td>
            <td>{ship.masslock}</td>
          </tr>
        </tbody>
      </table>
      <table className={'summaryTable'}>
        <thead>
          <tr className='main'>
            <th colSpan={3}>{translate('armour metrics')}</th>
            <th colSpan={3}>{translate('shield metrics')}</th>
          </tr>
          <tr>
            <th className='lft'>{translate('explres')}</th>
            <th className='lft'>{translate('kinres')}</th>
            <th className='lft'>{translate('thermres')}</th>

            <th className='lft'>{translate('explres')}</th>
            <th className='lft'>{translate('kinres')}</th>
            <th className='lft'>{translate('thermres')}</th>

          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{int(ship.hullExplRes * 100) + '%'}</td>
            <td>{int(ship.hullThermRes * 100) + '%'}</td>
            <td>{int(ship.hullKinRes * 100) + '%'}</td>

            <td>{int(ship.shieldExplRes * 100) + '%'}</td>
            <td>{int(ship.shieldThermRes * 100) + '%'}</td>
            <td>{int(ship.shieldKinRes * 100) + '%'}</td>


          </tr>
        </tbody>
      </table>
      <table className={'summaryTable'}>
        <thead>
          <tr className='main'>
            <th colSpan={4}>{translate('effective armour')}</th>
            <th colSpan={4}>{translate('effective shield')}</th>
          </tr>
          <tr>
            <th className='lft'>{translate('absolute') + ' ' + translate('armour')}</th>
            <th className='lft'>{translate('explosive') + ' ' + translate('armour')}</th>
            <th className='lft'>{translate('kinetic') + ' ' + translate('armour')}</th>
            <th className='lft'>{translate('thermal') + ' ' + translate('armour')}</th>

            <th className='lft'>{translate('absolute') + ' ' + translate('shield')}</th>
            <th className='lft'>{translate('explosive') + ' ' + translate('shield')}</th>
            <th className='lft'>{translate('kinetic') + ' ' + translate('shield')}</th>
            <th className='lft'>{translate('thermal') + ' ' + translate('shield')}</th>

          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{int(armourMetrics.total / armourMetrics.absolute.total)}</td>
            <td>{int(armourMetrics.total / armourMetrics.explosive.total)}</td>
            <td>{int(armourMetrics.total / armourMetrics.kinetic.total)}</td>
            <td>{int(armourMetrics.total / armourMetrics.thermal.total)}</td>


            <td>{int(sgMetrics.total / sgMetrics.absolute.total)}</td>
            <td>{int(sgMetrics.total / sgMetrics.explosive.total)}</td>
            <td>{int(sgMetrics.total / sgMetrics.kinetic.total)}</td>
            <td>{int(sgMetrics.total / sgMetrics.thermal.total)}</td>

          </tr>
        </tbody>
      </table>
    </div>;
  }
}
