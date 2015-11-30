import React from 'react';
import SlotSection from './SlotSection';
import StandardSlot from './StandardSlot';
import cn from 'classnames';
import { ArmourMultiplier } from '../shipyard/Constants';

export default class StandardSlotSection extends SlotSection {

  constructor(props, context) {
    super(props, context, 'standard', 'standard');

    this._optimizeStandard = this._optimizeStandard.bind(this);
    this._optimizeCargo = this._optimizeCargo.bind(this);
    this._optimizeExplorer = this._optimizeExplorer.bind(this);
  }

  _fill(rating) {

  }

  _optimizeStandard() {

  }

  _optimizeCargo() {

  }

  _optimizeExplorer() {

  }

  _selectBulkhead(bulkheadIndex) {
    this.props.ship.useBulkhead(bulkheadIndex);
    this._closeMenu();
  }

  _getSlots() {
    let { formats, translate, units } = this.context.language;
    let slots = new Array(8);
    let open = this._openMenu;
    let select = this._selectModule;
    let selBulkhead = this._selectBulkhead;
    let ship = this.props.ship
    let st = ship.standard;
    let avail = ship.getAvailableModules().standard;
    let bulkheads = ship.bulkheads;
    let bulkheadIndex = bulkheads.id;
    let currentMenu = this.state.currentMenu;

    slots[0] = (
      <div key='bh' className={cn('slot', {selected: currentMenu === bulkheads})} onClick={open.bind(this, bulkheads)}>
        <div className={'details'}>
          <div className={'sz'}>8</div>
          <div>
            <div className={'l'}>{translate('bh')}</div>
            <div className={'r'}>{bulkheads.m.mass}{units.T}</div>
            <div className={'cl l'}>{translate(bulkheads.m.name)}</div>
          </div>
        </div>
        {currentMenu === bulkheads &&
          <div className='select' onClick={ e => e.stopPropagation() }>
            <ul>
              <li onClick={selBulkhead.bind(this, 0)} className={cn('lc', { active: bulkheads.id=='0' })}>{translate('Lightweight Alloy')}</li>
              <li onClick={selBulkhead.bind(this, 1)} className={cn('lc', { active: bulkheads.id=='1' })}>{translate('Reinforced Alloy')}</li>
              <li onClick={selBulkhead.bind(this, 2)} className={cn('lc', { active: bulkheads.id=='2' })}>{translate('Military Grade Composite')}</li>
              <li onClick={selBulkhead.bind(this, 3)} className={cn('lc', { active: bulkheads.id=='3' })}>{translate('Mirrored Surface Composite')}</li>
              <li onClick={selBulkhead.bind(this, 4)} className={cn('lc', { active: bulkheads.id=='4' })}>{translate('Reactive Surface Composite')}</li>
            </ul>
          </div>
        }
      </div>
    );

    slots[1] = <StandardSlot
      key='pp'
      slot={st[0]}
      modules={avail[0]}
      onOpen={open.bind(this, st[0])}
      onSelect={select.bind(this, 1, st[0])}
      selected={currentMenu == st[0]}
      warning={(m) => m.pGen < ship.powerRetracted}
    />;

    slots[2] = <StandardSlot
      key='th'
      slot={st[1]}
      modules={avail[1]}
      onOpen={open.bind(this, st[1])}
      onSelect={select.bind(this, 2, st[1])}
      selected={currentMenu == st[1]}
      warning={(m) => m.maxmass < ship.ladenMass}
    />;


    slots[3] = <StandardSlot
      key='fsd'
      slot={st[2]}
      modules={avail[2]}
      onOpen={open.bind(this, st[2])}
      onSelect={select.bind(this, 3, st[2])}
      selected={currentMenu == st[2]}
    />;

    slots[4] = <StandardSlot
      key='ls'
      slot={st[3]}
      modules={avail[3]}
      onOpen={open.bind(this, st[3])}
      onSelect={select.bind(this, 4, st[3])}
      selected={currentMenu == st[3]}
    />;

    slots[5] = <StandardSlot
      key='pd'
      slot={st[4]}
      modules={avail[4]}
      onOpen={open.bind(this, st[4])}
      onSelect={select.bind(this, 5, st[4])}
      selected={currentMenu == st[4]}
      warning= {m => m.enginecapacity < ship.boostEnergy}
    />;

    slots[6] = <StandardSlot
      key='ss'
      slot={st[5]}
      modules={avail[5]}
      onOpen={open.bind(this, st[5])}
      onSelect={select.bind(this, 6, st[5])}
      selected={currentMenu == st[5]}
      warning= {m => m.enginecapacity < ship.boostEnergy}
    />;

    slots[7] = <StandardSlot
      key='ft'
      slot={st[6]}
      modules={avail[6]}
      onOpen={open.bind(this, st[6])}
      onSelect={select.bind(this, 7, st[6])}
      selected={currentMenu == st[6]}
      warning= {m => m.capacity < st[2].m.maxfuel}  // Show warning when fuel tank is smaller than FSD Max Fuel
    />;

    return slots;
  }

  _getSectionMenu(translate) {
    let _fill = this._fill;

    return <div className='select' onClick={(e) => e.stopPropagation()}>
      <ul>
        <li className='lc' onClick={this._optimizeStandard}>{translate('Optimize')}</li>
        <li className='c' onClick={_fill.bind(this, 'E')}>E</li>
        <li className='c' onClick={_fill.bind(this, 'D')}>D</li>
        <li className='c' onClick={_fill.bind(this, 'C')}>C</li>
        <li className='c' onClick={_fill.bind(this, 'B')}>B</li>
        <li className='c' onClick={_fill.bind(this, 'A')}>A</li>
      </ul>
      <div className='select-group cap'>{translate('builds / roles')}</div>
      <ul>
        <li className='lc' onClick={this._optimizeCargo}>{translate('Trader')}</li>
        <li className='lc' onClick={this._optimizeExplorer}>{translate('Explorer')}</li>
      </ul>
    </div>;
  }

}
