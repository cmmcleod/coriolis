import React from 'react';
import TranslatedComponent from './TranslatedComponent';
import { Ships } from 'coriolis-data/dist';
import Slider from '../components/Slider';
import Pips from '../components/Pips';
import Fuel from '../components/Fuel';
import Cargo from '../components/Cargo';
import EngagementRange from '../components/EngagementRange';

/**
 * Battle centre allows you to pit your current build against another ship,
 * adjust pips and engagement range, and see a wide variety of information
 */
export default class BattleCentre extends TranslatedComponent {
  static PropTypes = {
    ship: React.PropTypes.object.isRequired
  };

  static DEFAULT_OPPONENT = { ship: Ships['anaconda'] };

  /**
   * Constructor
   * @param  {Object} props   React Component properties
   * @param  {Object} context   React Component context
   */
  constructor(props, context) {
    super(props);

    const { ship } = this.props;
    const opponent = BattleCentre.DEFAULT_OPPONENT;

    this.state = { };
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
    console.log('Pips are now ' + sys + '/' + eng + '/' + wep);
  }

  /**
   * Triggered when fuel has been updated
   */
  _fuelUpdated(fuel) {
    console.log('Fuel is now ' + fuel);
  }

  /**
   * Triggered when cargo has been updated
   */
  _cargoUpdated(cargo) {
    console.log('Cargo is now ' + cargo);
  }

  /**
   * Triggered when engagement range has been updated
   */
  _engagementRangeUpdated(engagementRange) {
    console.log('Engagement range is now ' + engagementRange);
  }

  /**
   * Render
   * @return {React.Component} contents
   */
  render() {
    const { language, onWindowResize, sizeRatio, tooltip, termtip } = this.context;
    const { formats, translate, units } = language;
    const { against, expanded, maxRange, range, totals } = this.state;
    const { ship } = this.props;
    const shipUpdated = this._shipUpdated;
    const pipsUpdated = this._pipsUpdated;
    const fuelUpdated = this._fuelUpdated;
    const cargoUpdated = this._cargoUpdated;
    const engagementRangeUpdated = this._engagementRangeUpdated;

    return (
      <span>
        <h1>{translate('battle centre')}</h1>
        <div className='group third'>
          <Pips ship={ship} onChange={pipsUpdated}/>
        </div>
        <div className='group twothirds'>
          <Fuel ship={ship} onChange={fuelUpdated}/>
          <Cargo ship={ship} onChange={cargoUpdated}/>
          <EngagementRange ship={ship} onChange={engagementRangeUpdated}/>
        </div>
      </span>
    );
  }
}
