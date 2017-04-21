import TranslatedComponent from './TranslatedComponent';
import React, { PropTypes } from 'react';
import Measure from 'react-measure';
import { BarChart, Bar, XAxis, YAxis } from 'recharts';

const CORIOLIS_COLOURS = ['#FF8C0D', '#1FB0FF', '#71A052', '#D5D54D'];
const LABEL_COLOUR = '#000000';
const AXIS_COLOUR = '#C06400';

const ASPECT = 1;

const merge = function(one, two) {
  return Object.assign({}, one, two);
};

/**
 * A vertical bar chart
 */
export default class VerticalBarChart extends TranslatedComponent {

  static propTypes = {
    data : PropTypes.array.isRequired,
    yMax : PropTypes.number
  };

  /**
   * Constructor
   * @param  {Object} props   React Component properties
   * @param  {Object} context React Component context
   */
  constructor(props, context) {
    super(props);

    this._termtip = this._termtip.bind(this);

    this.state = {
      dimensions: {
        width: 300,
        height: 300
      }
    };
  }

  /**
   * Render the bar chart
   * @returns {Object} the markup
   */
  render() {
    const { width, height } = this.state.dimensions;
    const { tooltip, termtip } = this.context;

    // Calculate maximum for Y
    let dataMax = Math.max(...this.props.data.map(d => d.value));
    if (dataMax == -Infinity) dataMax = 0;
    let yMax = this.props.yMax ? Math.round(this.props.yMax) : 0;
    const localMax = Math.max(dataMax, yMax);

    return (
      <Measure whitelist={['width', 'top']} onMeasure={ (dimensions) => this.setState({ dimensions }) }>
        <div width='100%'>
          <BarChart width={width} height={width * ASPECT} data={this.props.data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <XAxis interval={0} fontSize='0.8em' stroke={AXIS_COLOUR} dataKey='label' />
            <YAxis interval={'preserveStart'} tickCount={11} fontSize='0.8em' stroke={AXIS_COLOUR} type='number' domain={[0, localMax]}/>
            <Bar dataKey='value' label={<ValueLabel />} fill={CORIOLIS_COLOURS[0]} isAnimationActive={false} onMouseOver={this._termtip} onMouseOut={tooltip.bind(null, null)}/>
          </BarChart>
        </div>
      </Measure>
    );
  }

  /**
   * Generate a term tip
   * @param {Object} d the data
   * @param {number} i the index
   * @param {Object} e the event
   * @returns {Object} termtip markup
   */
  _termtip(d, i, e) {
    if (this.props.data[i].tooltip) {
      return this.context.termtip(this.props.data[i].tooltip, e);
    } else {
      return null;
    }
  }
}

/**
 * A label that displays the value within the bar of the chart
 */
class ValueLabel extends React.Component {
  static propTypes = {
    x: PropTypes.number,
    y: PropTypes.number,
    payload: PropTypes.object,
    value: PropTypes.number
  };

  render() {
    const { x, y, payload, value } = this.props;

    const em = value < 1000 ? '1em' : value < 1000 ? '0.8em' : '0.7em';

    return (
      <text x={x} y={y} fill="#000000" textAnchor="middle" dy={20} style={{ fontSize: em }}>{value}</text>
    );
  }
};
