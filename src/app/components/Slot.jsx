import React from 'react';
import TranslatedComponent from './TranslatedComponent';
import cn from 'classnames';
import AvailableModulesMenu from './AvailableModulesMenu';
import { contextMenuHandler } from '../utils/InterfaceEvents';

export default class Slot extends TranslatedComponent {

  static propTypes = {
    modules: React.PropTypes.oneOfType([ React.PropTypes.object, React.PropTypes.array ]).isRequired,
    onSelect: React.PropTypes.func.isRequired,
    onOpen: React.PropTypes.func.isRequired,
    size: React.PropTypes.number.isRequired,
    selected: React.PropTypes.bool,
    m: React.PropTypes.object,
    shipMass: React.PropTypes.number,
    warning: React.PropTypes.func,
  };

  getClassNames() {
    return null;
  }

  getSize() {
    return this.props.size;
  }

  render() {
    let language = this.context.language;
    let translate = language.translate;
    let m = this.props.m;
    let slotDetails, menu;

    if (m) {
      slotDetails = this.getSlotDetails(m, translate, language.formats, language.units);  // Must be implemented by sub classes
    } else {
      slotDetails = <div className={'empty'}>{translate('empty')}</div>;
    }

    if (this.props.selected) {
      menu = <AvailableModulesMenu
        className={this.getClassNames()}
        modules={this.props.modules}
        shipMass={this.props.shipMass}
        m={m}
        onSelect={this.props.onSelect}
        warning={this.props.warning}
      />;
    }

    return (
      <div className={cn('slot', {selected: this.props.selected})} onClick={this.props.onOpen} onContextMenu={ this.contextmenu === false ? null : contextMenuHandler(this.props.onSelect.bind(null, null))}>
        <div className={'details'}>
          <div className={'sz'}>{this.getSize(translate)}</div>
          {slotDetails}
        </div>
        {menu}
      </div>
    );
  }
}
