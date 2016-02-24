import React from 'react';
import cn from 'classnames';
import SlotSection from './SlotSection';
import StandardSlot from './StandardSlot';
import { diffDetails } from '../utils/SlotFunctions';
import * as ModuleUtils from '../shipyard/ModuleUtils';
import { stopCtxPropagation } from '../utils/UtilityFunctions';

/**
 * Standard Slot section
 */
export default class StandardSlotSection extends SlotSection {

  /**
   * Constructor
   * @param  {Object} props   React Component properties
   * @param  {Object} context React Component context
   */
  constructor(props, context) {
    super(props, context, 'standard', 'standard');

    this._optimizeStandard = this._optimizeStandard.bind(this);
    this._optimizeCargo = this._optimizeCargo.bind(this);
    this._optimizeExplorer = this._optimizeExplorer.bind(this);
    this._hideDiff = this._hideDiff.bind(this);
  }

  /**
   * Fill all standard slots with the specificed rating (using max class)
   * @param  {String} rating [A-E]
   */
  _fill(rating) {
    this.props.ship.useStandard(rating);
    this.props.onChange();
    this._close();
  }

  /**
   * Use the lightest/optimal available standard modules
   */
  _optimizeStandard() {
    this.props.ship.useLightestStandard();
    this.props.onChange();
    this._close();
  }

  /**
   * Trader build
   */
  _optimizeCargo() {
    let ship = this.props.ship;
    ship.internal.forEach((slot) => ship.use(slot, ModuleUtils.findInternal('cr', slot.maxClass, 'E')));
    ship.useLightestStandard();
    this.props.onChange();
    this._close();
  }

  /**
   * Explorer build
   */
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

  /**
   * Use the specified bulkhead
   * @param  {number} bulkheadIndex 0 - 4
   */
  _selectBulkhead(bulkheadIndex) {
    this.props.ship.useBulkhead(bulkheadIndex);
    this.context.tooltip();
    this.props.onChange();
    this._close();
  }

  /**
   * On right click optimize the standard modules
   */
  _contextMenu() {
    this._optimizeStandard();
  }

  /**
   * Show the bulkhead diff tooltip
   * @param  {number} bhIndex Potential Bulkhead alternative
   * @param  {SyntheticEvent} event   Event
   */
  _bhDiff(bhIndex, event) {
    let ship = this.props.ship;
    this.context.tooltip(
      diffDetails.call(ship, this.context.language, ModuleUtils.bulkheads(ship.id, bhIndex), ship.bulkheads.m),
      event.currentTarget.getBoundingClientRect()
    );
  }

  /**
   * Hide the diff tooltip
   */
  _hideDiff() {
    this.context.tooltip();
  }

  /**
   * Generate the slot React Components
   * @return {Array} Array of Slots
   */
  _getSlots() {
    let { translate, units } = this.context.language;
    let { ship, currentMenu } = this.props;
    let slots = new Array(8);
    let open = this._openMenu;
    let select = this._selectModule;
    let selBulkhead = this._selectBulkhead;
    let st = ship.standard;
    let avail = ship.getAvailableModules().standard;
    let bh = ship.bulkheads;

    slots[0] = (
      <div key='bh' className={cn('slot', { selected: currentMenu === bh })} onClick={open.bind(this, bh)}>
        <div className={'details-container'}>
          <div className={'details'}>
            <div className={'sz'}>8</div>
            <div>
              <div className={'l'}>{translate('bh')}</div>
              <div className={'r'}>{bh.m.mass}{units.T}</div>
              <div className={'cl l'}>{translate(bh.m.name)}</div>
            </div>
          </div>
        </div>
        {currentMenu === bh &&
          <div className='select' onClick={ e => e.stopPropagation() }>
            <ul>
              <li onClick={selBulkhead.bind(this, 0)} onMouseOver={this._bhDiff.bind(this, 0)} onMouseLeave={this._hideDiff} className={cn('lc', { active: bh.index == 0 })}>
                  {translate('Lightweight Alloy')}
              </li>
              <li onClick={selBulkhead.bind(this, 1)} onMouseOver={this._bhDiff.bind(this, 1)} onMouseLeave={this._hideDiff} className={cn('lc', { active: bh.index == 1 })}>
                {translate('Reinforced Alloy')}
              </li>
              <li onClick={selBulkhead.bind(this, 2)} onMouseOver={this._bhDiff.bind(this, 2)} onMouseLeave={this._hideDiff} className={cn('lc', { active: bh.index == 2 })}>
                {translate('Military Grade Composite')}
              </li>
              <li onClick={selBulkhead.bind(this, 3)} onMouseOver={this._bhDiff.bind(this, 3)} onMouseLeave={this._hideDiff} className={cn('lc', { active: bh.index == 3 })}>
                {translate('Mirrored Surface Composite')}
              </li>
              <li onClick={selBulkhead.bind(this, 4)} onMouseOver={this._bhDiff.bind(this, 4)} onMouseLeave={this._hideDiff} className={cn('lc', { active: bh.index == 4 })}>
                {translate('Reactive Surface Composite')}
              </li>
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
      ship={ship}
      warning={m => m.pGen < ship.powerRetracted}
    />;

    slots[2] = <StandardSlot
      key='th'
      slot={st[1]}
      modules={avail[1]}
      onOpen={open.bind(this, st[1])}
      onSelect={select.bind(this, st[1])}
      selected={currentMenu == st[1]}
      ship={ship}
      warning={m => m.maxmass < ship.ladenMass}
    />;


    slots[3] = <StandardSlot
      key='fsd'
      slot={st[2]}
      modules={avail[2]}
      onOpen={open.bind(this, st[2])}
      onSelect={select.bind(this, st[2])}
      ship={ship}
      selected={currentMenu == st[2]}
    />;

    slots[4] = <StandardSlot
      key='ls'
      slot={st[3]}
      modules={avail[3]}
      onOpen={open.bind(this, st[3])}
      onSelect={select.bind(this, st[3])}
      ship={ship}
      selected={currentMenu == st[3]}
    />;

    slots[5] = <StandardSlot
      key='pd'
      slot={st[4]}
      modules={avail[4]}
      onOpen={open.bind(this, st[4])}
      onSelect={select.bind(this, st[4])}
      selected={currentMenu == st[4]}
      ship={ship}
      warning= {m => m.enginecapacity < ship.boostEnergy}
    />;

    slots[6] = <StandardSlot
      key='ss'
      slot={st[5]}
      modules={avail[5]}
      onOpen={open.bind(this, st[5])}
      onSelect={select.bind(this, st[5])}
      selected={currentMenu == st[5]}
      ship={ship}
      warning= {m => m.enginecapacity < ship.boostEnergy}
    />;

    slots[7] = <StandardSlot
      key='ft'
      slot={st[6]}
      modules={avail[6]}
      onOpen={open.bind(this, st[6])}
      onSelect={select.bind(this, st[6])}
      selected={currentMenu == st[6]}
      ship={ship}
      warning= {m => m.fuel < st[2].m.maxfuel}  // Show warning when fuel tank is smaller than FSD Max Fuel
    />;

    return slots;
  }

  /**
   * Generate the section drop-down menu
   * @param  {Function} translate Translate function
   * @return {React.Component}    Section menu
   */
  _getSectionMenu(translate) {
    let _fill = this._fill;

    return <div className='select' onClick={(e) => e.stopPropagation()} onContextMenu={stopCtxPropagation}>
      <ul>
        <li className='lc' onClick={this._optimizeStandard}>{translate('optimize')}</li>
        <li className='c' onClick={_fill.bind(this, 'E')}>E</li>
        <li className='c' onClick={_fill.bind(this, 'D')}>D</li>
        <li className='c' onClick={_fill.bind(this, 'C')}>C</li>
        <li className='c' onClick={_fill.bind(this, 'B')}>B</li>
        <li className='c' onClick={_fill.bind(this, 'A')}>A</li>
      </ul>
      <div className='select-group cap'>{translate('roles')}</div>
      <ul>
        <li className='lc' onClick={this._optimizeCargo}>{translate('Trader')}</li>
        <li className='lc' onClick={this._optimizeExplorer}>{translate('Explorer')}</li>
      </ul>
    </div>;
  }

}
