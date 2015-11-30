import React from 'react';
import cn from 'classnames';
import TranslatedComponent from './TranslatedComponent';
import AvailableModulesMenu from './AvailableModulesMenu';

export default class StandardSlot extends TranslatedComponent {

  static propTypes = {
    slot: React.PropTypes.object,
    modules: React.PropTypes.oneOfType([ React.PropTypes.object, React.PropTypes.array ]).isRequired,
    onSelect: React.PropTypes.func.isRequired,
    onOpen: React.PropTypes.func.isRequired,
    selected: React.PropTypes.bool,
    shipMass: React.PropTypes.number,
    warning: React.PropTypes.func,
  };

  render() {
    let { translate, formats, units } = this.context.language;
    let slot = this.props.slot
    let m = slot.m;
    let classRating = m.class + m.rating;
    let menu;

    if (this.props.selected) {
      menu = <AvailableModulesMenu
        modules={this.props.modules}
        shipMass={this.props.shipMass}
        m={m}
        onSelect={this.props.onSelect}
        warning={this.props.warning}
      />;
    }

    return (
      <div className={cn('slot', {selected: this.props.selected})} onClick={this.props.onOpen}>
        <div className={'details'}>
          <div className={'sz'}>{slot.maxClass}</div>
          <div>
            <div className={'l'}>{classRating + ' ' + translate(m.grp)}</div>
            <div className={'r'}>{m.mass || m.capacity}{units.T}</div>
            <div className={'cb'}>
                { m.optmass ? <div className={'l'}>{translate('optimal mass') + ': '}{m.optmass}{units.T}</div> : null }
                { m.maxmass ? <div className={'l'}>{translate('max mass') + ': '}{m.maxmass}{units.T}</div> : null }
                { m.range ? <div className={'l'}>{translate('range')} {m.range}{units.km}</div> : null }
                { m.time ? <div className={'l'}>{translate('time')}: {formats.time(m.time)}</div> : null }
                { m.eff ? <div className={'l'}>{translate('efficiency')}: {m.eff}</div> : null }
                { m.pGen ? <div className={'l'}>{translate('power')}: {m.pGen}{units.MW}</div> : null }
                { m.maxfuel ? <div className={'l'}>{translate('max') + ' ' + translate('fuel') + ': '}{m.maxfuel}{units.T}</div> : null }
                { m.weaponcapacity ? <div className={'l'}>{translate('WEP')}: {m.weaponcapacity}{units.MJ} / {m.weaponrecharge}{units.MW}</div> : null }
                { m.systemcapacity ? <div className={'l'}>{translate('SYS')}: {m.systemcapacity}{units.MJ} / {m.systemrecharge}{units.MW}</div> : null }
                { m.enginecapacity ? <div className={'l'}>{translate('ENG')}: {m.enginecapacity}{units.MJ} / {m.enginerecharge}{units.MW}</div> : null }
            </div>
          </div>
        </div>
        {menu}
      </div>
    );
  }
}
