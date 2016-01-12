import React from 'react';
import { findDOMNode } from 'react-dom';
import cn from 'classnames';
import TranslatedComponent from './TranslatedComponent';
import InterfaceEvents from '../utils/InterfaceEvents';
import PowerBands from './PowerBands';
import { slotName, nameComparator } from '../utils/SlotFunctions';
import { Power, NoPower } from './SvgIcons';

const POWER = [
  null,
  null,
  <NoPower className='icon warning' />,
  <Power className='secondary-disabled' />
];

export default class PowerManagement extends TranslatedComponent {
  static PropTypes = {
    ship: React.PropTypes.object.isRequired,
    code: React.PropTypes.string.isRequired,
    onChange: React.PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this._renderPowerRows = this._renderPowerRows.bind(this);
    this._updateWidth = this._updateWidth.bind(this);
    this._sort = this._sort.bind(this);

    this.state = {
      predicate: 'n',
      desc: true,
      width: 0
    };
  }

  _sortOrder(predicate) {
    let desc = this.state.desc;

    if (predicate == this.state.predicate) {
      desc = !desc;

    } else {
      desc = true;
    }
    this.setState({ predicate, desc });
  }

  _sort(ship, predicate, desc) {
    let powerList = ship.powerList;

    switch (predicate) {
      case 'n': powerList.sort(nameComparator(this.context.language.translate)); break;
      case 't': powerList.sort((a, b) => a.type.localeCompare(b.type)); break;
      case 'pri': powerList.sort((a, b) => a.priority - b.priority);break;
      case 'pwr': powerList.sort((a, b) => (a.m ? a.m.power : 0) - (b.m ? b.m.power : 0)); break;
      case 'r': powerList.sort((a, b) => ship.getSlotStatus(a) - ship.getSlotStatus(b)); break;
      case 'd': powerList.sort((a, b) => ship.getSlotStatus(a, true) - ship.getSlotStatus(b, true)); break;
    }

    if (!desc) {
      powerList.reverse();
    }
  }

  _priority(slot, inc) {
    if (this.props.ship.setSlotPriority(slot, slot.priority + inc)) {
      this.props.onChange();
    }
  }

  _toggleEnabled(slot) {
    this.props.ship.setSlotEnabled(slot, !slot.enabled);
    this.props.onChange();
  }

  _renderPowerRows(ship, translate, pwr, pct) {

    let powerRows = [];

    for (var i = 0, l = ship.powerList.length; i < l; i++) {
      let slot = ship.powerList[i];

      if (slot.m && slot.m.power) {
        let m = slot.m;
        let toggleEnabled = this._toggleEnabled.bind(this, slot);
        let retractedElem = null, deployedElem = null;

        if (slot.enabled) {
          retractedElem = <td className='ptr upp' onClick={toggleEnabled}>{POWER[ship.getSlotStatus(slot, false)]}</td>;
          deployedElem = <td className='ptr upp' onClick={toggleEnabled}>{POWER[ship.getSlotStatus(slot, true)]}</td>;
        } else {
          retractedElem = <td className='ptr disabled upp' colSpan='2' onClick={toggleEnabled}>{translate('disabled')}</td>;
        }

        powerRows.push(<tr key={i} className={cn('highlight', { disabled: !slot.enabled })}>
          <td className='ptr' style={{ width: '1em' }} onClick={toggleEnabled}>{m.class + m.rating}</td>
          <td className='ptr le shorten cap' onClick={toggleEnabled}>{slotName(translate, slot)}</td>
          <td className='ptr' onClick={toggleEnabled}><u>{translate(slot.type)}</u></td>
          <td>
            <span className='flip ptr' onClick={this._priority.bind(this, slot, -1)}>&#9658;</span>
            {' ' + (slot.priority + 1) + ' '}
            <span className='ptr' onClick={this._priority.bind(this, slot, 1)}>&#9658;</span>
          </td>
          <td className='ri ptr' style={{ width: '3.25em'}} onClick={toggleEnabled}>{pwr(m.power)}</td>
          <td className='ri ptr' style={{ width: '3em' }} onClick={toggleEnabled}><u>{pct(m.power / ship.powerAvailable)}</u></td>
          {retractedElem}
          {deployedElem}
        </tr>);
      }
    }
    return powerRows;
  }

  _updateWidth() {
    this.setState({ width: findDOMNode(this).offsetWidth });
  }

  componentWillMount(){
    this._sort(this.props.ship, this.state.predicate, this.state.desc);
    this.resizeListener = InterfaceEvents.addListener('windowResized', this._updateWidth);
  }

  componentDidMount() {
    this._updateWidth();
  }

  componentWillUpdate(nextProps, nextState) {
    // Can optimize this later: only sort when
    // - predicate/desc changes
    // - modules/language change AND sorting by type, name
    // - power changes and sorting by pwr
    // - enabled/disabled changes and sorting by priority
    this._sort(nextProps.ship, nextState.predicate, nextState.desc);
  }

  componentWillUnmount(){
    this.resizeListener.remove();
  }

  render() {
    let { ship, code } = this.props;
    let { translate, formats } = this.context.language;
    let pwr = formats.f2;
    let pp = ship.standard[0].m;
    let sortOrder = this._sortOrder;

    return (
      <div className='group half' id='componentPriority'>
        <table style={{ width: '100%' }}>
          <thead>
            <tr className='main'>
              <th colSpan='2' className='sortable le' onClick={sortOrder.bind(this, 'n')} >{translate('module')}</th>
              <th style={{ width: '3em' }} className='sortable' onClick={sortOrder.bind(this, 't')} >{translate('type')}</th>
              <th style={{ width: '4em' }} className='sortable' onClick={sortOrder.bind(this, 'pri')} >{translate('pri')}</th>
              <th colSpan='2' className='sortable' onClick={sortOrder.bind(this, 'pwr')} >{translate('PWR')}</th>
              <th style={{ width: '3em' }} className='sortable' onClick={sortOrder.bind(this, 'r')} >{translate('ret')}</th>
              <th style={{ width: '3em' }} className='sortable' onClick={sortOrder.bind(this, 'd')} >{translate('dep')}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{pp.class + pp.rating}</td>
              <td className='le shorten cap' >{translate('pp')}</td>
              <td><u >{translate('SYS')}</u></td>
              <td>1</td>
              <td className='ri'>{pwr(pp.pGen)}</td>
              <td className='ri'><u>100%</u></td>
              <td></td>
              <td></td>
            </tr>
            <tr><td style={{ lineHeight:0 }} colSpan='8'><hr style={{ margin: '0 0 3px', background: '#ff8c0d', border: 0, height: 1 }} /></td></tr>
            {this._renderPowerRows(ship, translate, pwr, formats.pct1)}
          </tbody>
        </table>
        <PowerBands width={this.state.width} code={code} available={ship.standard[0].m.pGen} bands={ship.priorityBands} />
      </div>
    );
  }
}
