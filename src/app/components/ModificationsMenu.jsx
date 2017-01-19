import React from 'react';
import { findDOMNode } from 'react-dom';
import TranslatedComponent from './TranslatedComponent';
import { stopCtxPropagation } from '../utils/UtilityFunctions';
import cn from 'classnames';
import { MountFixed, MountGimballed, MountTurret } from './SvgIcons';
import { Modifications } from 'coriolis-data/dist';
import Modification from './Modification';

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
    let { m, onChange, ship } = props;

    let blueprints = [];
    for (const blueprintName in Modifications.modules[m.grp].blueprints) {
      for (const grade of Modifications.modules[m.grp].blueprints[blueprintName]) {
        blueprints.push(<div>{Modifications.blueprints[blueprintName].name} grade {grade}</div>);
      }
    }

    let modifications = [];
    for (const modName of Modifications.modules[m.grp].modifications) {
      if (Modifications.modifications[modName].type === 'percentage' || Modifications.modifications[modName].type === 'numeric') {
        modifications.push(<Modification key={ modName } ship={ ship } m={ m } name={ modName } onChange={ onChange }/>);
      }
    }

    return { blueprints, modifications };
  }

  /**
   * Render the list
   * @return {React.Component} List
   */
  render() {
    let { tooltip, termtip } = this.context;
    return (
      <div
          className={cn('select', this.props.className)}
          onClick={(e) => e.stopPropagation() }
          onContextMenu={stopCtxPropagation}
          onMouseOver={termtip.bind(null, 'HELP_MODIFICATIONS_MENU')} onMouseOut={tooltip.bind(null, null)} 
      >
        {this.state.blueprints}
        {this.state.modifications}
      </div>
    );
  }
}
