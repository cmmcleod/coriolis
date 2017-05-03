import React from 'react';
import PropTypes from 'prop-types';

const TestUtils = {
  createContextProvider: function(context) {
    var _contextTypes = {};

    Object.keys(context).forEach(function(key) {
      _contextTypes[key] = PropTypes.any;
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
