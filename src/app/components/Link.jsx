import React from 'react';
import Router from '../Router';
import { shallowEqual } from '../utils/UtilityFunctions';

/**
 * Link wrapper component
 */
export default class Link extends React.Component {

  static propTypes = {
    children: React.PropTypes.any,
    href: React.PropTypes.string.isRequired,
    onClick: React.PropTypes.func
  };

  /**
   * Constructor
   * @param  {Object} props   React Component properties
   */
  constructor(props) {
    super(props);
    this.handler = this.handler.bind(this);
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
   * Link click handler
   * @param  {SyntheticEvent} event Event
   */
  handler(event) {
    if (event.shiftKey || event.altKey || event.ctrlKey || event.metaKey || event.button > 0) {
      return;
    }
    event.preventDefault();

    if (this.props.onClick) {
      this.props.onClick(event);
    } else if (this.props.href) {
      Router.go(this.props.href);
    }
  }

  /**
   * Renders the link
   * @return {React.Component} A href element
   */
  render() {
    return <a {...this.props} onClick={this.handler}>{this.props.children}</a>;
  }

}