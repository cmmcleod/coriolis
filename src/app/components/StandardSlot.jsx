import React from 'react';
import cn from 'classnames';
import Persist from '../stores/Persist';
import TranslatedComponent from './TranslatedComponent';
import { diffDetails } from '../utils/SlotFunctions';
import AvailableModulesMenu from './AvailableModulesMenu';
import ModificationsMenu from './ModificationsMenu';
import { ListModifications, Modified } from './SvgIcons';
import { Modifications } from 'coriolis-data/dist';
import { stopCtxPropagation } from '../utils/UtilityFunctions';
import { blueprintTooltip } from '../utils/BlueprintFunctions';

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
    let { modules, slot, selected, warning, onSelect, onChange, ship } = this.props;
    let m = slot.m;
    let classRating = m.class + m.rating;
    let menu;
    let validMods = m == null ? [] : (Modifications.modules[m.grp].modifications || []);
    let showModuleResistances = Persist.showModuleResistances();
    let mass = m.getMass() || m.cargo || m.fuel || 0;

    // Modifications tooltip shows blueprint and grade, if available
    let modTT = translate('modified');
    if (m && m.blueprint && m.blueprint.name) {
      modTT = translate(m.blueprint.name) + ' ' + translate('grade') + ' ' + m.blueprint.grade;
      modTT = (
          <div>
            <div>{modTT}</div>
            {blueprintTooltip(translate, m.blueprint.grades[m.blueprint.grade].features, m)}
          </div>
        );
    }

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
            <div className={'l'}>{classRating} {translate(m.name || m.grp)}{m.mods && Object.keys(m.mods).length > 0 ? <span className='r' onMouseOver={termtip.bind(null, modTT)} onMouseOut={tooltip.bind(null, null)}><Modified /></span> : null }</div>
            <div className={'r'}>{formats.round(mass)}{units.T}</div>
	    <div/>
            <div className={'cb'}>
                { m.getMinMass() ? <div className='l'>{translate('minimum mass')}: {formats.int(m.getMinMass())}{units.T}</div> : null }
                { m.getOptMass() ? <div className='l'>{translate('optimal mass')}: {formats.int(m.getOptMass())}{units.T}</div> : null }
                { m.getMaxMass() ? <div className='l'>{translate('max mass')}: {formats.int(m.getMaxMass())}{units.T}</div> : null }
                { m.getRange() ? <div className='l'>{translate('range')}: {formats.f2(m.getRange())}{units.km}</div> : null }
                { m.time ? <div className='l'>{translate('time')}: {formats.time(m.time)}</div> : null }
                { m.getThermalEfficiency() ? <div className='l'>{translate('efficiency')}: {formats.f2(m.getThermalEfficiency())}</div> : null }
                { m.getPowerGeneration() > 0 ? <div className='l'>{translate('pgen')}: {formats.f1(m.getPowerGeneration())}{units.MW}</div> : null }
                { m.getMaxFuelPerJump() ? <div className='l'>{translate('max')} {translate('fuel')}: {formats.f1(m.getMaxFuelPerJump())}{units.T}</div> : null }
                { m.getWeaponsCapacity() ? <div className='l'>{translate('WEP')}: {formats.f1(m.getWeaponsCapacity())}{units.MJ} / {formats.f1(m.getWeaponsRechargeRate())}{units.MW}</div> : null }
                { m.getSystemsCapacity() ? <div className='l'>{translate('SYS')}: {formats.f1(m.getSystemsCapacity())}{units.MJ} / {formats.f1(m.getSystemsRechargeRate())}{units.MW}</div> : null }
                { m.getEnginesCapacity() ? <div className='l'>{translate('ENG')}: {formats.f1(m.getEnginesCapacity())}{units.MJ} / {formats.f1(m.getEnginesRechargeRate())}{units.MW}</div> : null }
                { showModuleResistances && m.getExplosiveResistance() ? <div className='l'>{translate('explres')}: {formats.pct(m.getExplosiveResistance())}</div> : null }
                { showModuleResistances && m.getKineticResistance() ? <div className='l'>{translate('kinres')}: {formats.pct(m.getKineticResistance())}</div> : null }
                { showModuleResistances && m.getThermalResistance() ? <div className='l'>{translate('thermres')}: {formats.pct(m.getThermalResistance())}</div> : null }
                { m.getIntegrity() ? <div className='l'>{translate('integrity')}: {formats.int(m.getIntegrity())}</div> : null }
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
