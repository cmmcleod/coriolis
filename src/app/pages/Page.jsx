import React from 'react';
import ErrorDetails from './ErrorDetails';
import { shallowEqual } from '../utils/UtilityFunctions';

/**
 * Abstract/Base Page
 */
export default class Page extends React.Component {

  static contextTypes = {
    route: React.PropTypes.object.isRequired,
    language: React.PropTypes.object.isRequired,
    sizeRatio: React.PropTypes.number.isRequired,
    openMenu: React.PropTypes.func.isRequired,
    closeMenu: React.PropTypes.func.isRequired,
    showModal: React.PropTypes.func.isRequired,
    hideModal: React.PropTypes.func.isRequired,
    tooltip: React.PropTypes.func.isRequired,
    termtip: React.PropTypes.func.isRequired,
    onWindowResize: React.PropTypes.func.isRequired,
    onCommand: React.PropTypes.func.isRequired
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
   * Pages are 'pure' components that only render when props, state, or context changes.
   * This method performs a shallow comparison to determine change.
   *
   * @param  {Object} np  Next/Incoming properties
   * @param  {Object} ns  Next/Incoming state
   * @param  {Object} nc  Next/Incoming context
   * @return {Boolean}    True if props, state, or context has changed
   */
  shouldComponentUpdate(np, ns, nc) {
    return !shallowEqual(this.props, np) || !shallowEqual(this.state, ns) || !shallowEqual(this.context, nc);
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

  /**
   * Checks error state before rendering the page contents.
   * Pages should catch all errors where possible capture details to state.error.
   * @return {React.Component} Page contents
   */
  render() {
    if (this.state.error) {
      return <ErrorDetails error={this.state.error} />;
    }
    return this.renderPage();
  }

}