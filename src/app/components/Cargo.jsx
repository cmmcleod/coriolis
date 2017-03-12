import React from 'react';
import TranslatedComponent from './TranslatedComponent';
import { Ships } from 'coriolis-data/dist';
import Slider from '../components/Slider';

/**
 * Cargo slider
 * Requires an onChange() function of the form onChange(cargo), providing the cargo in tonnes, which is triggered on cargo level change
 */
export default class Cargo extends TranslatedComponent {
  static propTypes = {
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
      cargoCapacity: ship.cargoCapacity,
      cargoLevel: 0,
    };
  }

  /**
   * Update the state if our ship changes
   * @param  {Object} nextProps   Incoming/Next properties
   * @return {boolean}            Returns true if the component should be rerendered
   */
  componentWillReceiveProps(nextProps) {
    const { cargoLevel, cargoCapacity } = this.state;
    const nextCargoCapacity = nextProps.ship.cargoCapacity;

    if (nextCargoCapacity != cargoCapacity) {
      // We keep the absolute cargo amount the same if possible so recalculate the relative level
      const nextCargoLevel = Math.min((cargoLevel * cargoCapacity) / nextCargoCapacity, 1);

      this.setState({ cargoLevel: nextCargoLevel, cargoCapacity: nextCargoCapacity });

      // Notify if appropriate
      if (nextCargoLevel * nextCargoCapacity != cargoLevel * cargoCapacity) {
        this.props.onChange(Math.round(nextCargoLevel * nextCargoCapacity));
      }
    }
    return true;
  }

  /**
   * Update cargo level
   * @param  {number} cargoLevel percentage level from 0 to 1
   */
  _cargoChange(cargoLevel) {
    const { cargoCapacity } = this.state;
    if (cargoCapacity > 0) {
      // We round the cargo level to a suitable value given the capacity
      cargoLevel = Math.round(cargoLevel * cargoCapacity) / cargoCapacity;

      if (cargoLevel != this.state.cargoLevel) {
        this.setState({ cargoLevel });
        this.props.onChange(Math.round(cargoLevel * cargoCapacity));
      }
    }
  }

  /**
   * Render cargo slider
   * @return {React.Component} contents
   */
  render() {
    const { language, onWindowResize, sizeRatio, tooltip, termtip } = this.context;
    const { formats, translate, units } = language;
    const { cargoLevel, cargoCapacity } = this.state;

    return (
      <span>
        <h3>{translate('cargo carried')}: {formats.int(cargoLevel * cargoCapacity)}{units.T}</h3>
        <table style={{ width: '100%', lineHeight: '1em', backgroundColor: 'transparent' }}>
          <tbody >
            <tr>
              <td>
                <Slider
                  axis={true}
                  onChange={this._cargoChange.bind(this)}
                  axisUnit={translate('T')}
                  percent={cargoLevel}
                  max={cargoCapacity}
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
