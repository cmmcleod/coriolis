import React from 'react';
import TranslatedComponent from './TranslatedComponent';
import Ship from '../shipyard/Ship';
import { Ships } from 'coriolis-data/dist';
import Slider from './Slider';
import Pips from './Pips';
import Fuel from './Fuel';
import Cargo from './Cargo';
import Movement from './Movement';
import EngagementRange from './EngagementRange';
import ShipPicker from './ShipPicker';
import Shields from './Shields';

/**
 * Battle centre allows you to pit your current build against another ship,
 * adjust pips and engagement range, and see a wide variety of information
 */
export default class BattleCentre extends TranslatedComponent {
  static propTypes = {
    ship: React.PropTypes.object.isRequired
  };

  /**
   * Constructor
   * @param  {Object} props   React Component properties
   * @param  {Object} context   React Component context
   */
  constructor(props, context) {
    super(props);

    const { ship } = this.props;

    this._cargoUpdated = this._cargoUpdated.bind(this);
    this._fuelUpdated = this._fuelUpdated.bind(this);
    this._pipsUpdated = this._pipsUpdated.bind(this);
    this._engagementRangeUpdated = this._engagementRangeUpdated.bind(this);
    this._opponentUpdated = this._opponentUpdated.bind(this);

    this.state = { 
      sys: 2,
      eng: 2,
      wep: 2,
      fuel: ship.fuelCapacity,
      cargo: ship.cargoCapacity,
      boost: false,
      engagementRange: 1500,
      opponent: new Ship('anaconda', Ships['anaconda'].properties, Ships['anaconda'].slots)
    };
  }

  /**
   * Update state based on property and context changes
   * @param  {Object} nextProps   Incoming/Next properties
   * @returns {boolean} true if an update is required
   */
  componentWillReceiveProps(nextProps) {
    // Rather than try to keep track of what changes our children require we force an update and let them work it out
    this.forceUpdate();
    return true;
  }

  /**
   * Triggered when pips have been updated
   * @param {number} sys    SYS pips
   * @param {number} eng    ENG pips
   * @param {number} wep    WEP pips
   * @param {boolean} boost true if boosting
   */
  _pipsUpdated(sys, eng, wep, boost) {
    this.setState({ sys, eng, wep, boost });
  }

  /**
   * Triggered when fuel has been updated
   * @param {number} fuel the amount of fuel, in T
   */
  _fuelUpdated(fuel) {
    this.setState({ fuel });
  }

  /**
   * Triggered when cargo has been updated
   * @param {number} cargo the amount of cargo, in T
   */
  _cargoUpdated(cargo) {
    this.setState({ cargo });
  }

  /**
   * Triggered when engagement range has been updated
   * @param {number} engagementRange the engagement range, in m
   */
  _engagementRangeUpdated(engagementRange) {
    this.setState({ engagementRange });
  }

  /**
   * Triggered when target ship has been updated
   * @param {object} opponent the opponent's ship
   * @param {string} opponentBuild the name of the opponent's build
   */
  _opponentUpdated(opponent, opponentBuild) {
    this.setState({ opponent, opponentBuild });
  }

  /**
   * Render
   * @return {React.Component} contents
   */
  render() {
    const { language, onWindowResize, sizeRatio, tooltip, termtip } = this.context;
    const { formats, translate, units } = language;
    const { sys, eng, wep, cargo, fuel, boost, engagementRange, opponent } = this.state;
    const { ship } = this.props;

    // Markers are used to propagate state changes
    const movementMarker = '' + ship.topSpeed + ':' + ship.pitch + ':' + ship.roll + ':' + ship.yaw;
    const shieldMarker = '' + ship.shield + ':' + ship.cells + ':' + ship.shieldExplRes + ':' + ship.shieldKinRes + ':' + ship.shieldThermRes;

    return (
      <span>
        <h1>{translate('battle centre')}</h1>
        <ShipPicker onChange={this._opponentUpdated}/>
        <div className='group third'>
          <Pips ship={ship} onChange={this._pipsUpdated}/>
        </div>
        <div className='group twothirds'>
          <Fuel ship={ship} onChange={this._fuelUpdated}/>
          <Cargo ship={ship} onChange={this._cargoUpdated}/>
          <EngagementRange ship={ship} onChange={this._engagementRangeUpdated}/>
        </div>
        <div className='group third'>
          <Shields marker={shieldMarker} ship={ship} opponent={opponent} sys={sys}/>
        </div>
        <div className='group third'>
          <Movement marker={movementMarker} ship={ship} boost={boost} eng={eng} cargo={cargo} fuel={fuel}/>
        </div>
      </span>
    );
  }
}
