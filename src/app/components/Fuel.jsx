import React from 'react';
import TranslatedComponent from './TranslatedComponent';
import { Ships } from 'coriolis-data/dist';
import Slider from '../components/Slider';

/**
 * Fuel slider
 * Requires an onChange() function of the form onChange(fuel), providing the fuel in tonnes, which is triggered on fuel level change
 */
export default class Fuel extends TranslatedComponent {
  static propTypes = {
    fuel: React.PropTypes.number.isRequired,
    fuelCapacity: React.PropTypes.number.isRequired,
    onChange: React.PropTypes.func.isRequired
  };

  /**
   * Constructor
   * @param  {Object} props   React Component properties
   * @param  {Object} context   React Component context
   */
  constructor(props, context) {
    super(props);

    this._fuelChange = this._fuelChange.bind(this);
  }

  /**
   * Update fuel level
   * @param  {number} fuelLevel percentage level from 0 to 1
   */
  _fuelChange(fuelLevel) {
    const { fuel, fuelCapacity } = this.props;

    const newFuel = fuelLevel * fuelCapacity;
    // Only send an update if the fuel has changed significantly
    if (Math.round(fuel * 10) != Math.round(newFuel * 10)) {
      this.props.onChange(Math.round(newFuel * 10) / 10);
    }
  }

  /**
   * Render fuel slider
   * @return {React.Component} contents
   */
  render() {
    const { language, onWindowResize, sizeRatio, tooltip, termtip } = this.context;
    const { formats, translate, units } = language;
    const { fuel, fuelCapacity } = this.props;

    return (
      <span>
        <h3>{translate('fuel carried')}: {formats.f1(fuel)}{units.T}</h3>
        <table style={{ width: '100%', lineHeight: '1em', backgroundColor: 'transparent' }}>
          <tbody >
            <tr>
              <td>
                <Slider
                  axis={true}
                  onChange={this._fuelChange}
                  axisUnit={translate('T')}
                  percent={fuel / fuelCapacity}
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
