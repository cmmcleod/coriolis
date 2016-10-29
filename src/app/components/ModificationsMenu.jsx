import React from 'react';
import { findDOMNode } from 'react-dom';
import TranslatedComponent from './TranslatedComponent';
import { stopCtxPropagation } from '../utils/UtilityFunctions';
import cn from 'classnames';
import { MountFixed, MountGimballed, MountTurret } from './SvgIcons';
import { Modifications } from 'coriolis-data/dist';
import NumberEditor from 'react-number-editor';

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
		  <div className={'cb'}>{translate(modifiers.name)}{' (%)'}</div>
		  <NumberEditor className={'cb'} style={'width: 100%, text-align: center'} step={0.01} stepModifier={1} decimals={2} initialValue={m.getModValue(modId) ? m.getModValue(modId) * 100 : 0} value={m.getModValue(modId) ? m.getModValue(modId) * 100 : 0} onValueChange={this._updateValue.bind(this, modId)} />
                </div>);
    }

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
    let scaledValue = Math.floor(value * 100) / 10000;

    let m = this.props.m;
    let ship = this.props.ship;

    ship.setModification(m, modId, scaledValue);
    this.props.onChange();
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
