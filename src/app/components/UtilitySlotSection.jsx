import React from 'react';
import SlotSection from './SlotSection';
import HardpointSlot from './HardpointSlot';
import cn from 'classnames';

export default class UtilitySlotSection extends SlotSection {

  constructor(props, context) {
    super(props, context, 'utility', 'utility mounts');

    this._empty = this._empty.bind(this);
  }

  _empty() {
    this.props.ship.emptyUtility();
    this.props.onChange();
    this._close();
  }

  _use(group, rating, name, event) {
    this.props.ship.useUtility(group, rating, name, event.getModifierState('Alt'));
    this.props.onChange();
    this._close();
  }

  _contextMenu() {
    this._empty();
  }

  _getSlots() {
    let slots = [];
    let hardpoints = this.props.ship.hardpoints;
    let availableModules = this.props.ship.getAvailableModules();
    let currentMenu = this.props.currentMenu;

    for (let i = 0, l = hardpoints.length; i < l; i++) {
      let h = hardpoints[i];
      if (h.maxClass === 0) {
        slots.push(<HardpointSlot
          key={i}
          maxClass={h.maxClass}
          availableModules={() => availableModules.getHps(h.maxClass)}
          onOpen={this._openMenu.bind(this,h)}
          onSelect={this._selectModule.bind(this, h)}
          selected={currentMenu == h}
          enabled={h.enabled}
          m={h.m}
        />);
      }
    }

    return slots;
  }

  _getSectionMenu(translate) {
    let _use = this._use;

    return <div className='select' onClick={(e) => e.stopPropagation()}>
      <ul>
        <li className='lc' onClick={this._empty}>{translate('empty all')}</li>
      </ul>
      <div className='select-group cap'>{translate('sb')}</div>
      <ul>
        <li className='c' onClick={_use.bind(this, 'sb', 'E', null)}>E</li>
        <li className='c' onClick={_use.bind(this, 'sb', 'D', null)}>D</li>
        <li className='c' onClick={_use.bind(this, 'sb', 'C', null)}>C</li>
        <li className='c' onClick={_use.bind(this, 'sb', 'B', null)}>B</li>
        <li className='c' onClick={_use.bind(this, 'sb', 'A', null)}>A</li>
      </ul>
      <div className='select-group cap'>{translate('cm')}</div>
      <ul>
        <li className='lc' onClick={_use.bind(this, 'cm', null, 'Heat Sink Launcher')}>{translate('Heat Sink Launcher')}</li>
      </ul>
    </div>;
  }

}
