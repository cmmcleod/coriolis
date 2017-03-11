import React from 'react';
import TranslatedComponent from './TranslatedComponent';
import { Ships } from 'coriolis-data/dist';
import Slider from './Slider';
import Pips from './Pips';
import Fuel from './Fuel';
import Cargo from './Cargo';
import Movement from './Movement';
import EngagementRange from './EngagementRange';
import ShipPicker from './ShipPicker';

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
    const opponent = BattleCentre.DEFAULT_OPPONENT;

    this._cargoUpdated = this._cargoUpdated.bind(this);
    this._fuelUpdated = this._fuelUpdated.bind(this);
    this._pipsUpdated = this._pipsUpdated.bind(this);
    this._engagementRangeUpdated = this._engagementRangeUpdated.bind(this);
    this._targetShipUpdated = this._targetShipUpdated.bind(this);

    this.state = { 
      // Pips
      sys: 2,
      eng: 2,
      wep: 2,
      fuel: ship.fuelCapacity,
      cargo: ship.cargoCapacity,
      engagementRange: 1500,
      targetShip: Ships['anaconda']
    };
  }

  componentWillReceiveProps(nextProps) {
    // Rather than try to keep track of what changes our children require we force an update and let them work it out
    this.forceUpdate();
    return true;
  }

  /**
   * Triggered when pips have been updated
   */
  _pipsUpdated(sys, eng, wep) {
    this.setState({ sys, eng, wep });
  }

  /**
   * Triggered when fuel has been updated
   */
  _fuelUpdated(fuel) {
    this.setState({ fuel });
  }

  /**
   * Triggered when cargo has been updated
   */
  _cargoUpdated(cargo) {
    this.setState({ cargo });
  }

  /**
   * Triggered when engagement range has been updated
   */
  _engagementRangeUpdated(engagementRange) {
    this.setState({ engagementRange });
  }

  /**
   * Triggered when target ship has been updated
   */
  _targetShipUpdated(targetShip, targetBuild) {
    this.setState({ targetShip, targetBuild: targetBuild });
  }

  /**
   * Render
   * @return {React.Component} contents
   */
  render() {
    const { language, onWindowResize, sizeRatio, tooltip, termtip } = this.context;
    const { formats, translate, units } = language;
    const { sys, eng, wep, cargo, fuel, engagementRange } = this.state;
    const { ship } = this.props;

    return (
      <span>
        <h1>{translate('battle centre')}</h1>
        <ShipPicker onChange={this._targetShipUpdated}/>
        <div className='group third'>
          <Pips ship={ship} onChange={this._pipsUpdated}/>
        </div>
        <div className='group twothirds'>
          <Fuel ship={ship} onChange={this._fuelUpdated}/>
          <Cargo ship={ship} onChange={this._cargoUpdated}/>
          <EngagementRange ship={ship} onChange={this._engagementRangeUpdated}/>
        </div>
        <div className='group third'>
          <Movement ship={ship} eng={eng} cargo={cargo} fuel={fuel}/>
        </div>
      </span>
    );
  }
}
