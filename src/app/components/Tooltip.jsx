import React from 'react';
import { shallowEqual } from '../utils/UtilityFunctions';

/**
 * Document Root Tooltip
 */
export default class Tooltip extends React.Component {

  static propTypes = {
    rect: React.PropTypes.object.isRequired,
    options: React.PropTypes.object
  };

  static defaultProps = {
    options: {}
  };

  /**
   * Adjusts the position of the tooltip if its content
   * appear outside of the windows left or right border
   * @param  {DomElement} elem Tooltip contents container
   */
  _adjustPosition(elem) {
    if (elem) {
      let o = this.props.options.orientation || 'n';
      let rect = elem.getBoundingClientRect();

      if (o == 'n' || o == 's') {
        let docWidth = document.documentElement.clientWidth;

        if (rect.left < 0) {
          elem.style.left = rect.width / 2 + 'px';
        } else if ((rect.left + rect.width) > docWidth) {
          elem.style.left = docWidth - (rect.width / 2) + 'px';
        }
      }
    }
  }

  /**
   * Determine if a component should be rerendered
   * @param  {object} nextProps Next properties
   * @return {boolean}          true if update is needed
   */
  shouldComponentUpdate(nextProps) {
    return !shallowEqual(this.props, nextProps);
  }


  /**
   * Renders the component
   * @return {React.Component} Tooltip
   */
  render() {
    if (!this.props.children) { // If no content is provided
      return null;
    }

    let { children, options, rect } = this.props;
    let o = options.orientation || 'n';
    let style = options.style ||  {};

    switch (o) {
      case 's':
        style.top = rect.top + rect.height;
        style.left = rect.left + (rect.width / 2);
        break;
      case 'n':
        style.top = rect.top;
        style.left = rect.left + (rect.width / 2);
        break;
      case 'e':
        style.left = rect.left + rect.width;
        style.top = rect.top + (rect.height / 2);
        break;
      case 'w':
        style.left = rect.left;
        style.top = rect.top + (rect.height / 2);
    }

    return <div>
      <div className={ 'arr ' + o} style={style} />
      <div className={ 'tip ' + o} style={style} ref={this._adjustPosition.bind(this)}>
        {children}
      </div>
    </div>;
  }

}