import React from 'react';
import TranslatedComponent from './TranslatedComponent';
import { Ships } from 'coriolis-data/dist';
import Slider from '../components/Slider';

/**
 * Engagement range slider
 * Requires an onChange() function of the form onChange(range), providing the range in metres, which is triggered on range change
 */
export default class Range extends TranslatedComponent {
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

    const maxRange = this._calcMaxRange(ship);

    this.state = {
      maxRange: maxRange,
      rangeLevel: 1,
    };
  }

  /**
   * Update the state if our ship changes
   * @param  {Object} nextProps   Incoming/Next properties
   * @return {boolean}            Returns true if the component should be rerendered
   */
  componentWillReceiveProps(nextProps) {
    const { rangeLevel, maxRange } = this.state;
    const nextMaxRange = this._calcMaxRange(nextProps.ship);

    if (nextMaxRange != maxRange) {
      // We keep the absolute range amount the same if possible so recalculate the relative level
      const nextRangeLevel = Math.min((rangeLevel * maxRange) / nextMaxRange, 1);

      this.setState({ rangeLevel: nextRangeLevel, maxRange: nextMaxRange });

      // Notify if appropriate
      if (nextRangeLevel * nextMaxRange != rangeLevel * maxRange) {
        this.props.onChange(Math.round(nextRangeLevel * nextMaxRange));
      }
    }
    return true;
  }

  /**
   * Calculate the maximum range of a ship's weapons
   * @param   {Object}  ship     The ship
   * @returns {int}              The maximum range, in metres
   */
  _calcMaxRange(ship) {
    let maxRange = 1000;
    for (let i = 0; i < ship.hardpoints.length; i++) {
      if (ship.hardpoints[i].maxClass > 0 && ship.hardpoints[i].m && ship.hardpoints[i].enabled) {
        const thisRange = ship.hardpoints[i].m.getRange();
        if (thisRange > maxRange) {
          maxRange = thisRange;
        }
      }
    }

    return maxRange;
  }

  /**
   * Update range
   * @param  {number} range percentage level from 0 to 1
   */
  _rangeChange(rangeLevel) {
    const { maxRange } = this.state;
    // We round the range to an integer value
    rangeLevel = Math.round(rangeLevel * maxRange) / maxRange;

    if (rangeLevel != this.state.rangeLevel) {
      this.setState({ rangeLevel });
      this.props.onChange(Math.round(rangeLevel * maxRange));
    }
  }

  /**
   * Render range slider
   * @return {React.Component} contents
   */
  render() {
    const { language, onWindowResize, sizeRatio, tooltip, termtip } = this.context;
    const { formats, translate, units } = language;
    const { rangeLevel, maxRange } = this.state;

    return (
      <span>
        <h3>{translate('engagement range')}: {formats.int(rangeLevel * maxRange)}{translate('m')}</h3>
        <table style={{ width: '100%', lineHeight: '1em', backgroundColor: 'transparent' }}>
          <tbody >
            <tr>
              <td>
                <Slider
                  axis={true}
                  onChange={this._rangeChange.bind(this)}
                  axisUnit={translate('m')}
                  percent={rangeLevel}
                  max={maxRange}
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
