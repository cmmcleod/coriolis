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
 * Engine profile for a given ship
 */
export default class EngineProfile extends TranslatedComponent {
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
      calcMaxSpeedFunc: this._calcMaxSpeed.bind(this, ship)
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
      this.setState({ cargo: nextProps.ship.cargoCapacity, calcMaxSpeedFunc: this._calcMaxSpeed.bind(this, nextProps.ship) });
    }
    return true;
  }

  /**
   * Calculate the maximum speed for this ship across its applicable mass
   * @param  {Object}  ship          The ship
   * @param  {Object}  mass          The mass at which to calculate the top speed
   * @return {number}                The maximum speed
   */
  _calcMaxSpeed(ship, mass) {
    // Obtain the thrusters for this ship
    const thrusters = ship.standard[1].m;

    // Obtain the top speed
    return Calc.speed(mass, ship.speed, thrusters, ship.engpip)[4];
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

    // Calculate bounds for our line chart
    const thrusters = ship.standard[1].m;
    const minMass = ship.calcLowestPossibleMass({th: thrusters});
    const maxMass = thrusters.getMaxMass();
    let mass = ship.unladenMass + ship.fuelCapacity + cargo;
    const minSpeed = Calc.speed(maxMass, ship.speed, thrusters, ship.engpip)[4];
    const maxSpeed = Calc.speed(minMass, ship.speed, thrusters, ship.engpip)[4];
    // Add a mark at our current mass
    const mark = Math.min(mass, maxMass);

    const cargoPercent = cargo / ship.cargoCapacity;

    const code = ship.toString() + '.' + ship.getModificationsString() + '.' + ship.getPowerEnabledString();

    // This graph has a precipitous fall-off so we use lots of points to make it look a little smoother
    return (
      <span>
        <h1>{translate('engine profile')}</h1>
        <LineChart
          width={this.props.chartWidth}
          xMin={minMass}
          xMax={maxMass}
          yMin={minSpeed}
          yMax={maxSpeed}
          xMark={mark}
          xLabel={translate('mass')}
          xUnit={translate('T')}
          yLabel={translate('maximum speed')}
          yUnit={translate('m/s')}
          func={this.state.calcMaxSpeedFunc}
          points={1000}
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
