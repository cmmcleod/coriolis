import React from 'react';
import PropTypes from 'prop-types';
import TranslatedComponent from './TranslatedComponent';
import Slider from '../components/Slider';

/**
 * Cargo slider
 * Requires an onChange() function of the form onChange(cargo), providing the cargo in tonnes, which is triggered on cargo level change
 */
export default class Cargo extends TranslatedComponent {
  static propTypes = {
    cargo: PropTypes.number.isRequired,
    cargoCapacity: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired
  };

  /**
   * Constructor
   * @param  {Object} props   React Component properties
   * @param  {Object} context   React Component context
   */
  constructor(props, context) {
    super(props);

    this._cargoChange = this._cargoChange.bind(this);
  }

  /**
   * Update cargo level
   * @param  {number} cargoLevel percentage level from 0 to 1
   */
  _cargoChange(cargoLevel) {
    const { cargo, cargoCapacity } = this.props;
    if (cargoCapacity > 0) {
      // We round the cargo to whole number of tonnes
      const newCargo =  Math.round(cargoLevel * cargoCapacity);
      if (newCargo != cargo) {
        this.props.onChange(newCargo);
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
    const { cargo, cargoCapacity } = this.props;

    return (
      <span>
        <h3>{translate('cargo carried')}: {formats.int(cargo)}{units.T}</h3>
        <table style={{ width: '100%', lineHeight: '1em', backgroundColor: 'transparent' }}>
          <tbody >
            <tr>
              <td>
                <Slider
                  axis={true}
                  onChange={this._cargoChange}
                  axisUnit={translate('T')}
                  percent={cargo / cargoCapacity}
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
