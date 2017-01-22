import React from 'react';
import * as _ from 'lodash';
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

    this._toggleBlueprintsMenu = this._toggleBlueprintsMenu.bind(this);
    this._rollWorst = this._rollWorst.bind(this);
    this._rollRandom = this._rollRandom.bind(this);
    this._rollBest = this._rollBest.bind(this);
    this._reset = this._reset.bind(this);
  }

  /**
   * Initialise state
   * @param  {Object} props   React Component properties
   * @param  {Object} context React Component context
   * @return {Object}         list: Array of React Components
   */
  _initState(props, context) {
    let { m, onChange, ship } = props;

    let blueprints = [];
    for (const blueprintName in Modifications.modules[m.grp].blueprints) {
      for (const grade of Modifications.modules[m.grp].blueprints[blueprintName]) {
        const close = this._blueprintSelected.bind(this, Modifications.blueprints[blueprintName].id, grade);
        const key = blueprintName + ':' + grade;
        blueprints.push(<div style={{ cursor: 'pointer' }} key={ key } onClick={ close }>{Modifications.blueprints[blueprintName].name} grade {grade}</div>);
      }
    }

    // Set up the modifications
    const modifications = this._setModifications(props);

    const blueprintMenuOpened = false;

    // Set up the specials for this module
    // const specials = _selectSpecials(m);

    return { blueprintMenuOpened, blueprints, modifications };
  }

  /**
   * Initialise the modifications
   * @param  {Object} props   React Component properties
   * @return {Object}         list: Array of React Components
   */
  _setModifications(props) {
    const { m, onChange, ship } = props;
    let modifications = [];
    for (const modName of Modifications.modules[m.grp].modifications) {
      if (Modifications.modifications[modName].type === 'percentage' || Modifications.modifications[modName].type === 'numeric') {
        modifications.push(<Modification key={ modName } ship={ ship } m={ m } name={ modName } value={ m.getModValue(modName) / 100 || 0 } onChange={ onChange }/>);
      }
    }
    return modifications;
  }

  /**
   * Toggle the blueprints menu
   */
  _toggleBlueprintsMenu() {
    const blueprintMenuOpened = !this.state.blueprintMenuOpened;
    this.setState({ blueprintMenuOpened });
  }

  /**
   * Activated when a blueprint is selected
   * @param  {int} blueprintId The ID of the selected blueprint
   * @param  {int} grade       The grade of the selected blueprint
   */
  _blueprintSelected(blueprintId, grade) {
    const { m } = this.props;
    const blueprint = Object.assign({}, _.find(Modifications.blueprints, function(o) { return o.id === blueprintId; }));
    blueprint.grade = grade;
    m.blueprint = blueprint;

    const blueprintMenuOpened = false;
    this.setState({ blueprintMenuOpened });
    this.props.onChange();
  }

  /**
   * Provide a 'worst' roll within the information we have
   */
  _rollWorst() {
    const { m, ship } = this.props;
    const features = m.blueprint.features[m.blueprint.grade];
    for (const featureName in features) {
      let value = features[featureName][0];
      if (m.grp == 'sb') {
        // Shield boosters are a special case.  Their boost is dependent on their base so we need to calculate the value here
        value = ((1 + m.shieldboost)*(1 + value) - 1) / m.shieldboost - 1
      }

      if (Modifications.modifications[featureName].type == 'percentage') {
        ship.setModification(m, featureName, value * 10000);
      } else if (Modifications.modifications[featureName].type == 'numeric') {
        ship.setModification(m, featureName, value * 100);
      }
    }

    this.setState({ modifications: this._setModifications(this.props) });
    this.props.onChange();
  }

  /**
   * Provide a random roll within the information we have
   */
  _rollRandom() {
    const { m, ship } = this.props;
    const features = m.blueprint.features[m.blueprint.grade];
    for (const featureName in features) {
      let value = features[featureName][0] + (Math.random() * (features[featureName][1] - features[featureName][0]));
      if (m.grp == 'sb') {
        // Shield boosters are a special case.  Their boost is dependent on their base so we need to calculate the value here
        value = ((1 + m.shieldboost)*(1 + value) - 1) / m.shieldboost - 1
      }

      if (Modifications.modifications[featureName].type == 'percentage') {
        ship.setModification(m, featureName, value * 10000);
      } else if (Modifications.modifications[featureName].type == 'numeric') {
        ship.setModification(m, featureName, value * 100);
      }
    }

    this.setState({ modifications: this._setModifications(this.props) });
    this.props.onChange();
  }

  /**
   * Provide a 'best' roll within the information we have
   */
  _rollBest() {
    const { m, ship } = this.props;
    const features = m.blueprint.features[m.blueprint.grade];
    for (const featureName in features) {
      let value = features[featureName][1];
      if (m.grp == 'sb') {
        // Shield boosters are a special case.  Their boost is dependent on their base so we need to calculate the value here
        value = ((1 + m.shieldboost)*(1 + value) - 1) / m.shieldboost - 1
      }

      if (Modifications.modifications[featureName].type == 'percentage') {
        ship.setModification(m, featureName, value * 10000);
      } else if (Modifications.modifications[featureName].type == 'numeric') {
        ship.setModification(m, featureName, value * 100);
      }
    }

    this.setState({ modifications: this._setModifications(this.props) });
    this.props.onChange();
  }

  /**
   * Reset modification information
   */
  _reset() {
    const { m, ship } = this.props;
    ship.clearModifications(m);
    ship.clearBlueprint(m);

    this.setState({ modifications: this._setModifications(this.props) });
    this.props.onChange();
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

    const _toggleBlueprintsMenu = this._toggleBlueprintsMenu;
    const _rollBest = this._rollBest;
    const _rollWorst = this._rollWorst;
    const _rollRandom = this._rollRandom;
    const _reset = this._reset;

    let blueprintLabel;
    let haveBlueprint = false;
    if (m.blueprint && !isEmpty(m.blueprint)) {
      blueprintLabel = translate(m.blueprint.name) + ' ' + translate('grade') + ' ' + m.blueprint.grade;
      haveBlueprint = true;
    } else {
      blueprintLabel = translate('select a blueprint');
    }

    return (
      <div
          className={cn('select', this.props.className)}
          onClick={(e) => e.stopPropagation() }
          onContextMenu={stopCtxPropagation}
      >
        <div className={ cn('section-menu', { selected: blueprintMenuOpened })} style={{ cursor: 'pointer' }} onClick={_toggleBlueprintsMenu}>{blueprintLabel}</div>
        { blueprintMenuOpened ? this.state.blueprints : '' }
        { haveBlueprint ?
          <table style={{ width: '100%' }}>
            <tbody>
              <tr>
                <td> { translate('roll') } </td>
                <td style={{ cursor: 'pointer' }} onClick={_rollWorst}> { translate('worst') } </td>
                <td style={{ cursor: 'pointer' }} onClick={_rollRandom}> { translate('random') } </td>
                <td style={{ cursor: 'pointer' }} onClick={_rollBest}> { translate('best') } </td>
                <td style={{ cursor: 'pointer' }} onClick={_reset}> { translate('reset') } </td>
              </tr>
            </tbody>
          </table> : '' }
        { blueprintMenuOpened ? '' : 
          <span onMouseOver={termtip.bind(null, 'HELP_MODIFICATIONS_MENU')} onMouseOut={tooltip.bind(null, null)} >
            { this.state.modifications }
          </span> }
      </div>
    );
  }
}
