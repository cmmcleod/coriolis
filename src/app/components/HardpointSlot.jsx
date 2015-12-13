import React from 'react';
import Slot from './Slot';

export default class HardpointSlot extends Slot {

  _getClassNames() {
    return this.props.maxClass > 0 ? 'hardpoint' : null;
  }

  _getMaxClassLabel(translate){
    return translate(['U','S','M','L','H'][this.props.maxClass]);
  }

  _getSlotDetails(m, translate, formats, u) {
    if (m) {
      let classRating = `${m.class}${m.rating}${m.mount ? '/' + m.mount : ''}${m.missile ? m.missile : ''}`;
      return (
        <div>
          <div className={'l'}>{classRating + ' ' + translate(m.name || m.grp)}</div>
          <div className={'r'}>{m.mass}{u.T}</div>
          <div className={'cb'}>
            { m.damage ? <div className={'l'}>{translate('damage')}: {m.damage} { m.ssdam ? <span>({formats.int(m.ssdam)} {u.MJ})</span> : null }</div> : null }
            { m.dps ? <div className={'l'}>{translate('DPS')}: {m.dps} { m.mjdps ? <span>({formats.int(m.mjdps)} {u.MJ})</span> : null }</div> : null }
            { m.thermload ? <div className={'l'}>{translate('T_LOAD')}: {m.thermload}</div> : null }
            { m.type ? <div className={'l'}>{translate('type')}: {m.type}</div> : null }
            { m.rof ? <div className={'l'}>{translate('ROF')}: {m.rof}{u.ps}</div> : null }
            { m.armourpen ? <div className={'l'}>{translate('pen')}: {m.armourpen}</div> : null }
            { m.shieldmul ? <div className={'l'}>+{formats.rPct(m.shieldmul)}</div> : null }
            { m.range ? <div className={'l'}>{m.range} <u>km</u></div> : null }
            { m.ammo >= 0 ? <div className={'l'}>{translate('ammo')}: {formats.int(m.clip)}+{formats.int(m.ammo)}</div> : null }
          </div>
        </div>
      );
    } else {
      return  <div className={'empty'}>{translate('empty')}</div>;
    }
  }
}
