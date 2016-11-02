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
   * Construct the slot
   * @param {object} props Object properties
   */
  constructor(props) {
    super(props);
    this._modificationsSelected = false;
  }

  /**
   * Render the slot
   * @return {React.Component} Slot component
   */
  render() {
    let { termtip, tooltip } = this.context;
    let { translate, formats, units } = this.context.language;
    let { modules, slot, selected, warning, onSelect, onChange, ladenMass, ship } = this.props;
    let m = slot.m;
    let classRating = m.class + m.rating;
    let menu;
    let validMods = m == null ? [] : (Modifications.validity[m.grp] || []);
    let mass = m.getMass() || m.cargo || m.fuel || 0;

    if (!selected) {
      // If not selected then sure that modifications flag is unset
      this._modificationsSelected = false;
    }

    if (selected) {
      if (this._modificationsSelected) {
        menu = <ModificationsMenu
          className='standard'
          onChange={onChange}
          ship={ship}
          m={m}
        />;
      } else {
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
    }

    return (
      <div className={cn('slot', { selected: this.props.selected })} onClick={this.props.onOpen} onContextMenu={stopCtxPropagation}>
        <div className={cn('details-container', { warning: warning && warning(slot.m) })}>
          <div className={'sz'}>{slot.maxClass}</div>
          <div>
            <div className='l'>{classRating} {translate(m.grp == 'bh' ? m.grp : m.name || m.grp)}</div>
            <div className={'r'}>{formats.round1(mass)}{units.T}</div>
	    <div/>
            <div className={'cb'}>
                { m.grp == 'bh' && m.name ? <div className='l'>{translate(m.name)}</div> : null }
                { m.getOptimalMass() ? <div className='l'>{translate('optimal mass')}: {formats.int(m.getOptimalMass())}{units.T}</div> : null }
                { m.getMaxMass() ? <div className='l'>{translate('max mass')}: {formats.int(m.getMaxMass())}{units.T}</div> : null }
                { m.getRange() ? <div className='l'>{translate('range')}: {formats.f2(m.getRange())}{units.km}</div> : null }
                { m.time ? <div className='l'>{translate('time')}: {formats.time(m.time)}</div> : null }
                { m.getThermalEfficiency() ? <div className='l'>{translate('efficiency')}: {formats.f2(m.getThermalEfficiency())}</div> : null }
                { m.getPowerGeneration() > 0 ? <div className='l'>{translate('pGen')}: {formats.f1(m.getPowerGeneration())}{units.MW}</div> : null }
                { m.getMaxFuelPerJump() ? <div className='l'>{translate('max')} {translate('fuel')}: {formats.f1(m.getMaxFuelPerJump())}{units.T}</div> : null }
                { m.getWeaponsCapacity() ? <div className='l'>{translate('WEP')}: {formats.f1(m.getWeaponsCapacity())}{units.MJ} / {formats.f1(m.getWeaponsRechargeRate())}{units.MW}</div> : null }
                { m.getSystemsCapacity() ? <div className='l'>{translate('SYS')}: {formats.f1(m.getSystemsCapacity())}{units.MJ} / {formats.f1(m.getSystemsRechargeRate())}{units.MW}</div> : null }
                { m.getEnginesCapacity() ? <div className='l'>{translate('ENG')}: {formats.f1(m.getEnginesCapacity())}{units.MJ} / {formats.f1(m.getEnginesRechargeRate())}{units.MW}</div> : null }

	        { validMods.length > 0 ? <div className='r' ><button onClick={this._toggleModifications.bind(this)} onContextMenu={stopCtxPropagation} onMouseOver={termtip.bind(null, 'modifications')} onMouseOut={tooltip.bind(null, null)}><ListModifications /></button></div> : null }
            </div>
          </div>
        </div>
        {menu}
      </div>
    );
  }

  /**
   * Toggle the modifications flag when selecting the modifications icon
   */
  _toggleModifications() {
    this._modificationsSelected = !this._modificationsSelected;
  }
}
