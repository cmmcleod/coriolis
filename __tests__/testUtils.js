import React from 'react';

const TestUtils = {
  createContextProvider: function(context) {
    var _contextTypes = {};

    Object.keys(context).forEach(function(key) {
      _contextTypes[key] = React.PropTypes.any;
    });

    return React.createClass({
      displayName: 'ContextProvider',
      childContextTypes: _contextTypes,
      getChildContext() { return context; },

      render() {
        return React.Children.only(this.props.children);
      }
    });
  }
};


export default TestUtils;