import React from 'react';
import { findDOMNode } from 'react-dom';
import TranslatedComponent from './TranslatedComponent';
import cn from 'classnames';
import NumberEditor from 'react-number-editor';

/**
 * Modification
 */
export default class Modification extends TranslatedComponent {

  static propTypes = {
    ship: React.PropTypes.object.isRequired,
    m: React.PropTypes.object.isRequired,
    name: React.PropTypes.string.isRequired,
    onChange: React.PropTypes.func.isRequired
  };

  /**
   * Constructor
   * @param  {Object} props   React Component properties
   * @param  {Object} context React Component context
   */
  constructor(props, context) {
    super(props);
    this.state = {};
    this.state.value = this.props.m.getModValue(this.props.name) / 100 || 0;
  }

  /**
   * Update modification given a value.
   * @param {Number} value The value to set.  This comes in as a string and must be stored in state as a string,
   *                       because it needs to allow illegal 'numbers' ('-', '1.', etc) when the user is typing
   *                       in a value by hand
   */
  _updateValue(value) {
    const name = this.props.name;

    let scaledValue = Math.round(Number(value) * 100);
    // Limit to +1000% / -100%
    if (scaledValue > 100000) {
      scaledValue = 100000;
      value = 1000;
    }
    if (scaledValue < -10000) {
      scaledValue = -10000;
      value = -100;
    }

    let m = this.props.m;
    let ship = this.props.ship;
    ship.setModification(m, name, scaledValue);

    this.setState({ value });
    this.props.onChange();
  }

  /**
   * Render the modification
   * @return {React.Component} modification
   */
  render() {
    let translate = this.context.language.translate;
    let name = this.props.name;

    if (name === 'type') {
      // We don't show type
      return null;
    }

    let symbol;
    if (name === 'jitter') {
      symbol = '°';
    } else if (name !== 'burst') {
      symbol = '%';
    }
    if (symbol) {
      symbol = ' (' + symbol + ')';
    }

    return (
      <div className={'cb'} key={name}>
        <div className={'cb'}>{translate(name)}{symbol}</div>
        <NumberEditor className={'cb'} style={{ width: '90%', textAlign: 'center' }} step={0.01} stepModifier={1} decimals={2} value={this.state.value} onValueChange={this._updateValue.bind(this)} />
      </div>
    );
  }
}
