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

  }

  _use(grp, rating) {

  }

  _getSlots() {
    let slots = [];
    let hardpoints = this.props.ship.hardpoints;
    let availableModules = this.props.ship.getAvailableModules();
    let currentMenu = this.state.currentMenu;

    for (let i = 0, l = hardpoints.length; i < l; i++) {
      let h = hardpoints[i];
      if (h.maxClass === 0) {
        slots.push(<HardpointSlot
          key={i}
          size={h.maxClass}
          modules={availableModules.getHps(h.maxClass)}
          onOpen={this._openMenu.bind(this,h)}
          onSelect={this._selectModule.bind(this, h)}
          selected={currentMenu == h}
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
        <li className='c' onClick={_use.bind(this, 'sb', 'E')}>E</li>
        <li className='c' onClick={_use.bind(this, 'sb', 'D')}>D</li>
        <li className='c' onClick={_use.bind(this, 'sb', 'C')}>C</li>
        <li className='c' onClick={_use.bind(this, 'sb', 'B')}>B</li>
        <li className='c' onClick={_use.bind(this, 'sb', 'A')}>A</li>
      </ul>
    </div>;
  }

}
