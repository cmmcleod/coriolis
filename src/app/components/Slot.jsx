import React from 'react';
import TranslatedComponent from './TranslatedComponent';
import cn from 'classnames';
import AvailableModulesMenu from './AvailableModulesMenu';
import { wrapCtxMenu } from '../utils/InterfaceEvents';

export default class Slot extends TranslatedComponent {

  static propTypes = {
    availableModules: React.PropTypes.func.isRequired,
    onSelect: React.PropTypes.func.isRequired,
    onOpen: React.PropTypes.func.isRequired,
    maxClass: React.PropTypes.number.isRequired,
    selected: React.PropTypes.bool,
    m: React.PropTypes.object,
    shipMass: React.PropTypes.number,
    warning: React.PropTypes.func,
  };

  constructor(props) {
    super(props);

    this._contextMenu = wrapCtxMenu(this._contextMenu.bind(this));
    this._getMaxClassLabel = this._getMaxClassLabel.bind(this);
  }

  // Must be implemented by subclasses:
  // _getSlotDetails()

  _getClassNames() {
    return null;
  }

  /**
   * Get the label for the slot size/class
   * Should be overriden if necessary
   * @return {string} label
   */
  _getMaxClassLabel() {
    return this.props.maxClass;
  }

  _contextMenu(event) {
    this.props.onSelect(null,null);
  }

  render() {
    let language = this.context.language;
    let translate = language.translate;
    let m = this.props.m;
    let slotDetails, menu;

    if (m) {
      slotDetails = this._getSlotDetails(m, translate, language.formats, language.units);  // Must be implemented by sub classes
    } else {
      slotDetails = <div className={'empty'}>{translate('empty')}</div>;
    }

    if (this.props.selected) {
      menu = <AvailableModulesMenu
        className={this._getClassNames()}
        modules={this.props.availableModules()}
        shipMass={this.props.shipMass}
        m={m}
        onSelect={this.props.onSelect}
        warning={this.props.warning}
      />;
    }

    return (
      <div className={cn('slot', {selected: this.props.selected})} onClick={this.props.onOpen} onContextMenu={this._contextMenu}>
        <div className={'details'}>
          <div className={'sz'}>{this._getMaxClassLabel(translate)}</div>
          {slotDetails}
        </div>
        {menu}
      </div>
    );
  }
}
