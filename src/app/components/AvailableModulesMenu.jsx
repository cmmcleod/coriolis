import React from 'react';
import { findDOMNode } from 'react-dom';
import TranslatedComponent from './TranslatedComponent';
import { stopCtxPropagation } from '../utils/UtilityFunctions';
import cn from 'classnames';
import { MountFixed, MountGimballed, MountTurret } from './SvgIcons';

const PRESS_THRESHOLD = 5000; // mouse/touch down threshold

/**
 * Available modules menu
 */
export default class AvailableModulesMenu extends TranslatedComponent {

  static propTypes = {
    modules: React.PropTypes.oneOfType([React.PropTypes.object, React.PropTypes.array]).isRequired,
    onSelect: React.PropTypes.func.isRequired,
    diffDetails: React.PropTypes.func,
    m: React.PropTypes.object,
    shipMass: React.PropTypes.number,
    warning: React.PropTypes.func
  };

  static defaultProps = {
    shipMass: 0
  };

  /**
   * Constructor
   * @param  {Object} props   React Component properties
   * @param  {Object} context React Component context
   */
  constructor(props, context) {
    super(props);
    this._hideDiff = this._hideDiff.bind(this);
    this.state = this._initState(props, context);
  }

  /**
   * Initiate the list of available moduels
   * @param  {Object} props   React Component properties
   * @param  {Object} context React Component context
   * @return {Object}         list: Array of React Components, currentGroup Component if any
   */
  _initState(props, context) {
    let translate = context.language.translate;
    let { m, warning, shipMass, onSelect, modules } = props;
    let list, currentGroup;
    let buildGroup = this._buildGroup.bind(
      this,
      translate,
      m,
      warning,
      shipMass - (m && m.mass ? m.mass : 0),
      (m, event) => {
        this._hideDiff(event);
        onSelect(m);
      }
    );

    if (modules instanceof Array) {
      list = buildGroup(modules[0].grp, modules);
    } else {
      list = [];
      // At present time slots with grouped options (Hardpoints and Internal) can be empty
      list.push(<div className='empty-c upp' key='empty' onClick={onSelect.bind(null, null)} >{translate('empty')}</div>);
      for (let g in modules) {
        if (m && g == m.grp) {
          list.push(<div ref={(elem) => this.groupElem = elem} key={g} className={'select-group cap'}>{translate(g)}</div>);
        } else {
          list.push(<div key={g} className={'select-group cap'}>{translate(g)}</div>);
        }

        list.push(buildGroup(g, modules[g]));
      }
    }

    return { list, currentGroup };
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
   * Generate tooltip content for the difference between the
   * mounted module and the hovered modules
   * @param  {Object} mm    The module mounet currently
   * @param  {Object} m     The hovered module
   * @param  {DOMRect} rect DOMRect for target element
   */
  _showDiff(mm, m, rect) {
    if (this.props.diffDetails) {
      this.touchTimeout = null;
      this.context.tooltip(this.props.diffDetails(m, mm), rect);
    }
  }

  /**
   * Mouse over diff handler
   * @param  {Function} showDiff diff tooltip callback
   * @param  {SyntheticEvent} event Event
   */
  _over(showDiff, event) {
    event.preventDefault();
    showDiff(event.currentTarget.getBoundingClientRect());
  }

  /**
   * Toucch Start - Show diff after press, otherwise treat as tap
   * @param  {Function} showDiff diff tooltip callback
   * @param  {SyntheticEvent} event Event
   */
  _touchStart(showDiff, event) {
    let rect = event.currentTarget.getBoundingClientRect();
    this.touchTimeout = setTimeout(showDiff.bind(this, rect), PRESS_THRESHOLD);
  }

  /**
   * Touch End - Select module on tap
   * @param  {Function} select Select module callback
   * @param  {SyntheticEvent} event Event
   */
  _touchEnd(select, event) {
    if (this.touchTimeout !== null) {  // If timeout has not fired (been nulled out) yet
      select();
    }
    event.preventDefault();
    this._hideDiff();
  }

  /**
   * Hide diff tooltip
   * @param  {SyntheticEvent} event Event
   */
  _hideDiff(event) {
    clearTimeout(this.touchTimeout);
    this.touchTimeout = null;
    this.context.tooltip();
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
   * Render the list
   * @return {React.Component} List
   */
  render() {
    return (
      <div
          className={cn('select', this.props.className)}
          onScroll={this._hideDiff}
          onClick={(e) => e.stopPropagation() }
          onContextMenu={stopCtxPropagation}
      >
        {this.state.list}
      </div>
    );
  }

}
