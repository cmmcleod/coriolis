import React from 'react';
import TranslatedComponent from './TranslatedComponent';
import { Ships } from 'coriolis-data/dist';
import ShipSelector from './ShipSelector';
import { nameComparator } from '../utils/SlotFunctions';
import LineChart from '../components/LineChart';
import Slider from '../components/Slider';
import * as ModuleUtils from '../shipyard/ModuleUtils';
import Module from '../shipyard/Module';
import * as Calc from '../shipyard/Calculations';

/**
 * FSD profile for a given ship
 */
export default class FSDProfile extends TranslatedComponent {
  static PropTypes = {
    ship: React.PropTypes.object.isRequired,
    chartWidth: React.PropTypes.number.isRequired,
    code: React.PropTypes.string.isRequired
  };

  /**
   * Constructor
   * @param  {Object} props   React Component properties
   * @param  {Object} context   React Component context
   */
  constructor(props, context) {
    super(props);

    const ship = this.props.ship;

    this.state = {
      cargo: ship.cargoCapacity,
      calcMaxRangeFunc: this._calcMaxRange.bind(this, ship)
    };
  }

  /**
   * Update the state if our ship changes
   * @param  {Object} nextProps   Incoming/Next properties
   * @param  {Object} nextContext Incoming/Next conext
   * @return {boolean}            Returns true if the component should be rerendered
   */
  componentWillReceiveProps(nextProps, nextContext) {
    if (nextProps.code != this.props.code) {
      this.setState({ cargo: nextProps.ship.cargoCapacity, calcMaxRangeFunc: this._calcMaxRange.bind(this, nextProps.ship) });
    }
    return true;
  }

  /**
   * Calculate the maximum range for this ship across its applicable mass
   * @param  {Object}  ship          The ship
   * @param  {Object}  mass          The mass at which to calculate the maximum range
   * @return {number}                The maximum range
   */
  _calcMaxRange(ship, mass) {
    // Obtain the FSD for this ship
    const fsd = ship.standard[2].m;

    // Obtain the maximum range
    return Calc.jumpRange(mass, fsd, fsd.getMaxFuelPerJump());
  }

  /**
   * Update cargo level
   * @param  {number} cargoLevel Cargo level 0 - 1
   */
  _cargoChange(cargoLevel) {
    let ship = this.props.ship;
    let cargo = Math.round(ship.cargoCapacity * cargoLevel);
    this.setState({
      cargo
    });
  }

  /**
   * Render engine profile
   * @return {React.Component} contents
   */
  render() {
    const { language, onWindowResize, sizeRatio, tooltip, termtip } = this.context;
    const { formats, translate, units } = language;
    const { ship } = this.props;
    const { cargo } = this.state;

    
    // Calculate bounds for our line chart - use thruster info for X
    const thrusters = ship.standard[1].m;
    const fsd = ship.standard[2].m;
    const minMass = ship.calcLowestPossibleMass({th: thrusters});
    const maxMass = thrusters.getMaxMass();
    let mass = ship.unladenMass + ship.fuelCapacity + cargo;
    const minRange = Calc.jumpRange(maxMass, fsd, ship.fuelCapacity);
    const maxRange = Calc.jumpRange(minMass + fsd.getMaxFuelPerJump(), fsd, fsd.getMaxFuelPerJump());
    // Add a mark at our current mass
    const mark = Math.min(mass, maxMass);

    const cargoPercent = cargo / ship.cargoCapacity;

    const code = ship.name + ship.toString() + '.' + ship.getModificationsString() + '.' + ship.getPowerEnabledString();

    return (
      <span>
        <h1>{translate('fsd profile')}</h1>
        <LineChart
          width={this.props.chartWidth}
          xMin={minMass}
          xMax={maxMass}
          yMin={minRange}
          yMax={maxRange}
          xMark={mark}
          xLabel={translate('mass')}
          xUnit={translate('T')}
          yLabel={translate('maximum range')}
          yUnit={translate('LY')}
          func={this.state.calcMaxRangeFunc}
          points={200}
          code={code}
        />
        {ship.cargoCapacity ? 
        <span>
          <h3>{translate('cargo carried')}: {formats.int(cargo)}{units.T}</h3>
          <table style={{ width: '100%', lineHeight: '1em', backgroundColor: 'transparent' }}>
            <tbody >
              <tr>
                <td>
                  <Slider
                    axis={true}
                    onChange={this._cargoChange.bind(this)}
                    axisUnit={translate('T')}
                    percent={cargoPercent}
                    max={ship.cargoCapacity}
                    scale={sizeRatio}
                    onResize={onWindowResize}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </span> : '' }
      </span>
    );
  }
}
