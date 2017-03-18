import React, { Component } from 'react';
import Measure from 'react-measure';
import * as d3 from 'd3';
import TranslatedComponent from './TranslatedComponent';

const CORIOLIS_COLOURS = ['#FF8C0D', '#1FB0FF', '#519032', '#D5420D'];
const LABEL_COLOUR = '#FFFFFF';

const margin = { top: 10, right: 0, bottom: 0, left: 55 };

const ASPECT = 1;

const merge = function(one, two) {
  return Object.assign({}, one, two);
};

/**
 * A vertical bar chart
 */
export default class VerticalBarChart extends TranslatedComponent {

  static propTypes = {
    data : React.PropTypes.array.isRequired,
    yMax : React.PropTypes.number
  };

  /**
   * Constructor
   * @param  {Object} props   React Component properties
   * @param  {Object} context React Component context
   */
  constructor(props, context) {
    super(props);

    this.state = {
      dimensions: {
        width: 300,
        height: 300
      }
    };
  }

  /**
   * Render the graph
   * @param  {Object} props   React Component properties
   */
  _renderGraph(props) {
    let { width, height } = this.state.dimensions;
    const { tooltip, termtip } = this.context;

    width = width - margin.left - margin.right,
    height = width * ASPECT - margin.top - margin.bottom;

    // X axis is a band scale with values being 'label'
    this.x = d3.scaleBand();
    this.x.domain(this.props.data.map(d => d.label)).padding(0.2);
    this.xAxis = d3.axisBottom(this.x).tickValues(this.props.data.map(d => d.label));
    this.x.range([0, width]);

    // Y axis is a numeric scale with values being 'value'
    this.y = d3.scaleLinear();
    if (props.yMax) {
      // Fixed maximum value (unless we go off the scale)
      const localMax = d3.max(this.props.data, d => d.value);
      this.y.domain([0, localMax > props.yMax ? localMax : props.yMax]);
    } else {
      this.y.domain([0, d3.max(this.props.data, d => d.value)]);
    }
    this.yAxis = d3.axisLeft(this.y);
    this.y.range([height, 0]);

    let svg = d3.select(this.svg).select('g');

    svg.selectAll('rect').remove();
    svg.selectAll('text').remove();
      
    svg.select('.x.axis').remove();
    svg.select('.y.axis').remove();
    
    svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(0, ${height})`)
      .call(this.xAxis);

    svg.append('g')
      .attr('class', 'y axis')
      .call(this.yAxis)
      .attr('fill', CORIOLIS_COLOURS[0]);

    svg.selectAll('rect.bar')
      .data(props.data)
      .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', d => this.x(d.label))
        .attr('width', this.x.bandwidth())
        .attr('y', d => this.y(d.value))
        .attr('height', d => height - this.y(d.value))
        .attr('fill', CORIOLIS_COLOURS[0]);

    svg.selectAll('text.bar')
      .data(props.data)
      .enter().append('text')
        .attr('class', 'bar')
        .attr('text-anchor', 'middle')
        .attr('x', 100)
        .attr('y', 100)
        .attr('stroke-width', '0px')
        .attr('fill', '#ffffff')
        .attr('x', d => this.x(d.label) + this.x.bandwidth() / 2)
        .attr('y', d => this.y(d.value) + 15)
        .text(d => d.value);
  }

  /**
   * Render the component
   * @returns {object} Markup
   */
  render() {
    const { width } = this.state.dimensions;
    const translate = `translate(${margin.left}, ${margin.top})`;

    const height = width * ASPECT;

    this._renderGraph(this.props);

    return (
      <Measure width='100%' whitelist={['width', 'top']} onMeasure={ (dimensions) => { this.setState({ dimensions }); }}>
        <div width={width} height={height}>
          { this.x ? 
          <svg ref={ref => this.svg = ref} width={width} height={height}>
            <g transform={translate}></g>
          </svg> : null }
        </div>
      </Measure>
    );
  }
}
