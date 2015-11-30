import React from 'react';
import Page from './Page';
import cn from 'classnames';
import Persist from '../stores/Persist';
import Ships from '../shipyard/Ships';
import Ship from '../shipyard/Ship';
import { toShip } from '../shipyard/Serializer';
import { FloppyDisk, Bin, Switch, Download, Reload } from '../components/SvgIcons';
import ShipSummaryTable from '../components/ShipSummaryTable';
import StandardSlotSection from '../components/StandardSlotSection';
import HardpointsSlotSection from '../components/HardpointsSlotSection';
import InternalSlotSection from '../components/InternalSlotSection';
import UtilitySlotSection from '../components/UtilitySlotSection';

export default class OutfittingPage extends Page {

  constructor(props, context) {
    super(props, context);
    this.state = this._initState(props, context);
  }

  _initState(props, context) {
    let params = context.route.params;
    let shipId = params.ship;
    let code = params.code;
    let buildName = params.bn;
    let data = Ships[shipId];   // Retrieve the basic ship properties, slots and defaults
    let savedCode = Persist.getBuild(shipId, buildName);

    if (!data) {
      // TODO: throw Error for error page - Ship not found
      // Router.errorPage(details) - something along these lines
      throw { msg: 'Ship not found:' + shipId };
    }

    let ship = new Ship(shipId, data.properties, data.slots);          // Create a new Ship instance
    let retrofitShip = new Ship(shipId, data.properties, data.slots);  // Create a new Ship for retrofit comparison

    if (code) {
      toShip(ship, code);  // Populate components from 'code' URL param
    } else {
      ship.buildWith(data.defaults);  // Populate with default components
    }

    if (savedCode) {
      toShip(retrofitShip, savedCode);  // Populate components from last save
    } else {
      retrofitShip.buildWith(data.defaults);
    }

    //this.applyDiscounts();

    return {
      title: 'Outfitting - ' + data.properties.name,
      costTab: Persist.getCostTab() || 'costs',
      buildName,
      shipId,
      ship,
      code,
      savedCode,
      retrofitShip,
      retrofitBuild: savedCode ? buildName : null
    };
  }

  _applyDiscounts() {
    this.state.ship.applyDiscounts(Persist.getShipDiscount(), Persist.getComponentDiscount());
    this.state.retrofitShip.applyDiscounts(Persist.getShipDiscount(), Persist.getComponentDiscount());
  }

  _buildNameChange() {

  }

  _saveBuild() {}

  _reloadBuild() {}

  _resetBuild() {}

  _exportBuild() {}

  componentWillReceiveProps(nextProps, nextContext) {
    this.setState(this._initState(nextProps, nextContext));
  }

  render() {
    let translate = this.context.language.translate;
    let { ship, code, savedCode, buildName } = this.state;

    return (
      <div id='outfit' className={'page'}>
        <div id='overview'>
          <h1>{ship.name}</h1>
          <div id='build'>
            <input value={buildName} onChange={this._buildNameChange} placeholder={translate('enter name')} maxsize={50} />
            <button onClick={this._saveBuild} disabled={!buildName || savedCode && code == savedCode}>
              <FloppyDisk className='lg'/><span className='button-lbl'>{translate('save')}</span>
            </button>
            <button onClick={this._reloadBuild} disabled={!savedCode || code == savedCode}>
              <Reload className='lg'/><span className='button-lbl' >{translate('reload')}</span>
            </button>
            <button className={'danger'} onClick={this._deleteBuild} disabled={!savedCode}>
              <Bin className='lg'/>
            </button>
            <button onClick={this._resetBuild} disabled={!code}>
              <Switch className='lg'/><span className='button-lbl'>{translate('reset')}</span>
            </button>
            <button onClick={this._exportBuild} disabled={!buildName}>
              <Download className='lg'/><span className='button-lbl'>{translate('export')}</span>
            </button>
          </div>
        </div>

        <ShipSummaryTable ship={ship} />

        <StandardSlotSection ship={ship} />
        <InternalSlotSection ship={ship} />
        <HardpointsSlotSection ship={ship} />
        <UtilitySlotSection ship={ship} />

        Component Priorities & Power

        Cost/Pricing List

        Jump Range Chart
        Total Range Chart
        Speed Chart
      </div>
    );
  }
}
