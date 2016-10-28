import React from 'react';
import { findDOMNode } from 'react-dom';
import Slider from './Slider';

const MARGIN_LR = 8; // Left/ Right margin

/**
 * Horizontal Slider for modifications
 */
export default class ModSlider extends Slider {

  /**
   * Constructor
   * @param  {Object} props   React Component properties
   */
  constructor(props) {
    super(props);
  }

  /**
   * Render the slider
   * @return {React.Component} The slider
   */
  render() {
    let outerWidth = this.state.outerWidth;
    let { axis, axisUnit, min, max, scale } = this.props;

    let style = {
      width: '100%',
      height: axis ? '2.5em' : '1.5em',
      boxSizing: 'border-box'
    };

    if (!outerWidth) {
      return <svg style={style} />;
    }

    let margin = MARGIN_LR * scale;
    let width = outerWidth - (margin * 2);
    let pctPos = width * this.props.percent + margin;

    // TODO add this back in from zero point to value
    // <rect className='primary-disabled' x={margin} y='0.45em' rx='0.15em' ry='0.15em' width={pctPos} height='0.3em' />
    // TODO fix locations for labels (min, 0, max)
    return <svg onMouseUp={this._up} onMouseEnter={this._enter.bind(this)} onMouseMove={this._move} onTouchEnd={this._up} style={style}>
      <rect className='primary' style={{ opacity: 0.3, fillOpacity: 0 }} x={margin} y='0.25em' rx='0.3em' ry='0.3em' width={width} height='0.7em' />
      <circle className='primary' r={margin} cy='0.6em' style={{ strokeWidth: 0, fillOpacity: 1 }} cx={pctPos} />
      <rect x={margin} width={width} height='100%' fillOpacity='0' style={{ cursor: 'col-resize' }} onMouseDown={this._down} onTouchMove={this._move} onTouchStart={this._down} />
      {axis && <g style={{ fontSize: '.7em' }}>
        <text className='primary-disabled' y='3em' x={margin} style={{ textAnchor: 'middle' }}>{min + axisUnit}</text>
        <text className='primary-disabled' y='3em' x='50%' style={{ textAnchor: 'middle' }}>{(min + max / 2) + axisUnit}</text>
        <text className='primary-disabled' y='3em' x='100%' style={{ textAnchor: 'end' }}>{max + axisUnit}</text>
      </g>}
    </svg>;
  }
}
