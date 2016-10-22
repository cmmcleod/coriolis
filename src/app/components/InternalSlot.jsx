import React from 'react';
import Slot from './Slot';
import { Infinite } from './SvgIcons';

/**
 * Internal Slot
 */
export default class InternalSlot extends Slot {

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
      let classRating = m.class + m.rating;
      let { drag, drop } = this.props;

      return <div className='details' draggable='true' onDragStart={drag} onDragEnd={drop}>
        <div className={'cb'}>
          <div className={'l'}>{classRating} {translate(m.name || m.grp)}</div>
          <div className={'r'}>{m.mass || m.cargo || m.fuel || 0}{u.T}</div>
        </div>
        <div className={'cb'}>
          { m.optmass ? <div className={'l'}>{translate('optimal mass')}: {m.optmass}{u.T}</div> : null }
          { m.maxmass ? <div className={'l'}>{translate('max mass')}: {m.maxmass}{u.T}</div> : null }
          { m.bins ? <div className={'l'}>{m.bins} <u>{translate('bins')}</u></div> : null }
          { m.bays ? <div className={'l'}>{translate('bays')}: {m.bays}</div> : null }
          { m.rate ? <div className={'l'}>{translate('rate')}: {m.rate}{u.kgs}&nbsp;&nbsp;&nbsp;{translate('refuel time')}: {formats.time(this.props.fuel * 1000 / m.rate)}</div> : null }
          { m.ammo ? <div className={'l'}>{translate('ammo')}: {formats.gen(m.ammo)}</div> : null }
          { m.cells ? <div className={'l'}>{translate('cells')}: {m.cells}</div> : null }
          { m.recharge ? <div className={'l'}>{translate('recharge')}: {m.recharge} <u>MJ</u>&nbsp;&nbsp;&nbsp;{translate('total')}: {m.cells * m.recharge}{u.MJ}</div> : null }
          { m.repair ? <div className={'l'}>{translate('repair')}: {m.repair}</div> : null }
          { m.range ? <div className={'l'}>{translate('range')} {m.range}{u.km}</div> : null }
          { m.time ? <div className={'l'}>{translate('time')}: {formats.time(m.time)}</div> : null }
          { m.maximum ? <div className={'l'}>{translate('max')}: {(m.maximum)}</div> : null }
          { m.rangeLS ? <div className={'l'}>{translate('range')}: {m.rangeLS}{u.Ls}</div> : null }
          { m.rangeLS === null ? <div className={'l'}>∞{u.Ls}</div> : null }
          { m.rangeRating ? <div className={'l'}>{translate('range')}: {m.rangeRating}</div> : null }
          { m.armouradd ? <div className={'l'}>+{m.armouradd} <u className='cap'>{translate('armour')}</u></div> : null }
        </div>
      </div>;
    } else {
      return <div className={'empty'}>{translate('empty')}</div>;
    }
  }
}
