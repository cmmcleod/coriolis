import React from 'react';
import cn from 'classnames';
import SlotSection from './SlotSection';
import InternalSlot from './InternalSlot';
import * as ModuleUtils from '../shipyard/ModuleUtils';


export default class InternalSlotSection extends SlotSection {

  constructor(props, context) {
    super(props, context, 'internal', 'internal compartments');

    this._empty = this._empty.bind(this);
    this._fillWithCargo = this._fillWithCargo.bind(this);
    this._fillWithCells = this._fillWithCells.bind(this);
    this._fillWithArmor = this._fillWithArmor.bind(this);
  }

  _empty() {
    this.props.ship.emptyInternal();
    this.props.onChange();
    this._close();
  }

  _fillWithCargo(event) {
    let clobber = event.getModifierState('Alt');
    let ship = this.props.ship;
    ship.internal.forEach((slot) => {
      if (clobber || !slot.m) {
        ship.use(slot, ModuleUtils.findInternal('cr', slot.maxClass, 'E'));
      }
    });
    this.props.onChange();
    this._close();
  }

  _fillWithCells(event) {
    let clobber = event.getModifierState('Alt');
    let ship = this.props.ship;
    let chargeCap = 0; // Capacity of single activation
    ship.internal.forEach(function(slot) {
      if ((!slot.m || (clobber && !ModuleUtils.isShieldGenerator(slot.m.grp))) && (!slot.eligible || slot.eligible.scb)) { // Check eligibility due to Orca special case
        ship.use(slot, ModuleUtils.findInternal('scb', slot.maxClass, 'A'));
        ship.setSlotEnabled(slot, chargeCap <= ship.shieldStrength); // Don't waste cell capacity on overcharge
        chargeCap += slot.m.recharge;
      }
    });
    this.props.onChange();
    this._close();
  }

  _fillWithArmor(event) {
    let clobber = event.getModifierState('Alt');
    let ship = this.props.ship;
    ship.internal.forEach((slot) => {
      if (clobber || !slot.c) {
        ship.use(slot, ModuleUtils.findInternal('hr', Math.min(slot.maxClass, 5), 'D')); // Hull reinforcements top out at 5D
      }
    });
    this.props.onChange();
    this._close();
  }

  _contextMenu() {
    this._empty();
  }

  _getSlots() {
    let slots = [];
    let { currentMenu, ship } = this.props;
    let {internal, fuelCapacity, ladenMass } = ship;
    let availableModules = ship.getAvailableModules();

    for (let i = 0, l = internal.length; i < l; i++) {
      let s = internal[i];
      slots.push(<InternalSlot
        key={i}
        maxClass={s.maxClass}
        availableModules={() => availableModules.getInts(s.maxClass, s.eligible)}
        onOpen={this._openMenu.bind(this,s)}
        onSelect={this._selectModule.bind(this, s)}
        selected={currentMenu == s}
        enabled={s.enabled}
        m={s.m}
        fuel={fuelCapacity}
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
