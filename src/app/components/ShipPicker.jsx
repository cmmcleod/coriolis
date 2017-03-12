import React from 'react';
import TranslatedComponent from './TranslatedComponent';
import Ship from '../shipyard/Ship';
import { Ships } from 'coriolis-data/dist';
import { Rocket } from './SvgIcons';
import Persist from '../stores/Persist';
import cn from 'classnames';

/**
 * Ship picker
 * Requires an onChange() function of the form onChange(ship), providing the ship, which is triggered on ship change
 */
export default class ShipPicker extends TranslatedComponent {
  static propTypes = {
    onChange: React.PropTypes.func.isRequired,
    ship: React.PropTypes.object,
    build: React.PropTypes.string
  };

  static defaultProps = {
    ship: new Ship('anaconda', Ships['anaconda'].properties, Ships['anaconda'].slots)
  }

  /**
   * Constructor
   * @param  {Object} props   React Component properties
   * @param  {Object} context   React Component context
   */
  constructor(props, context) {
    super(props);

    this.shipOrder = Object.keys(Ships).sort();
    this._toggleMenu = this._toggleMenu.bind(this);
    this._closeMenu = this._closeMenu.bind(this);

    this.state = {
      ship: props.ship,
      build: props.build
    };
  }

  /**
   * Update the state if our ship changes
   * @param  {Object} nextProps   Incoming/Next properties
   * @return {boolean}            Returns true if the component should be rerendered
   */
  componentWillReceiveProps(nextProps) {
    const { ship, build } = this.state;
    const { nextShip, nextBuild } = nextProps;

    if (nextShip != undefined && nextShip != ship && nextBuild != build) {
      this.setState({ ship: nextShip, build: nextBuild });
    }
    return true;
  }

  /**
   * Update ship
   * @param  {object} shipId  the ship
   * @param  {string} build   the build, if present
   */
  _shipChange(shipId, build) {
    const ship = new Ship(shipId, Ships[shipId].properties, Ships[shipId].slots);
    if (build) {
      // Ship is a particular build
      ship.buildFrom(Persist.getBuild(shipId, build));
    }
    this._closeMenu();
    this.setState({ ship, build });
    this.props.onChange(ship, build);
  }

  /**
   * Render the menu for the picker
   * @returns {object}    the picker menu
   */
  _renderPickerMenu() {
    const { ship, build } = this.state;
    const _shipChange = this._shipChange;

    const builds = Persist.getBuilds();
    const buildList = [];
    for (let shipId of this.shipOrder) {
      const shipBuilds = [];
      // Add stock build
      const stockSelected = (ship.id == shipId && !build);
      shipBuilds.push(<li key={shipId} className={ cn({ 'selected': stockSelected })} onClick={_shipChange.bind(this, shipId, null)}>Stock</li>);
      if (builds[shipId]) {
        let buildNameOrder = Object.keys(builds[shipId]).sort();
        for (let buildName of buildNameOrder) {
          const buildSelected = ship.id == shipId && build == buildName;
          shipBuilds.push(<li key={shipId + '-' + buildName} className={ cn({ 'selected': buildSelected })} onClick={_shipChange.bind(this, shipId, buildName)}>{buildName}</li>);
        }
      }
      buildList.push(<ul key={shipId} className='block'>{Ships[shipId].properties.name}{shipBuilds}</ul>);
    }

    return buildList;
  }

  /**
   * Toggle the menu state
   */
  _toggleMenu() {
    const { menuOpen } = this.state;
    this.setState({ menuOpen: !menuOpen });
  }

  /**
   * Close the menu
   */
  _closeMenu() {
    const { menuOpen } = this.state;
    if (menuOpen) {
      this._toggleMenu();
    }
  }

  /**
   * Render picker
   * @return {React.Component} contents
   */
  render() {
    const { language, onWindowResize, sizeRatio, tooltip, termtip } = this.context;
    const { formats, translate, units } = language;
    const { menuOpen, ship, build } = this.state;

    const shipString = ship.name + ': ' + (build ? build : 'stock');
    return (
      <div className='shippicker' onClick={ (e) => e.stopPropagation() }>
        <div className='menu'>
          <div className={cn('menu-header', { selected: menuOpen })} onClick={this._toggleMenu}>
            <Rocket className='warning' /><span className='menu-item-label'>{shipString}</span>
          </div>
          { menuOpen ?
          <div className='menu-list' onClick={ (e) => e.stopPropagation() }>
            <div className='quad'>
              {this._renderPickerMenu()}
            </div>
          </div> : null }
        </div>
      </div>
    );
  }
}
