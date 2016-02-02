import React from 'react';
import Router from '../Router';
import { shallowEqual } from '../utils/UtilityFunctions';

/**
 * Link wrapper component
 */
export default class Link extends React.Component {

  /**
   * Determine if a component should be rerendered
   * @param  {object} nextProps Next properties
   * @return {boolean}          true if update is needed
   */
  shouldComponentUpdate(nextProps) {
    return !shallowEqual(this.props, nextProps);
  }

  /**
   * Link click handler
   * @param  {SyntheticEvent} event Event
   */
  handler(event) {
    if (event.getModifierState &&
      (event.getModifierState('Shift') ||
      event.getModifierState('Alt') ||
      event.getModifierState('Control') ||
      event.getModifierState('Meta') ||
      event.button > 1)) {
      return;
    }
    event.nativeEvent && event.preventDefault && event.preventDefault();

    if (this.props.href) {
      Router.go(encodeURI(this.props.href));
    }
  }

  /**
   * Renders the link
   * @return {React.Component} A href element
   */
  render() {
    let action = this.handler.bind(this);
    return <a {...this.props} onTouchTap={action}>{this.props.children}</a>;
  }

}