import React from 'react';
import { findDOMNode } from 'react-dom';
import Page from './Page';
import cn from 'classnames';
import Router from '../Router';
import Persist from '../stores/Persist';
import { Ships } from 'coriolis-data';
import Ship from '../shipyard/Ship';
import { toDetailedBuild } from '../shipyard/Serializer';
import { FloppyDisk, Bin, Switch, Download, Reload, Fuel } from '../components/SvgIcons';
import ShipSummaryTable from '../components/ShipSummaryTable';
import StandardSlotSection from '../components/StandardSlotSection';
import HardpointsSlotSection from '../components/HardpointsSlotSection';
import InternalSlotSection from '../components/InternalSlotSection';
import UtilitySlotSection from '../components/UtilitySlotSection';
import LineChart from '../components/LineChart';
import PowerManagement from '../components/PowerManagement';
import CostSection from '../components/CostSection';
import ModalExport from '../components/ModalExport';
import Slider from '../components/Slider';

const SPEED_SERIES = ['boost', '4 Pips', '2 Pips', '0 Pips'];
const SPEED_COLORS = ['#0088d2', '#ff8c0d', '#D26D00', '#c06400'];

/**
 * The Outfitting Page
 */
export default class OutfittingPage extends Page {

  /**
   * Constructor
   * @param  {Object} props   React Component properties
   * @param  {Object} context React Component context
   */
  constructor(props, context) {
    super(props, context);
    this.state = this._initState(context);
  }

  /**
   * [Re]Create initial state from context
   * @param  {context} context React component context
   * @return {Object}          New state object
   */
  _initState(context) {
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

    if (code) {
      ship.buildFrom(code);  // Populate modules from serialized 'code' URL param
    } else {
      ship.buildWith(data.defaults);  // Populate with default components
    }

    let fuelCapacity = ship.fuelCapacity;

    return {
      title: 'Outfitting - ' + data.properties.name,
      costTab: Persist.getCostTab() || 'costs',
      buildName,
      shipId,
      ship,
      code,
      savedCode,
      fuelCapacity,
      fuelLevel: 1,
      jumpRangeChartFunc: ship.getJumpRangeWith.bind(ship, fuelCapacity),
      totalRangeChartFunc: ship.getFastestRangeWith.bind(ship, fuelCapacity),
      speedChartFunc: ship.getSpeedsWith.bind(ship, fuelCapacity)
    };
  }

  /**
   * Handle build name change and update state
   * @param  {SyntheticEvent} event React Event
   */
  _buildNameChange(event) {
    let stateChanges = {
      buildName: event.target.value
    };

    if (Persist.hasBuild(this.state.shipId, stateChanges.buildName)) {
      stateChanges.savedCode = Persist.getBuild(this.state.shipId, stateChanges.buildName);
    } else {
      stateChanges.savedCode = null;
    }

    this.setState(stateChanges);
  }

  /**
   * Save the current build
   */
  _saveBuild() {
    let code = this.state.ship.toString();
    Persist.saveBuild(this.state.shipId, this.state.buildName, code);
    this.setState({ code, savedCode: code });
  }

  /**
   * Reload build from last save
   */
  _reloadBuild() {
    this.state.ship.buildFrom(this.state.savedCode);
    this._shipUpdated();
  }

  /**
   * Reset build to Stock/Factory defaults
   */
  _resetBuild() {
    this.state.ship.buildWith(Ships[this.state.shipId].defaults);
    this._shipUpdated();
  }

  /**
   * Delete the build
   */
  _deleteBuild() {
    Persist.deleteBuild(this.state.shipId, this.state.buildName);
    Router.go(`/outfit/${this.state.shipId}`);
  }

  /**
   * Serialized and show the export modal
   */
  _exportBuild() {
    let translate = this.context.language.translate;
    let { buildName, ship } = this.state;
    this.context.showModal(<ModalExport
      title={buildName + ' ' + translate('export')}
      description={translate('PHRASE_EXPORT_DESC')}
      data={toDetailedBuild(buildName, ship, ship.toString())}
    />);
  }

  /**
   * Trigger render on ship model change
   */
  _shipUpdated() {
    let { shipId, buildName, ship, fuelCapacity } = this.state;
    let code = ship.toString();

    if (fuelCapacity != ship.fuelCapacity) {
      this._fuelChange(this.state.fuelLevel);
    }

    this._updateRoute(shipId, code, buildName);
    this.setState({ code });
  }

  /**
   * Update the current route based on build
   * @param  {string} shipId    Ship Id
   * @param  {string} code      Serialized ship 'code'
   * @param  {string} buildName Current build name
   */
  _updateRoute(shipId, code, buildName) {
    let qStr = '';

    if (buildName) {
      qStr = '?bn=' + encodeURIComponent(buildName);
    }

    Router.replace(`/outfit/${shipId}/${code}${qStr}`);
  }

  /**
   * Update current fuel level
   * @param  {number} fuelLevel Fuel leval 0 - 1
   */
  _fuelChange(fuelLevel) {
    let ship = this.state.ship;
    let fuelCapacity = ship.fuelCapacity;
    let fuel = fuelCapacity * fuelLevel;
    this.setState({
      fuelLevel,
      fuelCapacity,
      jumpRangeChartFunc: ship.getJumpRangeWith.bind(ship, fuel),
      totalRangeChartFunc: ship.getFastestRangeWith.bind(ship, fuel),
      speedChartFunc: ship.getSpeedsWith.bind(ship, fuel)
    });
  }

  /**
   * Update dimenions from rendered DOM
   */
  _updateDimensions() {
    this.setState({
      chartWidth: findDOMNode(this.refs.chartThird).offsetWidth
    });
  }

  /**
   * Update state based on context changes
   * @param  {Object} nextProps   Incoming/Next properties
   * @param  {Object} nextContext Incoming/Next conext
   */
  componentWillReceiveProps(nextProps, nextContext) {
    if (this.context.route !== nextContext.route) {  // Only reinit state if the route has changed
      this.setState(this._initState(nextContext));
    }
  }

  /**
   * Add listeners when about to mount
   */
  componentWillMount() {
    this.resizeListener = this.context.onWindowResize(this._updateDimensions);
  }

  /**
   * Trigger DOM updates on mount
   */
  componentDidMount() {
    this._updateDimensions();
  }

  /**
   * Remove listeners on unmount
   */
  componentWillUnmount() {
    this.resizeListener.remove();
  }

  /**
   * Render the Page
   * @return {React.Component} The page contents
   */
  render() {
    let { translate, units, formats, termtip } = this.context.language;
    let tip = this.context.termtip;
    let hide = this.context.tooltip.bind(null, null);
    let state = this.state;
    let { ship, code, savedCode, buildName, chartWidth, fuelCapacity, fuelLevel } = state;
    let menu = this.props.currentMenu;
    let shipUpdated = this._shipUpdated;
    let hStr = ship.getHardpointsString();
    let sStr = ship.getStandardString();
    let iStr = ship.getInternalString();

    return (
      <div id='outfit' className={'page'} style={{ fontSize: (this.context.sizeRatio * 0.9) + 'em' }}>
        <div id='overview'>
          <h1>{ship.name}</h1>
          <div id='build'>
            <input value={buildName} onChange={this._buildNameChange} placeholder={translate('Enter Name')} maxsize={50} />
            <button onClick={this._saveBuild} disabled={!buildName || savedCode && code == savedCode} onMouseOver={tip.bind(null, 'save')} onMouseOut={hide}>
              <FloppyDisk className='lg' />
            </button>
            <button onClick={this._reloadBuild} disabled={!savedCode || code == savedCode} onMouseOver={tip.bind(null, 'reload')} onMouseOut={hide}>
              <Reload className='lg'/>
            </button>
            <button className={'danger'} onClick={this._deleteBuild} disabled={!savedCode} onMouseOver={tip.bind(null, 'delete')} onMouseOut={hide}>
              <Bin className='lg'/>
            </button>
            <button onClick={this._resetBuild} disabled={!code} onMouseOver={tip.bind(null, 'reset')} onMouseOut={hide}>
              <Switch className='lg'/>
            </button>
            <button onClick={this._exportBuild} disabled={!buildName} onMouseOver={tip.bind(null, 'export')} onMouseOut={hide}>
              <Download className='lg'/>
            </button>
          </div>
        </div>

        <ShipSummaryTable ship={ship} code={code} />
        <StandardSlotSection ship={ship} code={sStr} onChange={shipUpdated} currentMenu={menu} />
        <InternalSlotSection ship={ship} code={iStr} onChange={shipUpdated} currentMenu={menu} />
        <HardpointsSlotSection ship={ship} code={hStr} onChange={shipUpdated} currentMenu={menu} />
        <UtilitySlotSection ship={ship} code={hStr} onChange={shipUpdated} currentMenu={menu} />
        <PowerManagement ship={ship} code={code} onChange={shipUpdated} />
        <CostSection ship={ship} buildName={buildName} code={sStr + hStr + iStr} />

        <div ref='chartThird' className='group third'>
          <h1>{translate('jump range')}</h1>
          <LineChart
            width={chartWidth}
            xMax={ship.cargoCapacity}
            yMax={ship.unladenRange}
            xUnit={translate('T')}
            yUnit={translate('LY')}
            yLabel={translate('jump range')}
            xLabel={translate('cargo')}
            func={state.jumpRangeChartFunc}
          />
        </div>

        <div className='group third'>
          <h1>{translate('total range')}</h1>
          <LineChart
            width={chartWidth}
            xMax={ship.cargoCapacity}
            yMax={ship.unladenTotalRange}
            xUnit={translate('T')}
            yUnit={translate('LY')}
            yLabel={translate('total range')}
            xLabel={translate('cargo')}
            func={state.totalRangeChartFunc}
          />
        </div>

        <div className='group third'>
          <h1>{translate('speed')}</h1>
          <LineChart
            width={chartWidth}
            xMax={ship.cargoCapacity}
            yMax={ship.topBoost + 10}
            xUnit={translate('T')}
            yUnit={translate('m/s')}
            yLabel={translate('speed')}
            series={SPEED_SERIES}
            colors={SPEED_COLORS}
            xLabel={translate('cargo')}
            func={state.speedChartFunc}
          />
        </div>

        <div className='group half'>
          <table style={{ width: '100%', lineHeight: '1em' }}>
            <tbody >
              <tr>
                <td style={{ verticalAlign: 'top', padding:0 }}><Fuel className='xl primary-disabled' /></td>
                <td><Slider axis={true} onChange={this._fuelChange} axisUnit={translate('T')} percent={fuelLevel} max={fuelCapacity} /></td>
                <td className='primary' style={{ width: '10em', verticalAlign: 'top', fontSize: '0.9em' }}>{formats.f2(fuelLevel * fuelCapacity)}{units.T} {formats.pct1(fuelLevel)}</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    );
  }
}
