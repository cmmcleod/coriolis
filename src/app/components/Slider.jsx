import React from 'react';

/**
 * Horizontal Slider
 */
export default class Slider extends React.Component {

  static defaultProps = {
    axis: false,
    min: 0,
    max: 1
  };

  static PropTypes = {
    axis: React.PropTypes.bool,
    axisUnit: React.PropTypes.string,
    min: React.PropTypes.number,
    max: React.PropTypes.number,
    onChange: React.PropTypes.func.isRequired,
  };

  /**
   * Constructor
   * @param  {Object} props   React Component properties
   */
  constructor(props) {
    super(props);

    this.down = this.down.bind(this);
    this.up = this.up.bind(this);
  }

  /**
   * On Mouse down handler
   * @param  {SyntheticEvent} event Event
   */
  down(event) {
    if (this.move) {
      this.up(event);
    } else {
      let rect = event.currentTarget.getBoundingClientRect();
      this.move = this._updatePercent.bind(this, rect.left, rect.width);
      this.move(event);
      document.addEventListener('mousemove', this.move, true);
      document.addEventListener('mouseup', this.up, true);
    }
  }

  /**
   * On Mouse up handler
   * @param  {Event} event  DOM Event
   */
  up(event) {
    document.removeEventListener('mousemove', this.move, true);
    document.removeEventListener('mouseup', this.up, true);
    this.move = null;
  }

  /**
   * Update the slider percentage
   * @param  {number} left  Slider left position
   * @param  {number} width Slider width
   * @param  {Event} event  DOM Event
   */
  _updatePercent(left, width, event) {
    this.props.onChange(Math.min(Math.max((event.clientX - left) / width, 0), 1));
  }

  /**
   * Remove listeners on unmount
   */
  componentWillUnmount() {
    this.up();
  }

  /**
   * Render the slider
   * @return {React.Component} The slider
   */
  render() {
    let pctStr = (this.props.percent * 100) + '%';
    let { axis, axisUnit, min, max } = this.props;
    let axisGroup;

    if (axis) {
      axisGroup = <g style={{ fontSize: '.7em' }}>
        <text className='primary-disabled' y='3em' x='0' style={{ textAnchor: 'middle' }}>{min + axisUnit}</text>
        <text className='primary-disabled' y='3em' x='50%' style={{ textAnchor: 'middle' }}>{(min + max / 2) + axisUnit}</text>
        <text className='primary-disabled' y='3em' x='99%' style={{ textAnchor: 'middle' }}>{max + axisUnit}</text>
      </g>;
    }

    return <svg style={{ width: '100%', height: axis ? '2.5em' : '1.5em', padding: '0 0.6em', cursor: 'col-resize', boxSizing: 'border-box' }}>
      <rect className='primary' style={{ opacity: 0.3 }} y='0.25em' rx='0.3em' ry='0.3em' width='100%' height='0.7em' />
      <rect className='primary-disabled'y='0.45em' rx='0.15em' ry='0.15em' width={pctStr} height='0.3em' />
      <circle className='primary' r='0.6em' cy='0.6em' cx={pctStr} />
      <rect width='100%' height='100%' fillOpacity='0' onMouseDown={this.down} onClick={this.click} />
      {axisGroup}
    </svg>;
  }
}
