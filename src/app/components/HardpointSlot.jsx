import React from 'react';
import Slot from './Slot';
import { DamageKinetic, DamageThermal, DamageExplosive, MountFixed, MountGimballed, MountTurret, Modifications } from './SvgIcons';

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
          { m.dps ? <div className={'l'}>{translate('DPS')}: {formats.round1(m.dps)} { m.clip ? <span>({formats.round1((m.clip * m.dps / m.rof) / ((m.clip / m.rof) + m.reload)) })</span> : null }</div> : null }
          { m.eps ? <div className={'l'}>{translate('EPS')}: {formats.round1(m.eps)}{u.MW} { m.clip ? <span>({formats.round1((m.clip * m.eps / m.rof) / ((m.clip / m.rof) + m.reload)) }{u.MW})</span> : null }</div> : null }
          { m.hps ? <div className={'l'}>{translate('HPS')}: {formats.round1(m.hps)} { m.clip ? <span>({formats.round1((m.clip * m.hps / m.rof) / ((m.clip / m.rof) + m.reload)) })</span> : null }</div> : null }
          { m.dps && m.eps ? <div className={'l'}>{translate('DPE')}: {formats.round1(m.dps / m.eps)}</div> : null }
          { m.rof ? <div className={'l'}>{translate('ROF')}: {m.rof}{u.ps}</div> : null }
          { m.range && !m.dps ? <div className={'l'}>{translate('Range')} : {formats.round(m.range / 1000)}{u.km}</div> : null }
          { m.shieldmul ? <div className={'l'}>+{formats.rPct(m.shieldmul)}</div> : null }
          { m.ammo >= 0 ? <div className={'l'}>{translate('ammo')}: {formats.int(m.clip)}/{formats.int(m.ammo)}</div> : null }
	  <div className={'r'}><Modifications /></div>
        </div>
      </div>;
    } else {
      return  <div className={'empty'}>{translate('empty')}</div>;
    }
  }
}
