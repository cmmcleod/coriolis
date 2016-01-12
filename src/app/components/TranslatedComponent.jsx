import React from 'react';
import shallowEqual from '../utils/shallowEqual';

/**
 * @class Abstract TranslatedComponent
 */
export default class TranslatedComponent extends React.Component {

  static contextTypes = {
    language: React.PropTypes.object.isRequired,
    sizeRatio: React.PropTypes.number.isRequired
  }

  /**
   * Created an instance of a Translated Component. This is an abstract class.
   * @param  {object} props Properties
   */
  constructor(props) {
    super(props);
    this.didContextChange = this.didContextChange.bind(this);
  }

  /**
   * Determine if the context change incldues a language or size change
   * @param  {object} nextContext The incoming / next context
   * @return {boolean}  true if the language has changed
   */
  didContextChange(nextContext){
    return nextContext.language !== this.context.language || nextContext.sizeRatio != this.context.sizeRatio;
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
        || this.didContextChange(nextContext);
  }
}
