import React from 'react';
import Page from './Page';
import { Ships } from 'coriolis-data';
import cn from 'classnames';
import Ship from '../shipyard/Ship';
import * as ModuleUtils from '../shipyard/ModuleUtils';
import { SizeMap } from '../shipyard/Constants';
import Link from '../components/Link';

/**
 * Counts the hardpoints by class/size
 * @param  {Object} slot Hardpoint Slot model
 */
function countHp(slot) {
  this.hp[slot.maxClass]++;
  this.hpCount++;
}

/**
 * Counts the internal slots and aggregated properties
 * @param  {Object} slot Internal Slots
 */
function countInt(slot) {
  let crEligible = !slot.eligible || slot.eligible.cr;
  this.int[slot.maxClass - 1]++;  // Subtract 1 since there is no Class 0 Internal compartment
  this.intCount++;
  this.maxCargo += crEligible ? ModuleUtils.findInternal('cr', slot.maxClass, 'E').cargo : 0;
}

let cachedShipSummaries = null;

/**
 * The Shipyard summary page
 */
export default class ShipyardPage extends Page {

  /**
   * Constructor
   * @param  {Object} props   React Component properties
   * @param  {Object} context React Component context
   */
  constructor(props, context) {
    super(props, context);
    this.state = {
      title: 'Coriolis - Shipyard',
      shipPredicate: 'name',
      shipDesc: true
    };
    this.context = context;

    if (!cachedShipSummaries) {
      cachedShipSummaries = [];
      for (let s in Ships) {
        cachedShipSummaries.push(this._shipSummary(s, Ships[s]));
      }
    }

    this.shipSummaries = cachedShipSummaries;
  }

  /**
   * Update state with the specified sort predicates
   * @param  {String} shipPredicate      Sort predicate - property name
   * @param  {number} shipPredicateIndex Sort predicate - property index
   */
  _sortShips(shipPredicate, shipPredicateIndex) {
    let shipDesc = this.state.shipDesc;

    if (typeof shipPredicateIndex == 'object') {
      shipPredicateIndex = undefined;
    }

    if (this.state.shipPredicate == shipPredicate && this.state.shipPredicateIndex == shipPredicateIndex) {
      shipDesc = !shipDesc;
    }

    this.setState({ shipPredicate, shipDesc, shipPredicateIndex });
  };

  /**
   * Generate Ship summary and aggregated properties
   * @param  {String} shipId   Ship Id
   * @param  {Object} shipData Ship Default Data
   * @return {Object}          Ship summary and aggregated properties
   */
  _shipSummary(shipId, shipData) {
    let summary = {
      id: shipId,
      hpCount: 0,
      intCount: 0,
      maxCargo: 0,
      hp: [0, 0, 0, 0, 0], // Utility, Small, Medium, Large, Huge
      int: [0, 0, 0, 0, 0, 0, 0, 0] // Sizes 1 - 8
    };
    Object.assign(summary, shipData.properties);
    let ship = new Ship(shipId, shipData.properties, shipData.slots);

    // Build Ship
    ship.buildWith(shipData.defaults);              // Populate with stock/default components
    ship.hardpoints.forEach(countHp.bind(summary)); // Count Hardpoints by class
    ship.internal.forEach(countInt.bind(summary));  // Count Internal Compartments by class
    summary.retailCost = ship.totalCost;            // Record Stock/Default/retail cost
    ship.optimizeMass({ pd: '1D' });                // Optimize Mass with 1D PD for maximum possible jump range
    summary.maxJumpRange = ship.unladenRange;          // Record Jump Range
    ship.optimizeMass({ th: ship.standard[1].maxClass + 'A' }); // Optmize mass with Max Thrusters
    summary.topSpeed = ship.topSpeed;
    summary.topBoost = ship.topBoost;

    return summary;
  }

  /**
   * Generate the table row summary for the ship
   * @param  {Object} s           Ship summary
   * @param  {Function} translate Translate function
   * @param  {Object} u           Localized unit map
   * @param  {Function} fInt      Localized integer formatter
   * @param  {Function} fRound    Localized round formatter
   * @return {React.Component}    Table Row
   */
  _shipRowElement(s, translate, u, fInt, fRound) {
    return <tr key={s.id} className='highlight'>
      <td className='le'><Link href={'/outfit/' + s.id}>{s.name}</Link></td>
      <td className='le'>{s.manufacturer}</td>
      <td className='cap'>{translate(SizeMap[s.class])}</td>
      <td>{s.agility}</td>
      <td className='ri'>{fInt(s.speed)}{u['m/s']}</td>
      <td className='ri'>{fInt(s.boost)}{u['m/s']}</td>
      <td className='ri'>{s.baseArmour}</td>
      <td className='ri'>{fInt(s.baseShieldStrength)}{u.MJ}</td>
      <td className='ri'>{fInt(s.topSpeed)}{u['m/s']}</td>
      <td className='ri'>{fInt(s.topBoost)}{u['m/s']}</td>
      <td className='ri'>{fRound(s.maxJumpRange)}{u.LY}</td>
      <td className='ri'>{fInt(s.maxCargo)}{u.T}</td>
      <td className={cn({ disabled: !s.hp[1] })}>{s.hp[1]}</td>
      <td className={cn({ disabled: !s.hp[2] })}>{s.hp[2]}</td>
      <td className={cn({ disabled: !s.hp[3] })}>{s.hp[3]}</td>
      <td className={cn({ disabled: !s.hp[4] })}>{s.hp[4]}</td>
      <td className={cn({ disabled: !s.hp[0] })}>{s.hp[0]}</td>
      <td className={cn({ disabled: !s.int[0] })}>{s.int[0]}</td>
      <td className={cn({ disabled: !s.int[1] })}>{s.int[1]}</td>
      <td className={cn({ disabled: !s.int[2] })}>{s.int[2]}</td>
      <td className={cn({ disabled: !s.int[3] })}>{s.int[3]}</td>
      <td className={cn({ disabled: !s.int[4] })}>{s.int[4]}</td>
      <td className={cn({ disabled: !s.int[5] })}>{s.int[5]}</td>
      <td className={cn({ disabled: !s.int[6] })}>{s.int[6]}</td>
      <td className={cn({ disabled: !s.int[7] })}>{s.int[7]}</td>
      <td className='ri'>{fInt(s.hullMass)}{u.T}</td>
      <td>{s.masslock}</td>
      <td className='ri'>{fInt(s.retailCost)}{u.CR}</td>
    </tr>;
  }

  /**
   * Render the Page
   * @return {React.Component} The page contents
   */
  render() {
    let { translate, formats, units } = this.context.language;
    let fInt = formats.int;
    let fRound = formats.round;
    let shipSummaries = this.shipSummaries;
    let shipPredicate = this.state.shipPredicate;
    let shipPredicateIndex = this.state.shipPredicateIndex;
    let shipRows = [];
    let hide = this.context.tooltip.bind(null, null);
    let tip = this.context.termtip;
    let sortShips = (predicate, index) => this._sortShips.bind(this, predicate, index);

    // Sort shipsOverview
    shipSummaries.sort((a, b) => {
      let valA = a[shipPredicate], valB = b[shipPredicate];

      if (shipPredicateIndex != undefined) {
        valA = valA[shipPredicateIndex];
        valB = valB[shipPredicateIndex];
      }

      if (!this.state.shipDesc) {
        let val = valA;
        valA = valB;
        valB = val;
      }

      if(valA == valB) {
        if (a.name > b.name) {
          return 1;
        } else {
          return -1;
        }
      } else if (valA > valB) {
        return 1;
      } else {
        return -1;
      }
    });

    for (let s of shipSummaries) {
      shipRows.push(this._shipRowElement(s, translate, units, fInt, fRound));
    }

    return (
      <div className='page'>
        <div className='scroll-x'>
          <table style={{ fontSize:'0.85em', whiteSpace:'nowrap', margin: '0 auto' }} align='center'>
            <thead>
              <tr className='main'>
                <th rowSpan={2} className='sortable le' onClick={sortShips('name')}>{translate('ship')}</th>
                <th rowSpan={2} className='sortable' onClick={sortShips('manufacturer')}>{translate('manufacturer')}</th>
                <th rowSpan={2} className='sortable' onClick={sortShips('class')}>{translate('size')}</th>
                <th rowSpan={2} className='sortable' onMouseEnter={tip.bind(null, 'maneuverability')} onMouseLeave={hide} onClick={sortShips('agility')}>{translate('mnv')}</th>
                <th colSpan={4}>{translate('base')}</th>
                <th colSpan={4}>{translate('max')}</th>
                <th colSpan={5} className='sortable' onClick={sortShips('hpCount')}>{translate('hardpoints')}</th>
                <th colSpan={8} className='sortable' onClick={sortShips('intCount')}>{translate('internal compartments')}</th>
                <th rowSpan={2} className='sortable' onClick={sortShips('hullMass')}>{translate('hull')}</th>
                <th rowSpan={2} className='sortable' onMouseEnter={tip.bind(null, 'mass lock factor')} onMouseLeave={hide} onClick={sortShips('masslock')} >{translate('MLF')}</th>
                <th rowSpan={2} className='sortable' onClick={sortShips('retailCost')}>{translate('cost')}</th>
              </tr>
              <tr>
                {/*  Base */}
                <th className='sortable lft' onClick={sortShips('speed')}>{translate('speed')}</th>
                <th className='sortable' onClick={sortShips('boost')}>{translate('boost')}</th>
                <th className='sortable' onClick={sortShips('baseArmour')}>{translate('armour')}</th>
                <th className='sortable' onClick={sortShips('baseShieldStrength')}>{translate('shields')}</th>
                {/*  Max */}
                <th className='sortable lft' onClick={sortShips('topSpeed')}>{translate('speed')}</th>
                <th className='sortable' onClick={sortShips('topBoost')}>{translate('boost')}</th>
                <th className='sortable' onClick={sortShips('maxJumpRange')}>{translate('jump')}</th>
                <th className='sortable' onClick={sortShips('maxCargo')}>{translate('cargo')}</th>
                {/*  Hardpoints */}
                <th className='sortable lft' onClick={sortShips('hp',1)}>{translate('S')}</th>
                <th className='sortable' onClick={sortShips('hp', 2)}>{translate('M')}</th>
                <th className='sortable' onClick={sortShips('hp', 3)}>{translate('L')}</th>
                <th className='sortable' onClick={sortShips('hp', 4)}>{translate('H')}</th>
                <th className='sortable' onClick={sortShips('hp', 0)}>{translate('U')}</th>
                {/*  Internal */}
                <th className='sortable lft' onClick={sortShips('int', 0)} >1</th>
                <th className='sortable' onClick={sortShips('int', 1)} >2</th>
                <th className='sortable' onClick={sortShips('int', 2)} >3</th>
                <th className='sortable' onClick={sortShips('int', 3)} >4</th>
                <th className='sortable' onClick={sortShips('int', 4)} >5</th>
                <th className='sortable' onClick={sortShips('int', 5)} >6</th>
                <th className='sortable' onClick={sortShips('int', 6)} >7</th>
                <th className='sortable' onClick={sortShips('int', 7)} >8</th>
              </tr>
            </thead>
            <tbody>
              {shipRows}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}
