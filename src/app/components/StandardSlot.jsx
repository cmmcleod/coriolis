import React from 'react';
import cn from 'classnames';
import TranslatedComponent from './TranslatedComponent';
import { jumpRange } from '../shipyard/Calculations';
import { diffDetails } from '../utils/SlotFunctions';
import AvailableModulesMenu from './AvailableModulesMenu';
import ModificationsMenu from './ModificationsMenu';
import { ListModifications } from './SvgIcons';
import { Modifications } from 'coriolis-data/dist';
import { stopCtxPropagation } from '../utils/UtilityFunctions';

/**
 * Standard Slot
 */
export default class StandardSlot extends TranslatedComponent {

  static propTypes = {
    slot: React.PropTypes.object,
    modules: React.PropTypes.array.isRequired,
    onSelect: React.PropTypes.func.isRequired,
    onOpen: React.PropTypes.func.isRequired,
    onChange: React.PropTypes.func.isRequired,
    ship: React.PropTypes.object.isRequired,
    selected: React.PropTypes.bool,
    warning: React.PropTypes.func,
  };

  /**
   * Render the slot
   * @return {React.Component} Slot component
   */
  render() {
    let { termtip, tooltip } = this.context;
    let { translate, formats, units } = this.context.language;
    let { modules, slot, warning, onSelect, onChange, ladenMass, ship } = this.props;
    let m = slot.m;
    let classRating = m.class + m.rating;
    let menu;
    let validMods = m == null ? [] : (Modifications.validity[m.grp] || []);

    if (this.props.selected) {
      menu = <AvailableModulesMenu
        className='standard'
        modules={modules}
        shipMass={ship.ladenMass}
        m={m}
        onSelect={onSelect}
        warning={warning}
        diffDetails={diffDetails.bind(ship, this.context.language)}
      />;
    }

    if (this.props.selected) {
      menu = <ModificationsMenu
        className='standard'
	onChange={onChange}
        ship={ship}
        m={m}
      />;
    }

    return (
      <div className={cn('slot', { selected: this.props.selected })} onClick={this.props.onOpen} onContextMenu={stopCtxPropagation}>
        <div className={cn('details-container', { warning: warning && warning(slot.m) })}>
          <div className={'sz'}>{slot.maxClass}</div>
          <div>
            <div className='l'>{classRating} {translate(m.grp == 'bh' ? m.grp : m.name || m.grp)}</div>
            <div className={'r'}>{formats.round1(m.getMass()) || m.fuel || 0}{units.T}</div>
	    <div/>
            <div className={'cb'}>
                { m.grp == 'bh' && m.name ? <div className='l'>{translate(m.name)}</div> : null }
                { m.getOptimalMass() ? <div className='l'>{translate('optimal mass')}: {m.getOptimalMass()}{units.T}</div> : null }
                { m.getMaxMass() ? <div className='l'>{translate('max mass')}: {m.getMaxMass()}{units.T}</div> : null }
                { m.getRange() ? <div className='l'>{translate('range')}: {m.getRange()}{units.km}</div> : null }
                { m.time ? <div className='l'>{translate('time')}: {formats.time(m.time)}</div> : null }
                { m.getThermalEfficiency() ? <div className='l'>{translate('efficiency')}: {m.getThermalEfficiency()}</div> : null }
                { m.getPowerGeneration() > 0 ? <div className='l'>{translate('power')}: {formats.round(m.getPowerGeneration())}{units.MW}</div> : null }
                { m.getMaxFuelPerJump() ? <div className='l'>{translate('max')} {translate('fuel')}: {m.getMaxFuelPerJump()}{units.T}</div> : null }
                { m.getWeaponsCapacity() ? <div className='l'>{translate('WEP')}: {m.getWeaponsCapacity()}{units.MJ} / {m.getWeaponsRechargeRate()}{units.MW}</div> : null }
                { m.getSystemsCapacity() ? <div className='l'>{translate('SYS')}: {m.getSystemsCapacity()}{units.MJ} / {m.getSystemsRechargeRate()}{units.MW}</div> : null }
                { m.getEnginesCapacity() ? <div className='l'>{translate('ENG')}: {m.getEnginesCapacity()}{units.MJ} / {m.getEnginesRechargeRate()}{units.MW}</div> : null }
            </div>
          </div>
        </div>
        {menu}
      </div>
    );
	        // { validMods.length > 0 ? <div className='r' ><button onClick={this._showModificationsMenu.bind(this, m)} onContextMenu={stopCtxPropagation} onMouseOver={termtip.bind(null, 'modifications')} onMouseOut={tooltip.bind(null, null)}><ListModifications /></button></div> : null }
  }
}
