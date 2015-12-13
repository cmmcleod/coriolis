import React from 'react';
import shallowEqual from '../utils/shallowEqual';

export default class Page extends React.Component {

  static contextTypes = {
    route: React.PropTypes.object.isRequired,
    language: React.PropTypes.object.isRequired
  };

  static propTypes = {
    currentMenu: React.PropTypes.any
  };

  constructor(props) {
    super(props);

    // Autobind private functions
    Object.getOwnPropertyNames(this.constructor.prototype).forEach(prop => {
      if(prop.charAt(0) == '_' && typeof this[prop] === 'function') {
        this[prop] = this[prop].bind(this);
      }
    });
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return !shallowEqual(this.props, nextProps)
        || !shallowEqual(this.state, nextState)
        || !shallowEqual(this.context, nextContext)
  }

  componentWillMount() {
    document.title = this.state.title || 'Coriolis';
  }

  componentWillUpdate(newProps, newState) {
    document.title = newState.title || 'Coriolis';
  }

}