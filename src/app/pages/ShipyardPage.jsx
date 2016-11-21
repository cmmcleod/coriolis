import React from 'react';
import Page from './Page';
import { Ships } from 'coriolis-data/dist';
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

/**
 * Generate Ship summary and aggregated properties
 * @param  {String} shipId   Ship Id
 * @param  {Object} shipData Ship Default Data
 * @return {Object}          Ship summary and aggregated properties
 */
function shipSummary(shipId, shipData) {
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
  summary.maxJumpRange = ship.unladenRange;       // Record Jump Range
  ship.optimizeMass({ th: ship.standard[1].maxClass + 'A', fsd: '2D', ft: '1C' }); // Optmize mass with Max Thrusters
  summary.topSpeed = ship.topSpeed;
  summary.topBoost = ship.topBoost;
  summary.baseArmour = ship.armour;

  return summary;
}

/**
 * The Shipyard summary page
 */
export default class ShipyardPage extends Page {

  static cachedShipSummaries = null;

  /**
   * Constructor
   * @param  {Object} props   React Component properties
   * @param  {Object} context React Component context
   */
  constructor(props, context) {
    super(props, context);

    if (!ShipyardPage.cachedShipSummaries) {
      ShipyardPage.cachedShipSummaries = [];
      for (let s in Ships) {
        ShipyardPage.cachedShipSummaries.push(shipSummary(s, Ships[s]));
      }
    }

    this.state = {
      title: 'Coriolis EDCD Edition - Shipyard',
      shipPredicate: 'name',
      shipDesc: true,
      shipSummaries: ShipyardPage.cachedShipSummaries
    };
  }

  /**
   * Higlight the current ship in the table
   * @param  {String} shipId Ship Id
   * @param  {SyntheticEvent} event  Event
   */
  _highlightShip(shipId, event) {
    event.stopPropagation();
    this.setState({ shipId });
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
   * Generate the table row summary for the ship
   * @param  {Object} s           Ship summary
   * @param  {Function} translate Translate function
   * @param  {Object} u           Localized unit map
   * @param  {Function} fInt      Localized integer formatter
   * @param  {Function} fRound    Localized round formatter
   * @return {React.Component}    Table Row
   */
  _shipRowElement(s, translate, u, fInt, fRound) {
    let noTouch = this.context.noTouch;

    return <tr
        key={s.id}
        style={{ height: '1.5em' }}
        className={cn({ highlighted: noTouch && this.state.shipId === s.id })}
        onMouseEnter={noTouch && this._highlightShip.bind(this, s.id)}
      >
      <td className='le'>{s.manufacturer}</td>
      <td className='cap'>{translate(SizeMap[s.class])}</td>
      <td>{s.agility}</td>
      <td className='ri'>{fInt(s.speed)}{u['m/s']}</td>
      <td className='ri'>{fInt(s.boost)}{u['m/s']}</td>
      <td className='ri'>{fInt(s.baseArmour)}</td>
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
  renderPage() {
    let { sizeRatio, language, termtip, noTouch } = this.context;
    let { translate, formats, units } = language;
    let hide = this.context.tooltip.bind(null, null);
    let fInt = formats.int;
    let fRound = formats.round;
    let { shipSummaries, shipPredicate, shipPredicateIndex } = this.state;
    let sortShips = (predicate, index) => this._sortShips.bind(this, predicate, index);

    let filters = {
      // 'class': { 1: 1, 2: 1}
    };

    shipSummaries = shipSummaries.filter(s => {
      for (let prop in filters) {
        if (!(s[prop] in filters[prop])) {
          return false;
        }
      }
      return true;
    });

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

    let i = 0;
    let shipRows = new Array(shipSummaries.length);
    let detailRows = new Array(shipSummaries.length);

    for (let s of shipSummaries) {
      detailRows[i] = this._shipRowElement(s, translate, units, fInt, fRound);
      shipRows[i] = (
        <tr
          key={i}
          style={{ height: '1.5em' }}
          className={cn({ highlighted: noTouch && this.state.shipId === s.id })}
          onMouseEnter={noTouch && this._highlightShip.bind(this, s.id)}
        >
          <td className='le'><Link href={'/outfit/' + s.id}>{s.name}</Link></td>
        </tr>
      );
      i++;
    }

    return (
      <div className='page' style={{ fontSize: sizeRatio + 'em' }}>
        <p style={{ textAlign: 'center' }}>This is <strong>Coriolis EDCD Edition</strong> - a temporary clone of <a href='https://coriolis.io/' target='_blank'>https://coriolis.io/</a> with added support for E:D 2.2. For more info see Settings / <Link href="/about" className='block'>About</Link></p>
        <div style={{ whiteSpace: 'nowrap', margin: '0 auto', fontSize: '0.8em', position: 'relative', display: 'inline-block', maxWidth: '100%' }}>
          <table style={{ width: '12em', position: 'absolute', zIndex: 1 }}>
            <thead>
              <tr className='main'>
                <th style={{ height: '2.6em', padding: '2px 0.4em 1px' }} className='sortable le rgt' onClick={sortShips('name')}>{translate('ship')}</th>
              </tr>
            </thead>
            <tbody onMouseLeave={this._highlightShip.bind(this, null)}>
              {shipRows}
            </tbody>
          </table>
          <div style={{ overflowX: 'scroll', maxWidth: '100%' }}>
          <table style={{ marginLeft: 'calc(12em - 1px)', zIndex: 0 }}>
            <thead>
              <tr className='main'>
                <th rowSpan={2} className='sortable' onClick={sortShips('manufacturer')}>{translate('manufacturer')}</th>
                <th rowSpan={2} className='sortable' onClick={sortShips('class')}>{translate('size')}</th>
                <th rowSpan={2} className='sortable' onMouseEnter={termtip.bind(null, 'maneuverability')} onMouseLeave={hide} onClick={sortShips('agility')}>{translate('mnv')}</th>
                <th colSpan={4}>{translate('base')}</th>
                <th colSpan={4}>{translate('max')}</th>
                <th colSpan={5} className='sortable' onClick={sortShips('hpCount')}>{translate('hardpoints')}</th>
                <th colSpan={8} className='sortable' onClick={sortShips('intCount')}>{translate('internal compartments')}</th>
                <th rowSpan={2} className='sortable' onClick={sortShips('hullMass')}>{translate('hull')}</th>
                <th rowSpan={2} className='sortable' onMouseEnter={termtip.bind(null, 'mass lock factor')} onMouseLeave={hide} onClick={sortShips('masslock')} >{translate('MLF')}</th>
                <th rowSpan={2} className='sortable' onClick={sortShips('retailCost')}>{translate('cost')}</th>
              </tr>
              <tr>
                <th className='sortable lft' onClick={sortShips('speed')}>{translate('speed')}</th>
                <th className='sortable' onClick={sortShips('boost')}>{translate('boost')}</th>
                <th className='sortable' onClick={sortShips('baseArmour')}>{translate('armour')}</th>
                <th className='sortable' onClick={sortShips('baseShieldStrength')}>{translate('shields')}</th>

                <th className='sortable lft' onClick={sortShips('topSpeed')}>{translate('speed')}</th>
                <th className='sortable' onClick={sortShips('topBoost')}>{translate('boost')}</th>
                <th className='sortable' onClick={sortShips('maxJumpRange')}>{translate('jump')}</th>
                <th className='sortable' onClick={sortShips('maxCargo')}>{translate('cargo')}</th>

                <th className='sortable lft' onClick={sortShips('hp',1)}>{translate('S')}</th>
                <th className='sortable' onClick={sortShips('hp', 2)}>{translate('M')}</th>
                <th className='sortable' onClick={sortShips('hp', 3)}>{translate('L')}</th>
                <th className='sortable' onClick={sortShips('hp', 4)}>{translate('H')}</th>
                <th className='sortable' onClick={sortShips('hp', 0)}>{translate('U')}</th>

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
            <tbody onMouseLeave={this._highlightShip.bind(this, null)}>
              {detailRows}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    );
  }
}
