import React from 'react';
import cn from 'classnames';
import { Ships } from 'coriolis-data';
import Persist from '../stores/Persist';
import Ship from '../shipyard/Ship';
import { Insurance } from '../shipyard/Constants';
import { slotName, nameComparator } from '../utils/SlotFunctions';
import TranslatedComponent from './TranslatedComponent';

export default class CostSection extends TranslatedComponent {

  static PropTypes = {
    ship: React.PropTypes.object.isRequired,
    shipId: React.PropTypes.string.isRequired,
    code: React.PropTypes.string.isRequired,
    buildName: React.PropTypes.string
  };

  constructor(props) {
    super(props);

    this._costsTab = this._costsTab.bind(this);

    let data = Ships[props.shipId];   // Retrieve the basic ship properties, slots and defaults
    let retrofitName = props.buildName;
    let shipDiscount = Persist.getShipDiscount();
    let moduleDiscount = Persist.getModuleDiscount();
    let existingBuild = Persist.getBuild(props.shipId, retrofitName);
    let retrofitShip = new Ship(props.shipId, data.properties, data.slots);  // Create a new Ship for retrofit comparison

    if (existingBuild) {
      retrofitShip.buildFrom(existingBuild);  // Populate modules from existing build
    } else {
      retrofitShip.buildWith(data.defaults);  // Populate with default components
    }

    this.props.ship.applyDiscounts(shipDiscount, moduleDiscount);
    retrofitShip.applyDiscounts(shipDiscount, moduleDiscount);

    this.state = {
      retrofitShip,
      retrofitName,
      shipDiscount,
      moduleDiscount,
      total: props.ship.totalCost,
      insurance: Insurance[Persist.getInsurance()],
      tab: Persist.getCostTab(),
      buildOptions: Persist.getBuildsNamesFor(props.shipId),
      ammoPredicate: 'module',
      ammoDesc: true,
      costPredicate: 'cr',
      costDesc: true,
      retroPredicate: 'module',
      retroDesc: true
    };
  }

  _showTab(tab) {
    Persist.setCostTab(tab);
    this.setState({ tab });
  }

  _onDiscountChanged() {
    let shipDiscount = Persist.getShipDiscount();
    let moduleDiscount = Persist.getModuleDiscount();
    this.props.ship.applyDiscounts(shipDiscount, moduleDiscount);
    this.state.retrofitShip.applyDiscounts(shipDiscount, moduleDiscount);
    this.setState({ shipDiscount, moduleDiscount });
  }

  _onInsuranceChanged(insuranceName) {
    this.setState({ insurance: Insurance[insuranceName] });
  }

  _onBaseRetrofitChange(retrofitName) {
    let existingBuild = Persist.getBuild(this.props.shipId, retrofitName);
    this.state.retrofitShip.buildFrom(existingBuild);  // Repopulate modules from existing build
    this.setState({ retrofitName });
  }

  _onBuildSaved(shipId, name, code) {
    if(this.state.retrofitName == name) {
      this.state.retrofitShip.buildFrom(code);  // Repopulate modules from saved build
    } else {
      this.setState({buildOptions: Persist.getBuildsNamesFor(this.props.shipId) });
    }
  }

  _toggleCost(item) {
    this.props.ship.setCostIncluded(item, !item.incCost);
    this.setState({ total: this.props.ship.totalCost });
  }

  _sortCost(predicate) {
    let costList = this.props.ship.costList;
    let { costPredicate, costDesc } = this.state;

    if (predicate) {
      if (costPredicate == predicate) {
        costDesc = !costDesc;
      }
    } else {
      predicate = costPredicate;
    }

    if (predicate == 'm') {
      let translate = this.context.language.translate;
      costList.sort(nameComparator(translate));
    } else {
      costList.sort((a, b) => (a.m && a.m.cost ? a.m.cost : 0) - (b.m && b.m.cost ? b.m.cost : 0));
    }

    if (!costDesc) {
      costList.reverse();
    }

    this.setState({ costPredicate: predicate, costDesc });
  }

  _sortAmmo(predicate) {
    let { ammoPredicate, ammoDesc, ammoCosts } = this.state;

    if (ammoPredicate == predicate) {
      ammoDesc = !ammoDesc;
    }

    switch (predicate) {
      case 'm':
        let translate = this.context.language.translate;
        ammoCosts.sort(nameComparator(translate));
        break;
      default:
        ammoCosts.sort((a, b) => a[predicate] - b[predicate]);
    }

    if (!ammoDesc) {
      ammoCosts.reverse();
    }

    this.setState({ ammoPredicate: predicate, ammoDesc });
  }

  _costsTab() {
    let { ship } = this.props;
    let { total, shipDiscount, moduleDiscount, insurance } = this.state;
    let { translate, formats, units } = this.context.language;
    let rows = [];

    for (let i = 0, l = ship.costList.length; i < l; i++) {
      let item = ship.costList[i];
      if (item.m && item.m.cost) {
        let toggle = this._toggleCost.bind(this, item);
        rows.push(<tr key={i} className={cn('highlight', { disabled: !item.incCost })}>
          <td className='ptr' style={{ width: '1em' }} onClick={toggle}>{item.m.class + item.m.rating}</td>
          <td className='le ptr shorten cap' onClick={toggle}>{slotName(translate, item)}</td>
          <td className='ri ptr' onClick={toggle}>{formats.int(item.discountedCost)}{units.CR}</td>
        </tr>);
      }
    }

    return <div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr className='main'>
            <th colSpan='2' className='sortable le' onClick={this._sortCost.bind(this,'m')}>
              {translate('component')}
              {shipDiscount < 1 && <u className='optional-hide'>{`[${translate('ship')} -${formats.rPct(1 - shipDiscount)}]`}</u>}
              {moduleDiscount < 1 && <u className='optional-hide'>{`[${translate('modules')} -${formats.rPct(1 - moduleDiscount)}]`}</u>}
            </th>
            <th className='sortable le' onClick={this._sortCost.bind(this, 'cr')} >{translate('credits')}</th>
          </tr>
        </thead>
        <tbody>
          {rows}
          <tr className='ri'>
            <td colSpan='2' className='lbl' >{translate('total')}</td>
            <td className='val'>{formats.int(total)}{units.CR}</td>
          </tr>
          <tr className='ri'>
            <td colSpan='2' className='lbl'>{translate('insurance')}</td>
            <td className='val'>{formats.int(total * insurance)}{units.CR}</td>
          </tr>
        </tbody>
      </table>
    </div>;
  }

 updateRetrofitCosts() {
    var costs = $scope.retrofitList = [];
    var total = 0, i, l, item;

    if (ship.bulkheads.id != retrofitShip.bulkheads.id) {
      item = {
        buyClassRating: ship.bulkheads.m.class + ship.bulkheads.m.rating,
        buyName: ship.bulkheads.m.name,
        sellClassRating: retrofitShip.bulkheads.m.class + retrofitShip.bulkheads.m.rating,
        sellName: retrofitShip.bulkheads.m.name,
        netCost: ship.bulkheads.discountedCost - retrofitShip.bulkheads.discountedCost,
        retroItem: retrofitShip.bulkheads
      };
      costs.push(item);
      if (retrofitShip.bulkheads.incCost) {
        total += item.netCost;
      }
    }

    for (var g in { standard: 1, internal: 1, hardpoints: 1 }) {
      var retroSlotGroup = retrofitShip[g];
      var slotGroup = ship[g];
      for (i = 0, l = slotGroup.length; i < l; i++) {
        if (slotGroup[i].id != retroSlotGroup[i].id) {
          item = { netCost: 0, retroItem: retroSlotGroup[i] };
          if (slotGroup[i].id) {
            item.buyName = slotGroup[i].m.name || slotGroup[i].m.grp;
            item.buyClassRating = slotGroup[i].m.class + slotGroup[i].m.rating;
            item.netCost = slotGroup[i].discountedCost;
          }
          if (retroSlotGroup[i].id) {
            item.sellName = retroSlotGroup[i].m.name || retroSlotGroup[i].m.grp;
            item.sellClassRating = retroSlotGroup[i].m.class + retroSlotGroup[i].m.rating;
            item.netCost -= retroSlotGroup[i].discountedCost;
          }
          costs.push(item);
          if (retroSlotGroup[i].incCost) {
            total += item.netCost;
          }
        }
      }
    }
    $scope.retrofitTotal = total;
  }

  _retrofitTab() {
    // return <div>
    //   <div className='scroll-x'>
    //     <table style='width:100%'>
    //       <thead>
    //         <tr className='main'>
    //           <th colspan='2' className='sortable le' ng-click='sortRetrofit('sellName | translate')' >{translate('sell')}</th>
    //           <th colspan='2' className='sortable le' ng-click='sortRetrofit('buyName | translate')' >{translate('buy')}</th>
    //           <th className='sortable le' ng-click='sortRetrofit('netCost')'>
    //             {{'net cost' | translate}} <u className='optional-hide' ng-if='discounts.components < 1'>[-{{fRPct(1 - discounts.components)}}]</u>
    //           </th>
    //         </tr>
    //       </thead>
    //       <tbody>
    //         <tr ng-if='!retrofitList || retrofitList.length == 0'>
    //           <td colspan='5' style='padding: 3em 0;' >{translate('PHRASE_NO_RETROCH')}</td>
    //         </tr>
    //         <tr className='highlight' ng-repeat='item in retrofitList | orderBy:retroPredicate:retroDesc' ng-click='toggleRetrofitCost(item.retroItem)' className={cn({disabled: !item.retroItem.incCost})}>
    //           <td  style='width:1em;'>{{item.sellClassRating}}</td>
    //           <td className='le shorten cap'>{{item.sellName | translate}}</td>
    //           <td style='width:1em;'>{{item.buyClassRating}}</td>
    //           <td className='le shorten cap'>{{item.buyName | translate}}</td>
    //           <td className={cn('ri', item.retroItem.incCost ? item.netCost > 0 ? 'warning' : 'secondary-disabled' : 'disabled' )}>{{ fCrd(item.netCost)}} <u translate>CR</u></td>
    //         </tr>
    //       </tbody>
    //     </table>
    //   </div>
    //   <table className='total'>
    //     <tr className='ri'>
    //       <td className='lbl' >{translate('cost')}</td>
    //       <td colSpan={2} className={retrofitTotal > 0 ? 'warning' : 'secondary-disabled'}>{{fCrd(retrofitTotal)}} <u translate>CR</u></td>
    //     </tr>
    //     <tr className='ri'>
    //       <td className='lbl cap' >{translate('retrofit from')}</td>
    //       <td className='cen' style='border-right:none;width: 1em;'><u className='primary-disabled'>&#9662;</u></td>
    //       <td style='border-left:none;padding:0;'>
    //         <select style='width: 100%;padding: 0' ng-model='$parent.retrofitBuild' ng-change='setRetrofitBase()' ng-options='name as name for (name, build) in allBuilds[ship.id]'>
    //           <option value=''>{{'Stock' | translate}}</option>
    //         </select>
    //       </td>
    //     </tr>
    //   </table>
    // </div>;
  }

  _ammoTab() {
    let { ammoTotal, ammoCosts } = this.state;
    let { translate, formats, units } = this.context.language;
    let int = formats.int;
    let rows = [];

    for (let i = 0, l = ammoCosts.length; i < l; i++) {
      let item = ammoCosts[i];
      rows.push(<tr key={i} className='highlight'>
        <td style={{ width: '1em' }}>{item.m.class + item.m.rating}</td>
        <td className='le shorten cap'>{slotName(translate, item)}</td>
        <td className='ri'>{int(item.max)}</td>
        <td className='ri'>{int(item.cost)}{units.CR}</td>
        <td className='ri'>{int(item.total)}{units.CR}</td>
      </tr>);
    }
    console.log(rows);
    return <div>
      <div className='scroll-x' >
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr className='main'>
              <th colSpan='2' className='sortable le' onClick={this._sortAmmo.bind(this, 'm')} >{translate('module')}</th>
              <th colSpan='1' className='sortable le' onClick={this._sortAmmo.bind(this, 'max')} >{translate('qty')}</th>
              <th colSpan='1' className='sortable le' onClick={this._sortAmmo.bind(this, 'cost')} >{translate('unit cost')}</th>
              <th className='sortable le' onClick={this._sortAmmo.bind(this, 'total')}>{translate('total cost')}</th>
            </tr>
          </thead>
          <tbody>
            {rows}
            <tr className='ri'>
              <td colSpan='4' className='lbl' >{translate('total')}</td>
              <td className='val'>{int(ammoTotal)}{units.CR}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>;
  }

  /**
   * Recalculate all ammo costs
   */
  _updateAmmoCosts() {
    let ship = this.props.ship;
    let ammoCosts = [], ammoTotal = 0, item, q, limpets = 0, scoop = false;

    for (let g in { standard: 1, internal: 1, hardpoints: 1 }) {
      let slotGroup = ship[g];
      for (let i = 0, l = slotGroup.length; i < l; i++) {
        if (slotGroup[i].id) {
          //special cases needed for SCB, AFMU, and limpet controllers since they don't use standard ammo/clip
          q = 0;
          switch (slotGroup[i].m.grp) {
            case 'fs': //skip fuel calculation if scoop present
              scoop = true;
              break;
            case 'scb':
              q = slotGroup[i].m.cells;
              break;
            case 'am':
              q = slotGroup[i].m.ammo;
              break;
            case 'fx': case 'hb': case 'cc': case 'pc':
              limpets = ship.cargoCapacity;
              break;
            default:
              q = slotGroup[i].m.clip + slotGroup[i].m.ammo;
          }
          //calculate ammo costs only if a cost is specified
          if (slotGroup[i].m.ammocost > 0) {
            item = {
              m: slotGroup[i].m,
              max: q,
              cost: slotGroup[i].m.ammocost,
              total: q * slotGroup[i].m.ammocost
            };
            ammoCosts.push(item);
            ammoTotal += item.total;
          }
        }
      }
    }

    //limpets if controllers exist and cargo space available
    if (limpets > 0) {
      item = {
        m: { name: 'limpets', class: '', rating: '' },
        max: ship.cargoCapacity,
        cost: 101,
        total: ship.cargoCapacity * 101
      };
      ammoCosts.push(item);
      ammoTotal += item.total;
    }
    //calculate refuel costs if no scoop present
    if (!scoop) {
      item = {
        m: { name: 'fuel', class: '', rating: '' },
        max: ship.fuelCapacity,
        cost: 50,
        total: ship.fuelCapacity * 50
      };
      ammoCosts.push(item);
      ammoTotal += item.total;
    }
    this.setState({ ammoTotal, ammoCosts });
  }

  componentWillMount(){
    this.listeners = [
      Persist.addListener('discounts', this._onDiscountChanged.bind(this)),
      Persist.addListener('insurance', this._onInsuranceChanged.bind(this)),
    ];
    this._updateAmmoCosts(this.props.ship);
    this._sortCost.call(this, this.state.costPredicate);
  }

  componentWillReceiveProps(nextProps, nextContext) {
    this._updateAmmoCosts(nextProps.ship);

    this._sortCost();
  }

  componentWillUnmount(){
    // remove window listener
    this.listeners.forEach(l => l.remove());
  }

  render() {
    let tab = this.state.tab;
    let translate = this.context.language.translate;
    let tabSection;

    switch (tab) {
      case 'ammo': tabSection = this._ammoTab(); break;
      case 'retrofit': tabSection = this._retrofitTab(); break;
      default:
        tab = 'costs';
        tabSection = this._costsTab();
    }

    return (
      <div className='group half'>
        <table className='tabs'>
          <thead>
            <tr>
              <th style={{ width:'33%' }} className={cn({active: tab == 'costs'})} onClick={this._showTab.bind(this, 'costs')} >{translate('costs')}</th>
              <th style={{ width:'33%' }} className={cn({active: tab == 'retrofit'})} onClick={this._showTab.bind(this, 'retrofit')} >{translate('retrofit costs')}</th>
              <th style={{ width:'34%' }} className={cn({active: tab == 'ammo'})} onClick={this._showTab.bind(this, 'ammo')} >{translate('reload costs')}</th>
            </tr>
          </thead>
        </table>
        {tabSection}
      </div>
    );
  }
}
