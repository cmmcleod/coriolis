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
    let values = {};

    for (let modName of Modifications.validity[m.grp]) {
      values[modName] = m.getModValue(modName) * 100;
      list.push(<div className={'cb'} key={modName}>
		  <div className={'cb'}>{translate(modName)}{' (%)'}</div>
		  <NumberEditor className={'cb'} style={{ width: '100%', textAlign: 'center' }} step={0.01} stepModifier={1} decimals={2} value={this._getValue(modName, values[modName])} onValueChange={this._updateValue.bind(this, modName)} />
                </div>);
    }
		  //<NumberEditor className={'cb'} style={{ width: '100%', textAlign: 'center' }} step={0.01} stepModifier={1} decimals={2} initialValue={m.getModValue(modName) ? m.getModValue(modName) * 100 : 0} value={m.getModValue(modName) ? m.getModValue(modName) * 100 : 0} onValueChange={this._updateValue.bind(this, modName)} />

    return { list, values };
  }

  /**
   * Update state based on property and context changes
   * @param  {Object} nextProps   Incoming/Next properties
   * @param  {Object} nextContext Incoming/Next conext
   */
  componentWillReceiveProps(nextProps, nextContext) {
    this.setState(this._initState(nextProps, nextContext));
  }

  _getValue(name, defaultValue) {
    let values = this.state ? this.state.values : null;
    return values ? values[name] : defaultValue;
  }

  /**
   * Update modification given a value.
   * @param {Number} name The name of the modification
   * @param {Number} value The value to set, in the range [0,1]
   */
  _updateValue(name, value) {

    let values = this.state.values;
    values[name] = value;

    // Only update the modification if this is a valid number
    if (!isNaN(Number(value)) && !value.endsWith('.')) {
      let scaledValue = Math.floor(Number(value) * 100) / 10000;
      let m = this.props.m;
      let ship = this.props.ship;
      ship.setModification(m, name, scaledValue);
    }
    this.props.onChange();
    this.setState({values});
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
