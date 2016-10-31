import React from 'react';
import Slot from './Slot';
import { DamageKinetic, DamageThermal, DamageExplosive, MountFixed, MountGimballed, MountTurret, ListModifications } from './SvgIcons';
import { Modifications } from 'coriolis-data/dist';
import { stopCtxPropagation } from '../utils/UtilityFunctions';


/**
 * Hardpoint / Utility Slot
 */
export default class HardpointSlot extends Slot {

  /**
   * Get the CSS class name for the slot.
   * @return {string} CSS Class name
   */
  _getClassNames() {
    return this.props.maxClass > 0 ? 'hardpoint' : null;
  }

  /**
   * Get the label for the slot
   * @param  {Function} translate   Translate function
   * @return {string}               Label
   */
  _getMaxClassLabel(translate) {
    return translate(['U','S','M','L','H'][this.props.maxClass]);
  }

  /**
   * Generate the slot contents
   * @param  {Object} m             Mounted Module
   * @param  {Function} translate   Translate function
   * @param  {Object} formats       Localized Formats map
   * @param  {Object} u             Localized Units Map
   * @return {React.Component}      Slot contents
   */
  _getSlotDetails(m, translate, formats, u) {
    if (m) {
      let classRating = `${m.class}${m.rating}${m.missile ? '/' + m.missile : ''}`;
      let { drag, drop } = this.props;
      let { termtip, tooltip } = this.context;
      let validMods = Modifications.validity[m.grp] || [];

      return <div className='details' draggable='true' onDragStart={drag} onDragEnd={drop}>
        <div className={'cb'}>
          <div className={'l'}>
	  {m.mount && m.mount == 'F' ? <MountFixed /> : ''}
	  {m.mount && m.mount == 'G' ? <MountGimballed /> : ''}
	  {m.mount && m.mount == 'T' ? <MountTurret /> : ''}
	  {m.type && m.type == 'K' ? <DamageKinetic /> : ''}
	  {m.type && m.type == 'T' ? <DamageThermal /> : ''}
	  {m.type && m.type == 'KT' ? <span><DamageKinetic /><DamageThermal /></span> : ''}
	  {m.type && m.type == 'E' ? <DamageExplosive /> : ''}
          {classRating} {translate(m.name || m.grp)}</div>
          <div className={'r'}>{m.getMass()}{u.T}</div>
        </div>
        <div className={'cb'}>
          { m.getDps() ? <div className={'l'}>{translate('DPS')}: {formats.round1(m.getDps())} { m.getClip() ? <span>({formats.round1((m.getClip() * m.getDps() / m.getRoF()) / ((m.getClip() / m.getRoF()) + m.getReload())) })</span> : null }</div> : null }
          { m.getEps() ? <div className={'l'}>{translate('EPS')}: {formats.round1(m.getEps())}{u.MW} { m.getClip() ? <span>({formats.round1((m.getClip() * m.getEps() / m.getRoF()) / ((m.getClip() / m.getRoF()) + m.getReload())) }{u.MW})</span> : null }</div> : null }
          { m.getHps() ? <div className={'l'}>{translate('HPS')}: {formats.round1(m.getHps())} { m.getClip() ? <span>({formats.round1((m.getClip() * m.getHps() / m.getRoF()) / ((m.getClip() / m.getRoF()) + m.getReload())) })</span> : null }</div> : null }
          { m.getDps() && m.getEps() ? <div className={'l'}>{translate('DPE')}: {formats.round1(m.getDps() / m.getEps())}</div> : null }
          { m.getRoF() ? <div className={'l'}>{translate('ROF')}: {m.getRoF()}{u.ps}</div> : null }
          { m.getRange() && !m.getDps() ? <div className={'l'}>{translate('Range')} : {formats.round(m.getRange() / 1000)}{u.km}</div> : null }
          { m.getShieldMul() ? <div className={'l'}>+{formats.rPct(m.getShieldMul())}</div> : null }
          { m.getAmmo() ? <div className={'l'}>{translate('ammunition')}: {formats.int(m.getClip())}/{formats.int(m.getAmmo())}</div> : null }
          { m && validMods.length > 0 ? <div className='r' ><button onClick={this._toggleModifications.bind(this)} onContextMenu={stopCtxPropagation} onMouseOver={termtip.bind(null, 'modifications')} onMouseOut={tooltip.bind(null, null)}><ListModifications /></button></div> : null }
        </div>
      </div>;
    } else {
      return  <div className={'empty'}>{translate('empty')}</div>;
    }
  }
}
