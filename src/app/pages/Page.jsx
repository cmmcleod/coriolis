import React from 'react';
import shallowEqual from '../utils/shallowEqual';

/**
 * @class Abstract Page
 */
export default class Page extends React.Component {

  static contextTypes = {
    route: React.PropTypes.object.isRequired,
    language: React.PropTypes.object.isRequired,
    sizeRatio: React.PropTypes.number.isRequired
  };

  static propTypes = {
    currentMenu: React.PropTypes.any
  };

  /**
   * Created an instance of a Page. This is an abstract class.
   * @param  {object} props Properties
   */
  constructor(props) {
    super(props);

    // Autobind private functions
    Object.getOwnPropertyNames(this.constructor.prototype).forEach(prop => {
      if(prop.charAt(0) == '_' && typeof this[prop] === 'function') {
        this[prop] = this[prop].bind(this);
      }
    });
  }

  /**
   * Translated components are 'pure' components that only render when
   * props, state, or context changes. This method performs a shallow comparison to
   * determine change.
   *
   * @param  {object} nextProps
   * @param  {objec} nextState
   * @param  {objec} nextContext
   * @return {boolean}            True if props, state, or context has changed
   */
  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return !shallowEqual(this.props, nextProps)
        || !shallowEqual(this.state, nextState)
        || !shallowEqual(this.context, nextContext)
  }

  /**
   * Update the window title upon mount
   */
  componentWillMount() {
    document.title = this.state.title || 'Coriolis';
  }

  /**
   * Updates the title upon change
   * @param  {Object} newProps  Incoming properties
   * @param  {Object} newState  Incoming state
   */
  componentWillUpdate(newProps, newState) {
    document.title = newState.title || 'Coriolis';
  }

}