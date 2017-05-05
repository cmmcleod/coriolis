import React from 'react';
import PropTypes from 'prop-types';
import TranslatedComponent from './TranslatedComponent';
import cn from 'classnames';
import AvailableModulesMenu from './AvailableModulesMenu';
import ModificationsMenu from './ModificationsMenu';
import { diffDetails } from '../utils/SlotFunctions';
import { wrapCtxMenu } from '../utils/UtilityFunctions';
import { stopCtxPropagation } from '../utils/UtilityFunctions';

/**
 * Abstract Slot
 */
export default class Slot extends TranslatedComponent {

  static propTypes = {
    availableModules: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired,
    onOpen: PropTypes.func.isRequired,
    maxClass: PropTypes.number.isRequired,
    selected: PropTypes.bool,
    m: PropTypes.object,
    ship: PropTypes.object.isRequired,
    eligible: PropTypes.object,
    warning: PropTypes.func,
    drag: PropTypes.func,
    drop: PropTypes.func,
    dropClass: PropTypes.string
  };

  /**
   * Constructor
   * @param  {Object} props   React Component properties
   */
  constructor(props) {
    super(props);

    this._modificationsSelected = false;

    this._contextMenu = wrapCtxMenu(this._contextMenu.bind(this));
    this._getMaxClassLabel = this._getMaxClassLabel.bind(this);
  }

  // Must be implemented by subclasses:
  // _getSlotDetails()

  /**
   * Get the CSS class name for the slot. Can/should be overriden
   * as necessary.
   * @return {string} CSS Class name
   */
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

  /**
   * Empty slot on right-click
   * @param  {SyntheticEvent} event Event
   */
  _contextMenu(event) {
    event.stopPropagation();
    event.preventDefault();
    this.props.onSelect(null,null);
  }

  /**
   * Render the slot
   * @return {React.Component} The slot
   */
  render() {
    let language = this.context.language;
    let translate = language.translate;
    let { ship, m, dropClass, dragOver, onOpen, onChange, selected, eligible, onSelect, warning, availableModules } = this.props;
    let slotDetails, modificationsMarker, menu;

    if (!selected) {
      // If not selected then sure that modifications flag is unset
      this._modificationsSelected = false;
    }

    if (m) {
      slotDetails = this._getSlotDetails(m, translate, language.formats, language.units);  // Must be implemented by sub classes
      modificationsMarker = JSON.stringify(m);
    } else {
      slotDetails = <div className={'empty'}>{translate(eligible ? 'emptyrestricted' : 'empty')}</div>;
      modificationsMarker = '';
    }

    if (selected) {
      if (this._modificationsSelected) {
        menu = <ModificationsMenu
          className={this._getClassNames()}
          onChange={onChange}
          ship={ship}
          m={m}
          marker={modificationsMarker}
        />;
      } else {
        menu = <AvailableModulesMenu
          className={this._getClassNames()}
          modules={availableModules()}
          shipMass={ship.hullMass}
          m={m}
          onSelect={onSelect}
          warning={warning}
          diffDetails={diffDetails.bind(ship, this.context.language)}
        />;
      }
    }

    // TODO: implement touch dragging

    return (
      <div className={cn('slot', dropClass, { selected })} onClick={onOpen} onContextMenu={this._contextMenu} onDragOver={dragOver}>
        <div className='details-container'>
          <div className='sz'>{this._getMaxClassLabel(translate)}</div>
            {slotDetails}
  	  </div>
        {menu}
      </div>
    );
  }

  /**
   * Toggle the modifications flag when selecting the modifications icon
   */
  _toggleModifications() {
    this._modificationsSelected = !this._modificationsSelected;
  }
}
