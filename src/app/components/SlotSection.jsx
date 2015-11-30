import React from 'react';
import TranslatedComponent from './TranslatedComponent';
import InterfaceEvents from '../utils/InterfaceEvents';
import { Equalizer } from '../components/SvgIcons';
import cn from 'classnames';

export default class SlotSection extends TranslatedComponent {

  static propTypes = {
    ship: React.PropTypes.object.isRequired
  };

  constructor(props, context, sectionId, sectionName) {
    super(props);
    this.sectionId = sectionId;
    this.sectionName = sectionName;

    this._getSlots = this._getSlots.bind(this);
    this._selectModule = this._selectModule.bind(this);
    this._getSectionMenu = this._getSectionMenu.bind(this);

    this.state = {
      currentMenu: null
    }
  }

  // Must be implemented by subclasses:
  //  _getSlots()
  //  _getSectionMenu()

  _openMenu(menu) {
    this.setState({ currentMenu: menu });
    InterfaceEvents.closeAll(menu);
  }

  _closeMenu() {
    if (this.state.currentMenu) {
      this.setState({ currentMenu: null });
    }
  }

  _selectModule(index, slot, m) {
    this.props.ship.use(slot, m);
    this._closeMenu();
  }

  componentWillReceiveProps(nextProps, nextContext) {
    this.setState({ currentMenu: null });
  }

  componentWillMount() {
    this.closeAllListener = InterfaceEvents.addListener('closeAll', this._closeMenu.bind(this));
  }

  componentWillUnmount() {
    this.closeAllListener.remove();
  }

  render() {
    let translate = this.context.language.translate;
    let sectionMenuOpened = this.state.currentMenu === this.sectionName;

    return (
      <div id={this.sectionId} className={'group'}>
        <div className={cn('section-menu', {selected: sectionMenuOpened})} onClick={this._openMenu.bind(this, this.sectionName)}>
          <h1>{translate(this.sectionName)} <Equalizer/></h1>
          {sectionMenuOpened ? this._getSectionMenu(translate) : null }
        </div>
        {this._getSlots()}
      </div>
    );
  }
}
