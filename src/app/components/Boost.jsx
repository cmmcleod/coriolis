import React from 'react';
import PropTypes from 'prop-types';
import TranslatedComponent from './TranslatedComponent';

/**
 * Boost displays a boost button that toggles bosot
 * Requires an onChange() function of the form onChange(boost) which is triggered whenever the boost changes.
 */
export default class Boost extends TranslatedComponent {
  static propTypes = {
    marker: PropTypes.string.isRequired,
    ship: PropTypes.object.isRequired,
    boost: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired
  };

  /**
   * Constructor
   * @param  {Object} props   React Component properties
   * @param  {Object} context   React Component context
   */
  constructor(props, context) {
    super(props);
    const { ship, boost } = props;

    this._keyDown = this._keyDown.bind(this);
    this._toggleBoost = this._toggleBoost.bind(this);
  }

  /**
   * Add listeners after mounting
   */
  componentDidMount() {
    document.addEventListener('keydown', this._keyDown);
  }

  /**
   * Remove listeners before unmounting
   */
  componentWillUnmount() {
    document.removeEventListener('keydown', this._keyDown);
  }

  /**
   * Handle Key Down
   * @param  {Event} e  Keyboard Event
   */
  _keyDown(e) {
    if (e.ctrlKey || e.metaKey) { // CTRL/CMD
      switch (e.keyCode) {
        case 66:     // b == boost
          if (this.props.ship.canBoost()) {
            e.preventDefault();
            this._toggleBoost();
          }
          break;
      }
    }
  }

  /**
   * Toggle the boost feature
   */
  _toggleBoost() {
    this.props.onChange(!this.props.boost);
  }

  /**
   * Render boost
   * @return {React.Component} contents
   */
  render() {
    const { formats, translate, units } = this.context.language;
    const { ship, boost } = this.props;

    // TODO disable if ship cannot boost
    return (
      <span id='boost'>
        <button id='boost' className={boost ? 'selected' : null} onClick={this._toggleBoost}>{translate('boost')}</button>
      </span>
    );
  }
}
