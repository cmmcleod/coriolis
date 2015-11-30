import React from 'react';
import Link from './Link';
import cn from 'classnames';

export default class ActiveLink extends Link {

  isActive = () => {
    return encodeURI(this.props.href) == (window.location.pathname + window.location.search);
  }

  render() {
    let className = this.props.className;
    if (this.isActive()) {
      className = cn(className, 'active');
    }

    return <a {...this.props} className={className} onClick={this.handler}>{this.props.children}</a>
  }

}