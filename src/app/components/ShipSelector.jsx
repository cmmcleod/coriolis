import React from 'react';
import cn from 'classnames';
import { Ships } from 'coriolis-data/dist';
import TranslatedComponent from './TranslatedComponent';
import { Rocket } from './SvgIcons';

/**
 * Selector for ships
 */
export default class ShipSelector extends TranslatedComponent {
  static propTypes = {
    initial: React.PropTypes.object.isRequired,
    onChange: React.PropTypes.func.isRequired
  };

  /**
   * Constructor
   * @param  {Object} props   React Component properties
   */
  constructor(props) {
    super(props);

    this.state = { ship : this.props.initial };
  }

  /**
   * Generate the ships menu
   * @return {React.Component} Menu
   */
  _getShipsMenu() {
    const _selectShip = this._selectShip;

    let shipList = [];

    for (let s in Ships) {
      shipList.push(<div key={s} onClick={_selectShip.bind(this, s)} className='block' >{Ships[s].properties.name}</div>);
    }

    return shipList;
  }

  /**
   * Handle opening the menu
   * @param  {string}         menu  The ID of the opened menu
   * @param  {SyntheticEvent} event Event
   */
  _openMenu(menu, event) {
    event.stopPropagation();
    if (this.props.currentMenu == menu) {
      menu = null;
    }

    this.context.openMenu(menu);
  }

  /**
   * Handle selection of a ship
   * @param {string} s  The selected ship ID
   */
  _selectShip(s) {
    this.setState({ ship: Ships[s] });

    this.context.openMenu(null);
    this.props.onChange(s);
  }

  /**
   * Render ship selector
   * @return {React.Component} contents
   */
  render() {
    const currentMenu = this.props.currentMenu;
    const ship = this.state.ship;

    return (
      <div className='shipselector'>
      <div className='menu'>
        <div className={cn('menu-header', { selected: currentMenu == 'wds' })} onClick={this._openMenu.bind(this, 'wds')}>
          <Rocket className='warning' /><span className='menu-item-label'>{ship.properties.name}</span>
	  {currentMenu == 'wds' ? 
          <div className='menu-list quad no-wrap' onClick={ (e) => e.stopPropagation() }>
            {this._getShipsMenu()}
          </div> : null }
        </div>
      </div>
      </div>
    );
  }
}
