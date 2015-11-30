import React from 'react';
import SlotSection from './SlotSection';
import InternalSlot from './InternalSlot';
import cn from 'classnames';


export default class InternalSlotSection extends SlotSection {

  constructor(props, context) {
    super(props, context, 'internal', 'internal compartments');

    this._empty = this._empty.bind(this);
    this._fillWithCargo = this._fillWithCargo.bind(this);
    this._fillWithCells = this._fillWithCells.bind(this);
    this._fillWithArmor = this._fillWithArmor.bind(this);
  }

  _empty() {

  }

  _fillWithCargo() {

  }

  _fillWithCells() {

  }

  _fillWithArmor() {

  }

  _getSlots() {
    let slots = [];
    let {internal, fuelCapacity, ladenMass } = this.props.ship;
    let availableModules = this.props.ship.getAvailableModules();
    let currentMenu = this.state.currentMenu;

    for (let i = 0, l = internal.length; i < l; i++) {
      let s = internal[i];
      slots.push(<InternalSlot
        key={i}
        size={s.maxClass}
        modules={availableModules.getInts(s.maxClass, s.eligible)}
        onOpen={this._openMenu.bind(this,s)}
        onSelect={this._selectModule.bind(this, i, s)}
        selected={currentMenu == s}
        m={s.m}
        fuel={fuelCapacity}
        shipMass={ladenMass}
      />);
    }

    return slots;
  }

  _getSectionMenu(translate) {
    return <div className='select' onClick={e => e.stopPropagation()}>
      <ul>
        <li className='lc' onClick={this._empty}>{translate('empty all')}</li>
        <li className='lc' onClick={this._fillWithCargo}>{translate('cargo')}</li>
        <li className='lc' onClick={this._fillWithCells}>{translate('scb')}</li>
        <li className='lc' onClick={this._fillWithArmor}>{translate('hr')}</li>
      </ul>
    </div>;
  }

}
