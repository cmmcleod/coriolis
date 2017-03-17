import React from 'react';
import TranslatedComponent from './TranslatedComponent';
import { Ships } from 'coriolis-data/dist';
import ShipSelector from './ShipSelector';
import { nameComparator } from '../utils/SlotFunctions';
import { Pip } from './SvgIcons';
import LineChart from '../components/LineChart';
import Slider from '../components/Slider';
import * as ModuleUtils from '../shipyard/ModuleUtils';
import Module from '../shipyard/Module';

/**
 * Boost displays a boost button that toggles bosot
 * Requires an onChange() function of the form onChange(boost) which is triggered whenever the boost changes.
 */
export default class Boost extends TranslatedComponent {
  static propTypes = {
    marker: React.PropTypes.string.isRequired,
    ship: React.PropTypes.object.isRequired,
    onChange: React.PropTypes.func.isRequired
  };

  /**
   * Constructor
   * @param  {Object} props   React Component properties
   * @param  {Object} context   React Component context
   */
  constructor(props, context) {
    super(props);
    const ship = props.ship;

    this._keyDown = this._keyDown.bind(this);
    this._toggleBoost = this._toggleBoost.bind(this);

    this.state = {
      boost: false
    };
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
   * Update values if we change ship
   * @param   {Object} nextProps   Incoming/Next properties
   * @returns {boolean}            Returns true if the component should be rerendered
   */
  componentWillReceiveProps(nextProps) {
    const { boost } = this.state;
    const nextShip = nextProps.ship;

    const nextBoost = nextShip.canBoost() ? boost : false;
    if (nextBoost != boost) {
      this.setState({
        boost: nextBoost
      });
    }

    return true;
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
    let { boost } = this.state;
    boost = !boost;
    this.setState({ boost });
    this.props.onChange(boost);
  }

  /**
   * Render boost
   * @return {React.Component} contents
   */
  render() {
    const { formats, translate, units } = this.context.language;
    const { ship } = this.props;
    const { boost } = this.state;

    // TODO disable if ship cannot boost
    return (
      <span id='boost'>
        <button id='boost' className={boost ? 'selected' : null} onClick={this._toggleBoost}>{translate('boost')}</button>
      </span>
    );
  }
}
