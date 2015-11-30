import React from 'react';
import shallowEqual from '../utils/shallowEqual';

export default class TranslatedComponent extends React.Component {

  static contextTypes = {
    language: React.PropTypes.object.isRequired
  }

  constructor(props) {
    super(props);
    this.didContextChange = this.didContextChange.bind(this);
  }

  didContextChange(nextContext){
    return nextContext.language !== this.context.language;
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return !shallowEqual(this.props, nextProps)
        || !shallowEqual(this.state, nextState)
        || this.didContextChange(nextContext);
  }
}
