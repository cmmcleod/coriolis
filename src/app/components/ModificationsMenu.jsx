import React from 'react';
import { findDOMNode } from 'react-dom';
import NumericInput from 'react-numeric-input';
import TranslatedComponent from './TranslatedComponent';
import { stopCtxPropagation } from '../utils/UtilityFunctions';
import cn from 'classnames';
import { MountFixed, MountGimballed, MountTurret } from './SvgIcons';
import { Modifications } from 'coriolis-data/dist';
import ModSlider from './ModSlider';

const PRESS_THRESHOLD = 500; // mouse/touch down threshold

/**
 * Modifications menu
 */
export default class ModificationsMenu extends TranslatedComponent {

  static propTypes = {
    ship: React.PropTypes.object.isRequired,
    m: React.PropTypes.object.isRequired,
    onChange: React.PropTypes.func.isRequired
  };

  /**
   * Constructor
   * @param  {Object} props   React Component properties
   * @param  {Object} context React Component context
   */
  constructor(props, context) {
    super(props);
    this.state = this._initState(props, context);
  }

  /**
   * Initiate the list of modifications
   * @param  {Object} props   React Component properties
   * @param  {Object} context React Component context
   * @return {Object}         list: Array of React Components
   */
  _initState(props, context) {
    let translate = context.language.translate;
    let formats = context.language.formats;
    let { m  } = props;
    let list = [];

    for (let modId of Modifications.validity[m.grp]) {
      list.push(<div className={'cb'} key={modId}>
		  <div className={'l'}>{translate(Modifications.modifiers[modId].name)}</div>
		  <span className={'r'}>{formats.pct(m.getModValue(modId) || 0)}</span>
		  <ModSlider className={'cb'} percent={this._getSliderPercent(modId)} onChange={this._updateValue.bind(this, modId)} />
                </div>);
    }
		  //<NumericInput className={'r'} min={-100} max={100} step={0.1} precision={2} value={m.getModValue(modId) * 100} onChange={this._updateValue.bind(this, modId)} />

    return { list };
  }

  /**
   * Generate React Components for Module Group
   * @param  {Function} translate   Translate function
   * @param  {Objecy} mountedModule Mounted Module
   * @param  {Funciton} warningFunc Warning function
   * @param  {number} mass          Mass
   * @param  {function} onSelect    Select/Mount callback
   * @param  {string} grp           Group name
   * @param  {Array} modules        Available modules
   * @return {React.Component}      Available Module Group contents
   */
  _buildGroup(translate, mountedModule, warningFunc, mass, onSelect, grp, modules) {
    let prevClass = null, prevRating = null;
    let elems = [];

    for (let i = 0; i < modules.length; i++) {
      let m = modules[i];
      let mount = null;
      let disabled = m.maxmass && (mass + (m.mass ? m.mass : 0)) > m.maxmass;
      let active = mountedModule && mountedModule === m;
      let classes = cn(m.name ? 'lc' : 'c', {
        warning: !disabled && warningFunc && warningFunc(m),
        active,
        disabled
      });
      let eventHandlers;

      if (disabled || active) {
        eventHandlers = {};
      } else {
        let showDiff = this._showDiff.bind(this, mountedModule, m);
        let select = onSelect.bind(null, m);

        eventHandlers = {
          onMouseEnter: this._over.bind(this, showDiff),
          onTouchStart: this._touchStart.bind(this, showDiff),
          onTouchEnd: this._touchEnd.bind(this, select),
          onMouseLeave: this._hideDiff,
          onClick: select
        };
      }

      switch(m.mount) {
        case 'F': mount = <MountFixed className={'lg'} />; break;
        case 'G': mount = <MountGimballed className={'lg'}/>; break;
        case 'T': mount = <MountTurret className={'lg'}/>; break;
      }

      if (i > 0 && modules.length > 3 && m.class != prevClass && (m.rating != prevRating || m.mount) && m.grp != 'pa') {
        elems.push(<br key={'b' + m.grp + i} />);
      }

      elems.push(
        <li key={m.id} className={classes} {...eventHandlers}>
          {mount}
          {(mount ? ' ' : '') + m.class + m.rating + (m.missile ? '/' + m.missile : '') + (m.name ? ' ' + translate(m.name) : '')}
        </li>
      );
      prevClass = m.class;
      prevRating = m.rating;
    }

    return <ul key={'modules' + grp} >{elems}</ul>;
  }


  /**
   * Touch Start - Show diff after press, otherwise treat as tap
   * @param  {Function} showDiff diff tooltip callback
   * @param  {SyntheticEvent} event Event
   */
  _touchStart(showDiff, event) {
    event.preventDefault();
    let rect = event.currentTarget.getBoundingClientRect();
    this.touchTimeout = setTimeout(showDiff.bind(this, rect), PRESS_THRESHOLD);
  }

  /**
   * Touch End - Select module on tap
   * @param  {Function} select Select module callback
   * @param  {SyntheticEvent} event Event
   */
  _touchEnd(select, event) {
    event.preventDefault();
    if (this.touchTimeout !== null) {  // If timeout has not fired (been nulled out) yet
      select();
    }
  }

  /**
   * Scroll to mounted (if it exists) module group on mount
   */
  componentDidMount() {
    if (this.groupElem) {  // Scroll to currently selected group
      findDOMNode(this).scrollTop = this.groupElem.offsetTop;
    }
  }

  /**
   * Update state based on property and context changes
   * @param  {Object} nextProps   Incoming/Next properties
   * @param  {Object} nextContext Incoming/Next conext
   */
  componentWillReceiveProps(nextProps, nextContext) {
    this.setState(this._initState(nextProps, nextContext));
  }


  /**
   * Update modification given a value.
   * @param {Number} modId The ID of the modification
   * @param {Number} value The value to set, in the range [0,1]
   */
  _updateValue(modId, value) {
    let scaledValue = (value - 0.5) * 2;
    let m = this.props.m;
    let ship = this.props.ship;
    ship.setModification(m, modId, scaledValue);
    this.props.onChange();
  }

  /**
   * Obtain slider value from a modification.
   * @param {Number} modId The ID of the modification
   * @return {Number} value The value of the slider, in the range [0,1]
   */
  _getSliderPercent(modId) {
    let m = this.props.m;
    if (m.getModValue(modId)) {
      return (m.getModValue(modId) / 2) + 0.5;
    }
    return 0.5;
  }

  /**
   * Render the list
   * @return {React.Component} List
   */
  render() {
    return (
      <div
          className={cn('select', this.props.className)}
          onClick={(e) => e.stopPropagation() }
          onContextMenu={stopCtxPropagation}
      >
        {this.state.list}
      </div>
    );
  }

}
