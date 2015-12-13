import React from 'react';
import cn from 'classnames';
import SlotSection from './SlotSection';
import StandardSlot from './StandardSlot';
import * as ModuleUtils from '../shipyard/ModuleUtils';

export default class StandardSlotSection extends SlotSection {

  constructor(props, context) {
    super(props, context, 'standard', 'standard');

    this._optimizeStandard = this._optimizeStandard.bind(this);
    this._optimizeCargo = this._optimizeCargo.bind(this);
    this._optimizeExplorer = this._optimizeExplorer.bind(this);
  }

  _fill(rating) {
    this.props.ship.useStandard(rating);
    this.props.onChange();
    this._close();
  }

  _optimizeStandard() {
    this.props.ship.useLightestStandard();
    this.props.onChange();
    this._close();
  }

  _optimizeCargo() {
    let ship = this.props.ship;
    ship.internal.forEach((slot) => {
      var id = ModuleUtils.findInternalId('cr', slot.maxClass, 'E');
      ship.use(slot, ModuleUtils.internal(id));
    });
    ship.useLightestStandard();
    this.props.onChange();
    this._close();
  }

  _optimizeExplorer() {
    let ship = this.props.ship,
        intLength = ship.internal.length,
        heatSinkCount = 2,  // Fit 2 heat sinks if possible
        afmUnitCount = 2,   // Fit 2 AFM Units if possible
        sgSlot,
        fuelScoopSlot,
        sg = ship.getAvailableModules().lightestShieldGenerator(ship.hullMass);

    ship.setSlotEnabled(ship.cargoHatch, false)
        .use(ship.internal[--intLength], ModuleUtils.internal('2f'))      // Advanced Discovery Scanner
        .use(ship.internal[--intLength], ModuleUtils.internal('2i'));      // Detailed Surface Scanner

    for (let i = 0; i < intLength; i++) {
      let slot = ship.internal[i];
      let nextSlot = (i + 1) < intLength ? ship.internal[i + 1] : null;
      if (!fuelScoopSlot && (!slot.eligible || slot.eligible.fs)) {             // Fit best possible Fuel Scoop
        fuelScoopSlot = slot;
        ship.use(fuelScoopSlot, ModuleUtils.findInternal('fs', slot.maxClass, 'A'));
        ship.setSlotEnabled(fuelScoopSlot, true);

      // Mount a Shield generator if possible AND an AFM Unit has been mounted already (Guarantees at least 1 AFM Unit)
      } else if (!sgSlot && afmUnitCount < 2 && sg.class <= slot.maxClass && (!slot.eligible || slot.eligible.sg) && (!nextSlot || nextSlot.maxClass < sg.class)) {
        sgSlot = slot;
        ship.use(sgSlot, sg);
        ship.setSlotEnabled(sgSlot, true);
      } else if (afmUnitCount > 0 && (!slot.eligible || slot.eligible.am)) {
        afmUnitCount--;
        let am = ModuleUtils.findInternal('am', slot.maxClass, afmUnitCount ? 'B' : 'A');
        ship.use(slot, am);
        ship.setSlotEnabled(slot, false);   // Disabled power for AFM Unit

      } else {
        ship.use(slot, null);
      }
    }

    ship.hardpoints.forEach((s) => {
      if (s.maxClass == 0 && heatSinkCount) {       // Mount up to 2 heatsinks
        ship.use(s, ModuleUtils.hardpoints('02'));
        ship.setSlotEnabled(s, heatSinkCount == 2); // Only enable a single Heatsink
        heatSinkCount--;
      } else {
        ship.use(s, null);
      }
    });

    if (sgSlot) {
      // The SG and Fuel scoop to not need to be powered at the same time
      if (sgSlot.m.power > fuelScoopSlot.m.power) { // The Shield generator uses the most power
        ship.setSlotEnabled(fuelScoopSlot, false);
      } else {                                    // The Fuel scoop uses the most power
        ship.setSlotEnabled(sgSlot, false);
      }
    }

    ship.useLightestStandard({ pd: '1D', ppRating: 'A' });
    this.props.onChange();
    this._close();
  }

  _selectBulkhead(bulkheadIndex) {
    this.props.ship.useBulkhead(bulkheadIndex);
    this.props.onChange();
    this._close();
  }

  _contextMenu() {
    this._optimizeStandard();
  }

  _getSlots() {
    let { translate, units } = this.context.language;
    let slots = new Array(8);
    let open = this._openMenu;
    let select = this._selectModule;
    let selBulkhead = this._selectBulkhead;
    let ship = this.props.ship
    let st = ship.standard;
    let avail = ship.getAvailableModules().standard;
    let bulkheads = ship.bulkheads;
    let currentMenu = this.props.currentMenu;

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
              <li onClick={selBulkhead.bind(this, 0)} className={cn('lc', { active: bulkheads.id == '0' })}>{translate('Lightweight Alloy')}</li>
              <li onClick={selBulkhead.bind(this, 1)} className={cn('lc', { active: bulkheads.id == '1' })}>{translate('Reinforced Alloy')}</li>
              <li onClick={selBulkhead.bind(this, 2)} className={cn('lc', { active: bulkheads.id == '2' })}>{translate('Military Grade Composite')}</li>
              <li onClick={selBulkhead.bind(this, 3)} className={cn('lc', { active: bulkheads.id == '3' })}>{translate('Mirrored Surface Composite')}</li>
              <li onClick={selBulkhead.bind(this, 4)} className={cn('lc', { active: bulkheads.id == '4' })}>{translate('Reactive Surface Composite')}</li>
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
      onSelect={select.bind(this, st[0])}
      selected={currentMenu == st[0]}
      warning={m => m.pGen < ship.powerRetracted}
    />;

    slots[2] = <StandardSlot
      key='th'
      slot={st[1]}
      modules={avail[1]}
      onOpen={open.bind(this, st[1])}
      onSelect={select.bind(this, st[1])}
      selected={currentMenu == st[1]}
      warning={m => m.maxmass < ship.ladenMass}
    />;


    slots[3] = <StandardSlot
      key='fsd'
      slot={st[2]}
      modules={avail[2]}
      onOpen={open.bind(this, st[2])}
      onSelect={select.bind(this, st[2])}
      selected={currentMenu == st[2]}
    />;

    slots[4] = <StandardSlot
      key='ls'
      slot={st[3]}
      modules={avail[3]}
      onOpen={open.bind(this, st[3])}
      onSelect={select.bind(this, st[3])}
      selected={currentMenu == st[3]}
    />;

    slots[5] = <StandardSlot
      key='pd'
      slot={st[4]}
      modules={avail[4]}
      onOpen={open.bind(this, st[4])}
      onSelect={select.bind(this, st[4])}
      selected={currentMenu == st[4]}
      warning= {m => m.enginecapacity < ship.boostEnergy}
    />;

    slots[6] = <StandardSlot
      key='ss'
      slot={st[5]}
      modules={avail[5]}
      onOpen={open.bind(this, st[5])}
      onSelect={select.bind(this, st[5])}
      selected={currentMenu == st[5]}
      warning= {m => m.enginecapacity < ship.boostEnergy}
    />;

    slots[7] = <StandardSlot
      key='ft'
      slot={st[6]}
      modules={avail[6]}
      onOpen={open.bind(this, st[6])}
      onSelect={select.bind(this, st[6])}
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
