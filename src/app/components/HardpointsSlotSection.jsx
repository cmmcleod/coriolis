import React from 'react';
import SlotSection from './SlotSection';
import HardpointSlot from './HardpointSlot';
import cn from 'classnames';
import { MountFixed, MountGimballed, MountTurret } from '../components/SvgIcons';

export default class HardpointsSlotSection extends SlotSection {

  constructor(props, context) {
    super(props, context, 'hardpoints', 'hardpoints');

    this._empty = this._empty.bind(this);
  }

  _empty() {
    this.props.ship.emptyWeapons();
    this.props.onChange();
    this._close();
  }

  _fill(group, mount, event) {
    this.props.ship.useWeapon(group, mount, null, event.getModifierState('Alt'));
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
      if (h.maxClass) {
        slots.push(<HardpointSlot
          key={i}
          maxClass={h.maxClass}
          availableModules={() => availableModules.getHps(h.maxClass)}
          onOpen={this._openMenu.bind(this, h)}
          onSelect={this._selectModule.bind(this, h)}
          selected={currentMenu == h}
          m={h.m}
        />);
      }
    }

    return slots;
  }

  _getSectionMenu(translate) {
    let _fill = this._fill;

    return <div className='select hardpoint' onClick={(e) => e.stopPropagation()}>
      <ul>
        <li className='lc' onClick={this._empty}>{translate('empty all')}</li>
      </ul>
      <div className='select-group cap'>{translate('pl')}</div>
      <ul>
        <li className='c' onClick={_fill.bind(this, 'pl', 'F')}><MountFixed className='lg'/></li>
        <li className='c' onClick={_fill.bind(this, 'pl', 'G')}><MountGimballed className='lg'/></li>
        <li className='c' onClick={_fill.bind(this, 'pl', 'T')}><MountTurret className='lg'/></li>
      </ul>
      <div className='select-group cap'>{translate('ul')}</div>
      <ul>
        <li className='c' onClick={_fill.bind(this, 'ul', 'F')}><MountFixed className='lg'/></li>
        <li className='c' onClick={_fill.bind(this, 'ul', 'G')}><MountGimballed className='lg'/></li>
        <li className='c' onClick={_fill.bind(this, 'ul', 'T')}><MountTurret className='lg'/></li>
      </ul>
      <div className='select-group cap'>{translate('bl')}</div>
      <ul>
        <li className='c' onClick={_fill.bind(this, 'bl', 'F')}><MountFixed className='lg'/></li>
        <li className='c' onClick={_fill.bind(this, 'bl', 'G')}><MountGimballed className='lg'/></li>
        <li className='c' onClick={_fill.bind(this, 'bl', 'T')}><MountTurret className='lg'/></li>
      </ul>
      <div className='select-group cap'>{translate('mc')}</div>
      <ul>
        <li className='c' onClick={_fill.bind(this, 'mc', 'F')}><MountFixed className='lg'/></li>
        <li className='c' onClick={_fill.bind(this, 'mc', 'G')}><MountGimballed className='lg'/></li>
        <li className='c' onClick={_fill.bind(this, 'mc', 'T')}><MountTurret className='lg'/></li>
      </ul>
      <div className='select-group cap'>{translate('c')}</div>
      <ul>
        <li className='c' onClick={_fill.bind(this, 'c', 'F')}><MountFixed className='lg'/></li>
        <li className='c' onClick={_fill.bind(this, 'c', 'G')}><MountGimballed className='lg'/></li>
        <li className='c' onClick={_fill.bind(this, 'c', 'T')}><MountTurret className='lg'/></li>
      </ul>
    </div>;
  }

}
