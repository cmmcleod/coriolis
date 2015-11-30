import React from 'react';
import Router from '../Router';
import shallowEqual from '../utils/shallowEqual';

export default class Link extends React.Component {

  shouldComponentUpdate(nextProps) {
    return !shallowEqual(this.props, nextProps);
  }

  handler = (event) => {
    if (event.getModifierState
      && ( event.getModifierState('Shift')
      || event.getModifierState('Alt')
      || event.getModifierState('Control')
      || event.getModifierState('Meta')
      || event.button > 1)) {
      return;
    }
    event.nativeEvent && event.preventDefault && event.preventDefault();

    if (this.props.href) {
      Router.go(encodeURI(this.props.href));
    }
  }

  render() {
    return <a {...this.props} onClick={this.handler}>{this.props.children}</a>
  }

}