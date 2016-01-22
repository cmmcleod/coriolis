import React from 'react';
import Link from './Link';
import cn from 'classnames';


/**
 * Returns true if the current window location equals the link
 * @return {boolean} If matches
 */
function isActive(href) {
  return encodeURI(href) == (window.location.pathname + window.location.search);
}

/**
 * Active Link - Highlighted when URL matches window location
 */
export default class ActiveLink extends Link {

  /**
   * Renders the component
   * @return {React.Component} The active link
   */
  render() {
    let className = this.props.className;
    if (isActive(this.props.href)) {
      className = cn(className, 'active');
    }

    return <a {...this.props} className={className} onClick={this.handler.bind(this)}>{this.props.children}</a>;
  }

}