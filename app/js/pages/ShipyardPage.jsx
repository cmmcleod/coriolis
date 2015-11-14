import { Component } from 'react';
import { Ships, Components } from 'coriolis-data';
import cn from 'classnames';
import Ship from 'Ship';

function countHp(slot) {
  this.hp[slot.maxClass]++;
  this.hpCount++;
}

function countInt(slot) {
  var crEligible = !slot.eligible || slot.eligible.cr;
  this.int[slot.maxClass - 1]++;  // Subtract 1 since there is no Class 0 Internal compartment
  this.intCount++;
  this.maxCargo += crEligible ? Components.findInternal('cr', slot.maxClass, 'E').capacity : 0;
}

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
  summary.maxJumpRange = ship.unladenRange;          // Record Jump Range
  ship.optimizeMass({ th: ship.standard[1].maxClass + 'A' }); // Optmize mass with Max Thrusters
  summary.topSpeed = ship.topSpeed;
  summary.topBoost = ship.topBoost;

  return summary;
}

let shipSummaries = [];

for (var s in Ships) {
  shipSummaries.push(shipSummary(s, Ships[s]));
}

export default class ShipyardPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      title: 'Coriolis - Shipyard',
      shipPredicate: 'properties.name',
      shipDesc = false
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    // Only on language change. Context?
    return false;
  }

  /**
   * Sort ships
   * @param  {object} key Sort predicate
   */
  _sortShips(shipPredicate, shipPredicateIndex) {
    let shipDesc = this.state.shipPredicate == shipPredicate ? !this.state.shipDesc : this.state.shipDesc;
    this.setState({ shipPredicate, shipDesc, shipPredicateIndex });
  };

  render() {
    let sortShips = this._sortShips.bind(this);
    let shipPredicate = this.state.shipPredicate;
    let shipPredicateIndex = this.state.shipPredicateIndex;
    let shipRows = [];

    // Sort shipsOverview
    shipSummaries.sort((a, b) => {
      let valA = a[shipPredicate], valB = b[shipPredicate];

      if (shipPredicateIndex != undefined) {
        valA = valA[shipPredicateIndex];
        valB = valB[shipPredicateIndex];
      }

      return this.state.shipDesc ? (valA > valB) : (valB > valA);
    });

    for (s of shipSummaries) {
      shipRows.push(
        <tr className={'highlight'}>
          <td className={'le'}><a ui-sref='outfit({shipId: s.id})'>{s.name}</a></td>
          <td className={'le'}>{s.manufacturer}</td>
          <td className={'cap'}>{SZM[s.class] | translate}</td>
          <td className={'ri'}>{{fCrd(s.speed)}} <u translate>m/s</u></td>
          <td className={'ri'}>{{fCrd(s.boost)}} <u translate>m/s</u></td>
          <td className={'ri'}>{s.baseArmour}</td>
          <td className={'ri'}>{{fCrd(s.baseShieldStrength)}} <u translate>Mj</u></td>
          <td className={'ri'}>{{fCrd(s.topSpeed)}} <u translate>m/s</u></td>
          <td className={'ri'}>{{fCrd(s.topBoost)}} <u translate>m/s</u></td>
          <td className={'ri'}>{{fRound(s.maxJumpRange)}} <u translate>LY</u></td>
          <td className={'ri'}>{{fCrd(s.maxCargo)}} <u translate>T</u></td>
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
          <td className={'ri'}>{fCrd(s.hullMass)} <u translate>T</u></td>
          <td className={'ri'}>{s.masslock}</td>
          <td className={'ri'}>{fCrd(s.retailCost)} <u translate>CR</u></td>
        </tr>
      );
    }

    return (
      <div id='shipyard'>
        <div className={'scroll-x'}>
          <table style={{ fontSize:'0.85em', whiteSpace:'nowrap' }}>
            <thead>
              <tr className={'main'}>
                <th rowspan='2' className={'sortable le'} onClick={sortShips('name')} translate='ship'></th>
                <th rowspan='2' className={'sortable'} onClick={sortShips('manufacturer')} translate='manufacturer'></th>
                <th rowspan='2' className={'sortable'} onClick={sortShips('class')} translate='size'></th>
                <th colspan='4' translate='base'></th>
                <th colspan='4' translate='max'></th>
                <th colspan='5' className={'sortable'} onClick={sortShips('hpCount')} translate='hardpoints'></th>
                <th colspan='8' className={'sortable'} onClick={sortShips('intCount')} translate='internal compartments'></th>
                <th rowspan='2' className={'sortable'} onClick={sortShips('hullMass')} translate='hull'></th>
                <th rowspan='2' className={'sortable'} onClick={sortShips('masslock')} translate='MLF'></th>
                <th rowspan='2' className={'sortable'} onClick={sortShips('retailCost')} translate='cost'></th>
              </tr>
              <tr>
                {/*  Base */}
                <th className={'sortable lft'} onClick={sortShips('speed')} translate='speed'></th>
                <th className={'sortable'} onClick={sortShips('boost')} translate='boost'></th>
                <th className={'sortable'} onClick={sortShips('baseArmour')} translate='armour'></th>
                <th className={'sortable'} onClick={sortShips('baseShieldStrength')} translate='shields'></th>
                {/*  Max */}
                <th className={'sortable lft'} onClick={sortShips('topSpeed')} translate='speed'></th>
                <th className={'sortable'} onClick={sortShips('topBoost')} translate='boost'></th>
                <th className={'sortable'} onClick={sortShips('maxJumpRange')} translate='jump'></th>
                <th className={'sortable'} onClick={sortShips('maxCargo')} translate='cargo'></th>
                {/*  Hardpoints */}
                <th className={'sortable lft'} onClick={sortShips('hp',1)} translate='S'></th>
                <th className={'sortable'} onClick={sortShips('hp', 2)} translate='M'></th>
                <th className={'sortable'} onClick={sortShips('hp', 3)} translate='L'></th>
                <th className={'sortable'} onClick={sortShips('hp', 4)} translate='H'></th>
                <th className={'sortable'} onClick={sortShips('hp', 0)} translate='U'></th>
                {/*  Internal */}
                <th className={'sortable lft'} onClick={sortShips('int', 0)} >1</th>
                <th className={'sortable'} onClick={sortShips('int', 1)} >2</th>
                <th className={'sortable'} onClick={sortShips('int', 2)} >3</th>
                <th className={'sortable'} onClick={sortShips('int', 3)} >4</th>
                <th className={'sortable'} onClick={sortShips('int', 4)} >5</th>
                <th className={'sortable'} onClick={sortShips('int', 5)} >6</th>
                <th className={'sortable'} onClick={sortShips('int', 6)} >7</th>
                <th className={'sortable'} onClick={sortShips('int', 7)} >8</th>
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
