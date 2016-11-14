import React from 'react';
import { findDOMNode } from 'react-dom';
import { Ships } from 'coriolis-data/dist';
import cn from 'classnames';
import Page from './Page';
import Router from '../Router';
import Persist from '../stores/Persist';
import Ship from '../shipyard/Ship';
import { toDetailedBuild } from '../shipyard/Serializer';
import { outfitURL } from '../utils/UrlGenerators';
import { FloppyDisk, Bin, Switch, Download, Reload, Fuel } from '../components/SvgIcons';
import ShipSummaryTable from '../components/ShipSummaryTable';
import StandardSlotSection from '../components/StandardSlotSection';
import HardpointsSlotSection from '../components/HardpointsSlotSection';
import InternalSlotSection from '../components/InternalSlotSection';
import UtilitySlotSection from '../components/UtilitySlotSection';
import OffenceSummary from '../components/OffenceSummary';
import DefenceSummary from '../components/DefenceSummary';
import LineChart from '../components/LineChart';
import PowerManagement from '../components/PowerManagement';
import CostSection from '../components/CostSection';
import ModalExport from '../components/ModalExport';
import Slider from '../components/Slider';
import * as Utils from '../utils/UtilityFunctions';

const SPEED_SERIES = ['boost', '4 Pips', '2 Pips', '0 Pips'];
const SPEED_COLORS = ['#0088d2', '#ff8c0d', '#D26D00', '#c06400'];

/**
 * Document Title Generator
 * @param  {String} shipName  Ship Name
 * @param  {String} buildName Build Name
 * @return {String}           Document title
 */
function getTitle(shipName, buildName) {
  return `${shipName}${buildName ? ` - ${buildName}` : ''}`;
}

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
    let code = Utils.fromUrlSafe(params.code);
    let buildName = params.bn;
    let data = Ships[shipId];   // Retrieve the basic ship properties, slots and defaults
    let savedCode = Persist.getBuild(shipId, buildName);

    if (!data) {
      return { error: { message: 'Ship not found: ' + shipId } };
    }

    let ship = new Ship(shipId, data.properties, data.slots);          // Create a new Ship instance

    if (code) {
      ship.buildFrom(code);  // Populate modules from serialized 'code' URL param
    } else {
      ship.buildWith(data.defaults);  // Populate with default components
    }

    let fuelCapacity = ship.fuelCapacity;
    this._getTitle = getTitle.bind(this, data.properties.name);

    return {
      error: null,
      title: this._getTitle(buildName),
      costTab: Persist.getCostTab() || 'costs',
      buildName,
      newBuildName: buildName,
      shipId,
      ship,
      code,
      savedCode,
      fuelCapacity,
      fuelLevel: 1,
      jumpRangeChartFunc: ship.calcJumpRangeWith.bind(ship, fuelCapacity),
      fastestRangeChartFunc: ship.calcFastestRangeWith.bind(ship, fuelCapacity),
      speedChartFunc: ship.calcSpeedsWith.bind(ship, fuelCapacity)
    };
  }

  /**
   * Handle build name change and update state
   * @param  {SyntheticEvent} event React Event
   */
  _buildNameChange(event) {
    let stateChanges = {
      newBuildName: event.target.value
    };

    if (Persist.hasBuild(this.state.shipId, stateChanges.newBuildName)) {
      stateChanges.savedCode = Persist.getBuild(this.state.shipId, stateChanges.newBuildName);
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
    let { buildName, newBuildName, shipId } = this.state;

    if (buildName === newBuildName) {
      Persist.saveBuild(shipId, buildName, code);
      this._updateRoute(shipId, buildName, code);
    } else {
      Persist.saveBuild(shipId, newBuildName, code);
      this._updateRoute(shipId, newBuildName, code);
    }

    this.setState({ buildName: newBuildName, code, savedCode: code, title: this._getTitle(newBuildName) });
  }

  /**
   * Rename the current build
   */
  _renameBuild() {
    let { buildName, newBuildName, shipId, ship } = this.state;
    if (buildName != newBuildName && newBuildName.length) {
      let code = ship.toString();
      Persist.deleteBuild(shipId, buildName);
      Persist.saveBuild(shipId, newBuildName, code);
      this._updateRoute(shipId, newBuildName, code);
      this.setState({ buildName: newBuildName, code, savedCode: code });
    }
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
    Router.go(outfitURL(this.state.shipId));
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

    this._updateRoute(shipId, buildName, code);
    this.setState({ code });
  }

  /**
   * Update the current route based on build
   * @param  {string} shipId    Ship Id
   * @param  {string} buildName Current build name
   * @param  {string} code      Serialized ship 'code'
   */
  _updateRoute(shipId, buildName, code) {
    Router.replace(outfitURL(shipId, code, buildName));
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
      jumpRangeChartFunc: ship.calcJumpRangeWith.bind(ship, fuel),
      fastestRangeChartFunc: ship.calcFastestRangeWith.bind(ship, fuel),
      speedChartFunc: ship.calcSpeedsWith.bind(ship, fuel)
    });
  }

  /**
   * Update dimenions from rendered DOM
   */
  _updateDimensions() {
    let elem = findDOMNode(this.refs.chartThird);

    if (elem) {
      this.setState({
        chartWidth: findDOMNode(this.refs.chartThird).offsetWidth
      });
    }
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
  renderPage() {
    let state = this.state,
        { language, termtip, tooltip, sizeRatio, onWindowResize } = this.context,
        { translate, units, formats } = language,
        { ship, code, savedCode, buildName, newBuildName, chartWidth, fuelCapacity, fuelLevel } = state,
        hide = tooltip.bind(null, null),
        menu = this.props.currentMenu,
        shipUpdated = this._shipUpdated,
        canSave = (newBuildName || buildName) && code !== savedCode,
        canRename = buildName && newBuildName && buildName != newBuildName,
        canReload = savedCode && canSave,
        hStr = ship.getHardpointsString() + '.' + ship.getModificationsString(),
        sStr = ship.getStandardString() + '.' + ship.getModificationsString(),
        iStr = ship.getInternalString() + '.' + ship.getModificationsString();

    return (
      <div id='outfit' className={'page'} style={{ fontSize: (sizeRatio * 0.9) + 'em' }}>
        <div id='overview'>
          <h1>{ship.name}</h1>
          <div id='build'>
            <input value={newBuildName} onChange={this._buildNameChange} placeholder={translate('Enter Name')} maxLength={50} />
            <button onClick={canSave && this._saveBuild} disabled={!canSave} onMouseOver={termtip.bind(null, 'save')} onMouseOut={hide}>
              <FloppyDisk className='lg' />
            </button>
            <button onClick={canRename && this._renameBuild} disabled={!canRename} onMouseOver={termtip.bind(null, 'rename')} onMouseOut={hide}>
            <span style={{ textTransform: 'none', fontSize: '1.8em' }}>a|</span>
            </button>
            <button onClick={canReload && this._reloadBuild} disabled={!canReload} onMouseOver={termtip.bind(null, 'reload')} onMouseOut={hide}>
              <Reload className='lg'/>
            </button>
            <button className={'danger'} onClick={savedCode && this._deleteBuild} disabled={!savedCode} onMouseOver={termtip.bind(null, 'delete')} onMouseOut={hide}>
              <Bin className='lg'/>
            </button>
            <button onClick={code && this._resetBuild} disabled={!code} onMouseOver={termtip.bind(null, 'reset')} onMouseOut={hide}>
              <Switch className='lg'/>
            </button>
            <button onClick={buildName && this._exportBuild} disabled={!buildName} onMouseOver={termtip.bind(null, 'export')} onMouseOut={hide}>
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
          <OffenceSummary ship={ship} code={code}/>
        </div>

        <div className='group third'>
          <DefenceSummary ship={ship} code={code}/>
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
          <table style={{ width: '100%', lineHeight: '1em', backgroundColor: 'transparent' }}>
            <tbody >
              <tr>
                <td style={{ verticalAlign: 'top', padding: 0, width: '2.5em' }} onMouseEnter={termtip.bind(null, 'fuel level')} onMouseLeave={hide}>
                  <Fuel className='xl primary-disabled' />
                </td>
                <td>
                  <Slider
                    axis={true}
                    onChange={this._fuelChange}
                    axisUnit={translate('T')}
                    percent={fuelLevel}
                    max={fuelCapacity}
                    scale={sizeRatio}
                    onResize={onWindowResize}
                  />
                </td>
                <td className='primary' style={{ width: '10em', verticalAlign: 'top', fontSize: '0.9em', textAlign: 'left' }}>
                  {formats.f2(fuelLevel * fuelCapacity)}{units.T} {formats.pct1(fuelLevel)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    );
  }
}
//        <div ref='chartThird' className='group third'>
//          <h1>{translate('jump range')}</h1>
//          <LineChart
//            width={chartWidth}
//            xMax={ship.cargoCapacity}
//            yMax={ship.unladenRange}
//            xUnit={translate('T')}
//            yUnit={translate('LY')}
//            yLabel={translate('jump range')}
//            xLabel={translate('cargo')}
//            func={state.jumpRangeChartFunc}
//          />
//        </div>
