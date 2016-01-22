import React from 'react';
import TranslatedComponent from './TranslatedComponent';
import { wrapCtxMenu } from '../utils/UtilityFunctions';
import { Equalizer } from '../components/SvgIcons';
import cn from 'classnames';

/**
 * Abstract Slot Section
 */
export default class SlotSection extends TranslatedComponent {

  static propTypes = {
    ship: React.PropTypes.object.isRequired,
    onChange: React.PropTypes.func.isRequired,
    code: React.PropTypes.string.isRequired,
    togglePwr: React.PropTypes.func
  };

  /**
   * Constructor
   * @param  {Object} props   React Component properties
   * @param  {Object} context React Component context
   * @param  {string} sectionId   Section DOM Id
   * @param  {string} sectionName Section name
   */
  constructor(props, context, sectionId, sectionName) {
    super(props);
    this.sectionId = sectionId;
    this.sectionName = sectionName;

    this._getSlots = this._getSlots.bind(this);
    this._selectModule = this._selectModule.bind(this);
    this._getSectionMenu = this._getSectionMenu.bind(this);
    this._contextMenu = this._contextMenu.bind(this);
    this._drop = this._drop.bind(this);
    this._dragOverNone = this._dragOverNone.bind(this);
    this._close = this._close.bind(this);
    this.state = {};
  }

  // Must be implemented by subclasses:
  //  _getSlots()
  //  _getSectionMenu()
  //  _contextMenu()

  /**
   * Open a menu
   * @param  {string} menu    Menu name
   * @param  {SyntheticEvent} event Event
   */
  _openMenu(menu, event) {
    event.stopPropagation();
    if (this.props.currentMenu === menu) {
      menu = null;
    }

    this.context.openMenu(menu);
  }

  /**
   * Mount/Use the specified module in the slot
   * @param  {Object} slot Slot
   * @param  {Object} m    Selected module
   */
  _selectModule(slot, m) {
    this.props.ship.use(slot, m);
    this.props.onChange();
    this._close();
  }

  /**
   * Slot Drag Handler
   * @param  {object} originSlot Origin slot model
   * @param  {Event} e           Drag Event
   */
  _drag(originSlot, e) {
    e.dataTransfer.setData('text/html', e.currentTarget);
    e.dataTransfer.effectAllowed = 'all';
    this.setState({ originSlot });
    this._close();
  }

  /**
   * Slot Drag Over Handler
   * @param  {object} targetSlot Potential drop target
   * @param  {Event} e           Drag Event
   */
  _dragOverSlot(targetSlot, e) {
    e.preventDefault();
    e.stopPropagation();
    let os = this.state.originSlot;
    if (os) {
      console.log('has origin');
      e.dataTransfer.dropEffect = os != targetSlot && targetSlot.maxClass >= os.m.class ? 'copyMove' : 'none';
      this.setState({ targetSlot });
    } else {
      e.dataTransfer.dropEffect = 'none';
    }
  }

  /**
   * Drag over non-droppable target/element
   * @param  {Event} e   Drag Event
   */
  _dragOverNone(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'none';
    this.setState({ targetSlot: null });
  }

  /**
   * Slot drop handler. If the target is eligible swap the origin and target modules.
   * If the target slot's current module cannot be mounted in the origin slot then
   * the origin slot will be empty.
   */
  _drop() {
    let { originSlot, targetSlot } = this.state;
    let m = originSlot.m;

    if (targetSlot && m && targetSlot.maxClass >= m.class) {
      // Swap modules if possible
      if (targetSlot.m && originSlot.maxClass >= targetSlot.m.class) {
        this.props.ship.use(originSlot, targetSlot.m, true);
      } else { // Otherwise empty the  origin slot
        this.props.ship.use(originSlot, null, true);  // Empty but prevent summary update
      }
      this.props.ship.use(targetSlot, m); // update target slot
      this.props.onChange();
    }
    this.setState({ originSlot: null, targetSlot: null });
  }

  /**
   * Determine drop eligibilty CSS class
   * @param  {Object} slot       Current slot
   * @param  {Object} originSlot Origin slot
   * @param  {Object} targetSlot Target slot
   * @return {string} CSS Class name
   */
  _dropClass(slot, originSlot, targetSlot) {
    if (!originSlot) {
      return null;
    }
    if (slot === originSlot) {
      if (targetSlot && targetSlot.m && originSlot.maxClass < targetSlot.m.class) {
        return 'dropEmpty'; // Origin slot will be emptied
      }
      return null;
    }
    if (originSlot.m && slot.maxClass >= originSlot.m.class) { // Eligble drop slot
      if (slot === targetSlot) {
        return 'drop';  // Can drop
      }
      return 'eligible';  // Potential drop slot
    }

    return 'ineligible';  // Cannot be dropped / invalid drop slot
  }

  /**
   * Toggle slot Active/Inactive
   * @param  {Object} slot Slot
   */
  _togglePwr(slot) {
    this.props.ship.setSlotEnabled(slot, !slot.enabled);
    this.props.onChange();
    this._close();
  }

  /**
   * Close current menu
   */
  _close() {
    if (this.props.currentMenu) {
      this.context.closeMenu();
    }
  }

  /**
   * Render the slot section
   * @return {React.Component} Slot section
   */
  render() {
    let translate = this.context.language.translate;
    let sectionMenuOpened = this.props.currentMenu === this.sectionName;
    let open = this._openMenu.bind(this, this.sectionName);
    let ctx = wrapCtxMenu(this._contextMenu);

    return (
      <div id={this.sectionId} className={'group'}  onDragLeave={this._dragOverNone}>
        <div className={cn('section-menu', { selected: sectionMenuOpened })} onClick={open} onContextMenu={ctx}>
          <h1>{translate(this.sectionName)} <Equalizer/></h1>
          {sectionMenuOpened ? this._getSectionMenu(translate) : null }
        </div>
        {this._getSlots()}
      </div>
    );
  }
}
