import React from 'react';
import TranslatedComponent from './TranslatedComponent';
import InterfaceEvents from '../utils/InterfaceEvents';
import { wrapCtxMenu } from '../utils/InterfaceEvents';
import { Equalizer } from '../components/SvgIcons';
import cn from 'classnames';

export default class SlotSection extends TranslatedComponent {

  static propTypes = {
    ship: React.PropTypes.object.isRequired,
    onChange: React.PropTypes.func.isRequired,
    code: React.PropTypes.string.isRequired,
    togglePwr: React.PropTypes.func
  };

  constructor(props, context, sectionId, sectionName) {
    super(props);
    this.sectionId = sectionId;
    this.sectionName = sectionName;

    this._getSlots = this._getSlots.bind(this);
    this._selectModule = this._selectModule.bind(this);
    this._getSectionMenu = this._getSectionMenu.bind(this);
    this._contextMenu = this._contextMenu.bind(this);
    this._close = this._close.bind(this);
  }

  // Must be implemented by subclasses:
  //  _getSlots()
  //  _getSectionMenu()
  //  _contextMenu()

  _openMenu(menu, event) {
    event.stopPropagation();
    if (this.props.currentMenu === menu) {
      menu = null;
    }

    InterfaceEvents.openMenu(menu);
  }

  _selectModule(slot, m) {
    this.props.ship.use(slot, m);
    this.props.onChange();
    this._close();
  }

  _togglePwr(slot) {
    this.props.ship.setSlotEnabled(slot, !slot.enabled);
    this.props.onChange();
    this._close();
  }

  _close() {
    if (this.props.currentMenu) {
      InterfaceEvents.closeMenu();
    }
  }

  render() {
    let translate = this.context.language.translate;
    let sectionMenuOpened = this.props.currentMenu === this.sectionName;
    let open = this._openMenu.bind(this, this.sectionName);
    let ctx = wrapCtxMenu(this._contextMenu);

    return (
      <div id={this.sectionId} className={'group'}>
        <div className={cn('section-menu', {selected: sectionMenuOpened})} onClick={open} onContextMenu={ctx}>
          <h1>{translate(this.sectionName)} <Equalizer/></h1>
          {sectionMenuOpened ? this._getSectionMenu(translate) : null }
        </div>
        {this._getSlots()}
      </div>
    );
  }
}
