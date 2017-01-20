import React from 'react';
import { findDOMNode } from 'react-dom';
import TranslatedComponent from './TranslatedComponent';
import { isEmpty, stopCtxPropagation } from '../utils/UtilityFunctions';
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
        const close = this._closeMenu.bind(this, Modifications.blueprints[blueprintName].id, grade);
        blueprints.push(<div onClick={close}>{Modifications.blueprints[blueprintName].name} grade {grade}</div>);
      }
    }

    // Set up the modifications
    let modifications = [];
    for (const modName of Modifications.modules[m.grp].modifications) {
      if (Modifications.modifications[modName].type === 'percentage' || Modifications.modifications[modName].type === 'numeric') {
        modifications.push(<Modification key={ modName } ship={ ship } m={ m } name={ modName } onChange={ onChange }/>);
      }
    }

    const blueprintMenuOpened = false;

    return { blueprintMenuOpened, blueprints, modifications };
  }

  _openMenu() {
    const blueprintMenuOpened = true;
    this.setState({ blueprintMenuOpened });
  }

  _closeMenu(blueprintId, grade) {
    const { m } = this.props;
    const blueprint = Object.assign({}, _.find(Modifications.blueprints, function(o) { return o.id === blueprintId; }));
    blueprint.grade = grade;
    m.blueprint = blueprint;

    const blueprintMenuOpened = false;
    this.setState({ blueprintMenuOpened });
  }

  /**
   * Render the list
   * @return {React.Component} List
   */
  render() {
    const language = this.context.language;
    const translate = language.translate;
    const { tooltip, termtip } = this.context;
    const { m } = this.props;
    const { blueprintMenuOpened } = this.state;
    const open = this._openMenu.bind(this);

    let blueprintLabel;
    if (m.blueprint && !isEmpty(m.blueprint)) {
      blueprintLabel = translate(m.blueprint.name) + ' ' + translate('grade') + ' ' + m.blueprint.grade;
    } else {
      blueprintLabel = translate('select a blueprint');
    }

    return (
      <div
          className={cn('select', this.props.className)}
          onClick={(e) => e.stopPropagation() }
          onContextMenu={stopCtxPropagation}
      >
        {blueprintMenuOpened && this.state.blueprints}
        {!blueprintMenuOpened && <div className={cn('section-menu', { selected: blueprintMenuOpened })} style={{cursor: 'pointer'}} onClick={open}>{blueprintLabel}</div>}
        {!blueprintMenuOpened &&
          <span onMouseOver={termtip.bind(null, 'HELP_MODIFICATIONS_MENU')} onMouseOut={tooltip.bind(null, null)} >
            {this.state.modifications}
          </span> }
      </div>
    );
  }
}
