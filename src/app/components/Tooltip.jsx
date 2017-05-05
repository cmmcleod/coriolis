import React from 'react';
import PropTypes from 'prop-types';
import TranslatedComponent from './TranslatedComponent';

/**
 * Document Root Tooltip
 */
export default class Tooltip extends TranslatedComponent {

  static propTypes = {
    rect: PropTypes.object.isRequired,
    options: PropTypes.object
  };

  static defaultProps = {
    options: {}
  };

  /**
   * Constructor
   * @param  {Object} props   React Component properties
   */
  constructor(props) {
    super(props);
    this._adjustDimensions = this._adjustDimensions.bind(this);
    this.state = this._initialDimensions(props);
  }

  /**
   * Get position and reset width/height
   * @param  {Object} props React Component properties
   * @return {Object}       Dimenions / state
   */
  _initialDimensions(props) {
    let { options, rect } = props;
    let orientation = options.orientation || 'n';
    let top, left;

    switch (orientation) {
      case 's':
        top = Math.round(rect.top + rect.height);
        left = Math.round(rect.left + (rect.width / 2));
        break;
      case 'n':
        top = Math.round(rect.top);
        left = Math.round(rect.left + (rect.width / 2));
        break;
      case 'e':
        top = Math.round(rect.top + (rect.height / 2));
        left = Math.round(rect.left + rect.width);
        break;
      case 'w':
        top = Math.round(rect.top + (rect.height / 2));
        left = Math.round(rect.left);
    }

    return { top, left, arrLeft: left, width: null, height: null, orientation };
  }

  /**
   * Adjusts the position and size of the tooltip if its content
   * appear outside of the windows left or right border
   * @param  {DomElement} elem Tooltip contents container
   */
  _adjustDimensions() {
    if (this.elem) {
      let o = this.state.orientation;
      let rect = this.elem.getBoundingClientRect();

      // Round widthand height to nearest even number to avoid translate3d text blur
      // caused by fractional pixels
      let width = Math.ceil(rect.width / 2) * 2;

      this.setState({
        width,
        height: Math.round(rect.height / 2) * 2
      });

      if (o == 'n' || o == 's') {
        let docWidth = document.documentElement.clientWidth;

        if (rect.left < 0) {
          this.setState({ left: Math.round(width / 4) * 2 });
        } else if ((rect.left + width) > docWidth) {
          this.setState({ left: docWidth - Math.round(width / 4) * 2 });
        }
      }
    }
  }

  /**
   *Potentially adjust component dimensions after mount
   */
  componentDidMount() {
    this._adjustDimensions();
  }

  /**
   * Reset width and height on propChange
   * @param  {Object} nextProps   Incoming/Next properties
   */
  componentWillReceiveProps(nextProps) {
    this.setState(this._initialDimensions(nextProps));
  }

  /**
   * Potentially adjust component dimensions on re-render
   */
  componentDidUpdate() {
    this._adjustDimensions();
  }

  /**
   * Renders the component
   * @return {React.Component} Tooltip
   */
  render() {
    if (!this.props.children) { // If no content is provided
      return null;
    }
    let { top, left, arrLeft, width, height, orientation } = this.state;

    return <div style={{ fontSize: this.context.sizeRatio + 'em' }}>
      <div className={ 'arr ' + orientation} style={{ top, left: arrLeft }} />
      <div className={ 'tip ' + orientation} style={{ top, left, width, height }} ref={(elem) => this.elem = elem}>
        {this.props.children}
      </div>
    </div>;
  }

}
