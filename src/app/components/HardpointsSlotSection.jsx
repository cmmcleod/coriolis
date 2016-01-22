import React from 'react';
import SlotSection from './SlotSection';
import HardpointSlot from './HardpointSlot';
import cn from 'classnames';
import { MountFixed, MountGimballed, MountTurret } from '../components/SvgIcons';

/**
 * Hardpoint slot section
 */
export default class HardpointsSlotSection extends SlotSection {

  /**
   * Constructor
   * @param  {Object} props   React Component properties
   * @param  {Object} context React Component context
   */
  constructor(props, context) {
    super(props, context, 'hardpoints', 'hardpoints');

    this._empty = this._empty.bind(this);
  }

  /**
   * Empty all slots
   */
  _empty() {
    this.props.ship.emptyWeapons();
    this.props.onChange();
    this._close();
  }

  /**
   * Fill slots with specified module
   * @param  {string} group           Group name
   * @param  {string} mount           Mount Type - F, G, T
   * @param  {SyntheticEvent} event   Event
   */
  _fill(group, mount, event) {
    this.props.ship.useWeapon(group, mount, null, event.getModifierState('Alt'));
    this.props.onChange();
    this._close();
  }

  /**
   * Empty all on section header right click
   */
  _contextMenu() {
    this._empty();
  }

  /**
   * Generate the slot React Components
   * @return {Array} Array of Slots
   */
  _getSlots() {
    let { ship, currentMenu } = this.props;
    let { originSlot, targetSlot } = this.state;
    let slots = [];
    let hardpoints = ship.hardpoints;
    let availableModules = ship.getAvailableModules();

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
          drag={this._drag.bind(this, h)}
          dragOver={this._dragOverSlot.bind(this, h)}
          drop={this._drop}
          dropClass={this._dropClass(h, originSlot, targetSlot)}
          ship={ship}
          m={h.m}
        />);
      }
    }

    return slots;
  }

  /**
   * Generate the section drop-down menu
   * @param  {Function} translate Translate function
   * @return {React.Component}    Section menu
   */
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
