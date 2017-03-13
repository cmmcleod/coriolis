import React, { Component } from 'react';
import Measure from 'react-measure';
import * as d3 from 'd3';

const CORIOLIS_COLOURS = ['#FF8C0D', '#1FB0FF', '#519032', '#D5420D'];
const LABEL_COLOUR = '#FFFFFF';

/**
 * A pie chart
 */
export default class PieChart extends Component {

  /**
   * Constructor
   * @param  {Object} props   React Component properties
   * @param  {Object} context React Component context
   */
  constructor(props, context) {
    super(props);

    this.pie = d3.pie().value((d) => d.value);
    this.colors = CORIOLIS_COLOURS;
    this.arc = d3.arc();
    this.arc.innerRadius(0);

    this.state = {
      dimensions: {
        width: 100,
        height: 100
      }
    };
  }


  /**
   * Generate a slice of the pie chart
   * @param {Object} d     the data for this slice
   * @param {number} i     the index of this slice
   * @returns {Object}     the SVG for the slice
   */
  sliceGenerator(d, i) {
    const { width, height } = this.state.dimensions;
    const { data } = this.props;

    // Push the labels further out from the centre of the slice
    let [labelX, labelY] = this.arc.centroid(d);
    const labelTranslate = `translate(${labelX * 1.5}, ${labelY * 1.5})`;

    // Put the keys in a line with equal spacing
    const keyX = -width / 2 + (width / data.length) * (i + 0.5);
    const keyTranslate = `translate(${keyX}, ${width * 0.45})`;

    return (
      <g key={`group-${i}`}>
        <path key={`arc-${i}`} d={this.arc(d)} style={{ fill: this.colors[i] }} />
        <text key={`label-${i}`} transform={labelTranslate} stroke={LABEL_COLOUR} strokeWidth='1px' fill='None' textAnchor='middle'>{d.value}</text>
        <text key={`key-${i}`} transform={keyTranslate} style={{ stroke: this.colors[i], strokeWidth:'1px', fill:'None' }} textAnchor='middle'>{d.data.label}</text>
      </g>
    );
  }

  /**
   * Render the component
   * @returns {object} Markup
   */
  render() {
    const { width, height } = this.state.dimensions;
    const pie = this.pie(this.props.data),
        translate = `translate(${width / 2}, ${width * 0.4})`; 

    this.arc.outerRadius(width * 0.4);

    return (
      <Measure width='100%' whitelist={['width', 'top']} onMeasure={ (dimensions) => { this.setState({ dimensions }); }}>
        <div width={width} height={width}>
          <svg style={{ stroke: 'None' }} width={width} height={width * 0.9}>
            <g transform={translate}>
              {pie.map((d, i) => this.sliceGenerator(d, i))}
            </g>
          </svg>
        </div>
      </Measure>
    );
  }
}
