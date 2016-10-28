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
      let modifiers = Modifications.modifiers[modId]
      list.push(<div className={'cb'} key={modId}>
		  <div className={'l'}>{translate(modifiers.name)}</div>
		  <span className={'r'}>{formats.pct(m.getModValue(modId) || 0)}</span>
		  <ModSlider axis={true} axisUnit ={'%'} className={'cb'} min={modifiers.min || -1} max={modifiers.max || 1} percent={this._getSliderPercent(modId)} onChange={this._updateValue.bind(this, modId)} />
                </div>);
    }
		  //<NumericInput className={'r'} min={-100} max={100} step={0.1} precision={2} value={m.getModValue(modId) * 100} onChange={this._updateValue.bind(this, modId)} />

    return { list };
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
    let m = this.props.m;
    let ship = this.props.ship;

    let modifiers = Modifications.modifiers[modId];
    let max = modifiers.max || 1;
    let min = modifiers.min || -1;
    let scaledValue = min + ((max - min) * value);

    ship.setModification(m, modId, scaledValue);
    this.props.onChange();
  }

  /**
   * Obtain slider value from a modification.
   * @param {Number} modId The ID of the modification
   * @return {Number} value The value of the slider, in the range [0,1]
   */
  _getSliderPercent(modId) {
    let modifiers = Modifications.modifiers[modId];
    let max = modifiers.max || 1;
    let min = modifiers.min || -1;
    let m = this.props.m;
    if (m.getModValue(modId)) {
      return (m.getModValue(modId) - min) / (max - min);
    }
    return -min / (max - min);
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
