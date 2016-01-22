import React from 'react';
import { findDOMNode } from 'react-dom';
import TranslatedComponent from './TranslatedComponent';
import cn from 'classnames';
import { MountFixed, MountGimballed, MountTurret } from './SvgIcons';

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
    this.state = { list: this._initList(props, context) };
  }

  /**
   * Initiate the list of available moduels
   * @param  {Object} props   React Component properties
   * @param  {Object} context React Component context
   * @return {Array}         Array of React Components
   */
  _initList(props, context) {
    let translate = context.language.translate;
    let { m, warning, shipMass, onSelect, modules } = props;
    let list;
    let buildGroup = this._buildGroup.bind(
      this,
      translate,
      m,
      warning,
      shipMass - (m && m.mass ? m.mass : 0),
      (m) => {
        this._hideDiff();
        onSelect(m);
      }
    );

    if (modules instanceof Array) {
      list = buildGroup(modules[0].grp, modules);
    } else {
      list = [];
      // At present time slots with grouped options (Hardpoints and Internal) can be empty
      list.push(<div className={'empty-c upp'} key={'empty'} onClick={onSelect.bind(null, null)} >{translate('empty')}</div>);
      for (let g in modules) {
        list.push(<div ref={g} key={g} className={'select-group cap'}>{translate(g)}</div>);
        list.push(buildGroup(g, modules[g]));
      }
    }

    return list;
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
      let classes = cn(m.name ? 'lc' : 'c', {
        active: mountedModule && mountedModule.id === m.id,
        warning: !disabled && warningFunc && warningFunc(m),
        disabled
      });

      switch(m.mount) {
        case 'F': mount = <MountFixed className={'lg'} />; break;
        case 'G': mount = <MountGimballed className={'lg'}/>; break;
        case 'T': mount = <MountTurret className={'lg'}/>; break;
      }

      if (i > 0 && modules.length > 3 && m.class != prevClass && (m.rating != prevRating || m.mount) && m.grp != 'pa') {
        elems.push(<br key={m.grp + i} />);
      }

      elems.push(
        <li
            key={m.id}
            className={classes}
            onMouseOver={disabled ? null : this._showDiff.bind(this, mountedModule, m)}
            onMouseLeave={this._hideDiff}
            onClick={disabled ? null : onSelect.bind(null, m)}
        >
          {mount}
          <span>{(mount ? ' ' : '') + m.class + m.rating + (m.missile ? '/' + m.missile : '') + (m.name ? ' ' + translate(m.name) : '')}</span>
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
   * @param  {SyntheticEvent} event Event
   */
  _showDiff(mm, m, event) {
    if (this.props.diffDetails) {
      this.context.tooltip(this.props.diffDetails(m, mm), event.currentTarget.getBoundingClientRect());
    }
  }

  /**
   * Hide diff tooltip
   */
  _hideDiff() {
    this.context.tooltip();
  }

  /**
   * Scroll to mounted (if it exists) component on mount
   */
  componentDidMount() {
    let m = this.props.m;

    if (!(this.props.modules instanceof Array) && m && m.grp) {
      findDOMNode(this).scrollTop = this.refs[m.grp].offsetTop; // Scroll to currently selected group
    }
  }

  /**
   * Update state based on property and context changes
   * @param  {Object} nextProps   Incoming/Next properties
   * @param  {Object} nextContext Incoming/Next conext
   */
  componentWillReceiveProps(nextProps, nextContext) {
    this.setState({ list: this._initList(nextProps, nextContext) });
  }

  /**
   * Render the list
   * @return {React.Component} List
   */
  render() {
    return (
      <div className={cn('select', this.props.className)} onScroll={this._hideDiff} onClick={(e) => e.stopPropagation() }>
        {this.state.list}
      </div>
    );
  }

}
