import React from 'react';
import TranslatedComponent from './TranslatedComponent';
import { Ships } from 'coriolis-data/dist';
import Slider from '../components/Slider';

/**
 * Fuel slider
 * Requires an onChange() function of the form onChange(fuel), providing the fuel in tonnes, which is triggered on fuel level change
 */
export default class Fuel extends TranslatedComponent {
  static PropTypes = {
    ship: React.PropTypes.object.isRequired,
    onChange: React.PropTypes.func.isRequired
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
      fuelCapacity: ship.fuelCapacity,
      fuelLevel: 1,
    };
  }

  /**
   * Update the state if our ship changes
   * @param  {Object} nextProps   Incoming/Next properties
   * @return {boolean}            Returns true if the component should be rerendered
   */
  componentWillReceiveProps(nextProps) {
    const { fuelLevel, fuelCapacity } = this.state;
    const nextFuelCapacity = nextProps.ship.fuelCapacity;

    if (nextFuelCapacity != fuelCapacity) {
      // We keep the absolute fuel amount the same if possible so recalculate the relative level
      const nextFuelLevel = Math.min((fuelLevel * fuelCapacity) / nextFuelCapacity, 1);

      this.setState({ fuelLevel: nextFuelLevel, fuelCapacity: nextFuelCapacity });

      // Notify if appropriate
      if (nextFuelLevel * nextFuelCapacity != fuelLevel * fuelCapacity) {
        this.props.onChange(nextFuelLevel * nextFuelCapacity);
      }
    }
    return true;
  }

  /**
   * Update fuel level
   * @param  {number} fuelLevel percentage level from 0 to 1
   */
  _fuelChange(fuelLevel) {
    this.setState({ fuelLevel });
    this.props.onChange(fuelLevel * this.state.fuelCapacity);
  }

  /**
   * Render fuel slider
   * @return {React.Component} contents
   */
  render() {
    const { language, onWindowResize, sizeRatio, tooltip, termtip } = this.context;
    const { formats, translate, units } = language;
    const { fuelLevel, fuelCapacity } = this.state;

    return (
      <span>
        <h3>{translate('fuel carried')}: {formats.f2(fuelLevel * fuelCapacity)}{units.T}</h3>
        <table style={{ width: '100%', lineHeight: '1em', backgroundColor: 'transparent' }}>
          <tbody >
            <tr>
              <td>
                <Slider
                  axis={true}
                  onChange={this._fuelChange.bind(this)}
                  axisUnit={translate('T')}
                  percent={fuelLevel}
                  max={fuelCapacity}
                  scale={sizeRatio}
                  onResize={onWindowResize}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </span>
    );
  }
}
