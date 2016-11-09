import React from 'react';
import Slot from './Slot';
import { ListModifications, Modified } from './SvgIcons';
import { Modifications } from 'coriolis-data/dist';
import { stopCtxPropagation } from '../utils/UtilityFunctions';

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
      let { drag, drop, ship } = this.props;
      let { termtip, tooltip } = this.context;
      let validMods = Modifications.validity[m.grp] || [];

      let mass = m.getMass() || m.cargo || m.fuel || 0;
      return <div className='details' draggable='true' onDragStart={drag} onDragEnd={drop}>
        <div className={'cb'}>
          <div className={'l'}>{classRating} {translate(m.name || m.grp)}{m.mods && Object.keys(m.mods).length > 0 ? <span onMouseOver={termtip.bind(null, 'modified')} onMouseOut={tooltip.bind(null, null)}><Modified /></span> : ''}</div>
          <div className={'r'}>{formats.round(mass)}{u.T}</div>
        </div>
        <div className={'cb'}>
          { m.getOptMass() ? <div className={'l'}>{translate('optimal mass')}: {formats.int(m.getOptMass())}{u.T}</div> : null }
          { m.getMaxMass() ? <div className={'l'}>{translate('max mass')}: {formats.int(m.getMaxMass())}{u.T}</div> : null }
          { m.bins ? <div className={'l'}>{m.bins} <u>{translate('bins')}</u></div> : null }
          { m.bays ? <div className={'l'}>{translate('bays')}: {m.bays}</div> : null }
          { m.rate ? <div className={'l'}>{translate('rate')}: {m.rate}{u.kgs}&nbsp;&nbsp;&nbsp;{translate('refuel time')}: {formats.time(this.props.fuel * 1000 / m.rate)}</div> : null }
          { m.getAmmo() ? <div className={'l'}>{translate('ammunition')}: {formats.gen(m.getAmmo())}</div> : null }
          { m.cells ? <div className={'l'}>{translate('cells')}: {m.cells}</div> : null }
          { m.recharge ? <div className={'l'}>{translate('recharge')}: {m.recharge} <u>MJ</u>&nbsp;&nbsp;&nbsp;{translate('total')}: {m.cells * m.recharge}{u.MJ}</div> : null }
          { m.repair ? <div className={'l'}>{translate('repair')}: {m.repair}</div> : null }
          { m.getFacingLimit() ? <div className={'l'}>{translate('facinglimit')} {formats.f1(m.getFacingLimit())}°</div> : null }
          { m.getRange() ? <div className={'l'}>{translate('range')} {formats.f2(m.getRange())}{u.km}</div> : null }
          { m.getRangeT() ? <div className={'l'}>{translate('ranget')} {formats.f1(m.getRangeT())}{u.s}</div> : null }
          { m.spinup ? <div className={'l'}>{translate('spinup')}: {formats.f1(m.spinup)}{u.s}</div> : null }
          { m.time ? <div className={'l'}>{translate('time')}: {formats.time(m.time)}</div> : null }
          { m.maximum ? <div className={'l'}>{translate('max')}: {(m.maximum)}</div> : null }
          { m.rangeLS ? <div className={'l'}>{translate('range')}: {m.rangeLS}{u.Ls}</div> : null }
          { m.rangeLS === null ? <div className={'l'}>∞{u.Ls}</div> : null }
          { m.rangeRating ? <div className={'l'}>{translate('range')}: {m.rangeRating}</div> : null }
          { m.getHullReinforcement() ? <div className={'l'}>+{formats.int(m.getHullReinforcement() + ship.baseArmour * m.getModValue('hullboost'))} <u className='cap'>{translate('armour')}</u></div> : null }
          { m.passengers ? <div className={'l'}>{translate('passengers')}: {m.passengers}</div> : null }
	  { m && validMods.length > 0 ? <div className='r' ><button onClick={this._toggleModifications.bind(this)} onContextMenu={stopCtxPropagation} onMouseOver={termtip.bind(null, 'modifications')} onMouseOut={tooltip.bind(null, null)}><ListModifications /></button></div> : null }

        </div>
      </div>;
    } else {
      return <div className={'empty'}>{translate('empty')}</div>;
    }
  }
}
