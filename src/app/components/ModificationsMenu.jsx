import React from 'react';
import * as _ from 'lodash';
import TranslatedComponent from './TranslatedComponent';
import { isEmpty, stopCtxPropagation } from '../utils/UtilityFunctions';
import cn from 'classnames';
import { Modifications } from 'coriolis-data/dist';
import Modification from './Modification';
import { getBlueprint, blueprintTooltip } from '../utils/BlueprintFunctions';

/**
 * Modifications menu
 */
export default class ModificationsMenu extends TranslatedComponent {

  static propTypes = {
    ship: React.PropTypes.object.isRequired,
    m: React.PropTypes.object.isRequired,
    marker: React.PropTypes.string.isRequired,
    onChange: React.PropTypes.func.isRequired
  };

  /**
   * Constructor
   * @param  {Object} props   React Component properties
   * @param  {Object} context React Component context
   */
  constructor(props, context) {
    super(props);

    this._toggleBlueprintsMenu = this._toggleBlueprintsMenu.bind(this);
    this._toggleSpecialsMenu = this._toggleSpecialsMenu.bind(this);
    this._rollWorst = this._rollWorst.bind(this);
    this._rollRandom = this._rollRandom.bind(this);
    this._rollBest = this._rollBest.bind(this);
    this._rollExtreme = this._rollExtreme.bind(this);
    this._reset = this._reset.bind(this);

    this.state = {
      blueprintMenuOpened: false,
      specialMenuOpened: false
    };
  }

  /**
   * Render the blueprints
   * @param  {Object} props   React component properties
   * @param  {Object} context React component context
   * @return {Object}         list: Array of React Components
   */
  _renderBlueprints(props, context) {
    const { m } = props;
    const { language, tooltip, termtip } = context;
    const translate = language.translate;

    const blueprints = [];
    for (const blueprintName in Modifications.modules[m.grp].blueprints) {
      const blueprint = getBlueprint(blueprintName, m);
      let blueprintGrades = [];
      for (let grade in Modifications.modules[m.grp].blueprints[blueprintName].grades) {
        // Grade is a string in the JSON so make it a number
        grade = Number(grade);
        const classes = cn('c', {
          active: m.blueprint && blueprint.id === m.blueprint.id && grade === m.blueprint.grade 
        });
        const close = this._blueprintSelected.bind(this, blueprintName, grade);
        const key = blueprintName + ':' + grade;
        const tooltipContent = blueprintTooltip(translate, blueprint.grades[grade], Modifications.modules[m.grp].blueprints[blueprintName].grades[grade].engineers, m.grp);
        blueprintGrades.unshift(<li key={key} className={classes} style={{ width: '2em' }} onMouseOver={termtip.bind(null, tooltipContent)} onMouseOut={tooltip.bind(null, null)} onClick={close}>{grade}</li>);
      }
      if (blueprintGrades) {
        blueprints.push(<div key={blueprint.name} className={'select-group cap'}>{translate(blueprint.name)}</div>);
        blueprints.push(<ul key={blueprintName}>{blueprintGrades}</ul>);
      }
    }
    return blueprints;
  }

  /**
   * Render the specials
   * @param  {Object} props   React component properties
   * @param  {Object} context React component context
   * @return {Object}         list: Array of React Components
   */
  _renderSpecials(props, context) {
    const { m } = props;
    const { language, tooltip, termtip } = context;
    const translate = language.translate;

    const specials = [];
    if (Modifications.modules[m.grp].specials && Modifications.modules[m.grp].specials.length > 0) {
      const close = this._specialSelected.bind(this, null);
      specials.push(<div style={{ cursor: 'pointer' }} key={ 'none' } onClick={ close }>{translate('PHRASE_NO_SPECIAL')}</div>);
      for (const specialName of Modifications.modules[m.grp].specials) {
        const close = this._specialSelected.bind(this, specialName);
        specials.push(<div style={{ cursor: 'pointer' }} key={ specialName } onClick={ close }>{translate(Modifications.specials[specialName].name)}</div>);
      }
    }
    return specials;
  }

  /**
   * Render the modifications
   * @param  {Object} props   React Component properties
   * @return {Object}         list: Array of React Components
   */
  _renderModifications(props) {
    const { m, onChange, ship } = props;
    const modifications = [];
    for (const modName of Modifications.modules[m.grp].modifications) {
      if (!Modifications.modifications[modName].hidden) {
        const key = modName + (m.getModValue(modName) / 100 || 0);
        modifications.push(<Modification key={ key } ship={ ship } m={ m } name={ modName } value={ m.getModValue(modName) / 100 || 0 } onChange={ onChange }/>);
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
   * @param  {int} fdname     The Frontier name of the blueprint
   * @param  {int} grade      The grade of the selected blueprint
   */
  _blueprintSelected(fdname, grade) {
    this.context.tooltip(null);
    const { m, ship } = this.props;
    const blueprint = getBlueprint(fdname, m);
    blueprint.grade = grade;
    ship.setModuleBlueprint(m, blueprint);

    this.setState({ blueprintMenuOpened: false });
    this.props.onChange();
  }

  /**
   * Toggle the specials menu
   */
  _toggleSpecialsMenu() {
    const specialMenuOpened = !this.state.specialMenuOpened;
    this.setState({ specialMenuOpened });
  }

  /**
   * Activated when a special is selected
   * @param  {int} special     The name of the selected special
   */
  _specialSelected(special) {
    this.context.tooltip(null);
    const { m, ship } = this.props;

    if (special === null) {
      ship.clearModuelSpecial(m);
    } else {
      ship.setModuleSpecial(m, Modifications.specials[special]);
    }

    this.setState({ specialMenuOpened: false });
    this.props.onChange();
  }

  /**
   * Set the result of a roll
   * @param  {object} ship          The ship to which the roll applies
   * @param  {object} m             The module to which the roll applies
   * @param  {string} featureName   The modification feature to which the roll applies
   * @param  {number} value         The value of the roll
   */
  _setRollResult(ship, m, featureName, value) {
    if (Modifications.modifications[featureName].type == 'percentage') {
      ship.setModification(m, featureName, value * 10000);
    } else if (Modifications.modifications[featureName].type == 'numeric') {
      ship.setModification(m, featureName, value * 100);
    } else {
      ship.setModification(m, featureName, value);
    }
  }

  /**
   * Provide a 'worst' roll within the information we have
   */
  _rollWorst() {
    const { m, ship } = this.props;
    ship.clearModifications(m);
    const features = m.blueprint.grades[m.blueprint.grade].features;
    for (const featureName in features) {
      let value = features[featureName][0];
      this._setRollResult(ship, m, featureName, value);
    }

    this.props.onChange();
  }

  /**
   * Provide a random roll within the information we have
   */
  _rollRandom() {
    const { m, ship } = this.props;
    ship.clearModifications(m);
    const features = m.blueprint.grades[m.blueprint.grade].features;
    for (const featureName in features) {
      let value = features[featureName][0] + (Math.random() * (features[featureName][1] - features[featureName][0]));
      this._setRollResult(ship, m, featureName, value);
    }

    this.props.onChange();
  }

  /**
   * Provide a 'best' roll within the information we have
   */
  _rollBest() {
    const { m, ship } = this.props;
    const features = m.blueprint.grades[m.blueprint.grade].features;
    for (const featureName in features) {
      let value = features[featureName][1];
      this._setRollResult(ship, m, featureName, value);
    }

    this.props.onChange();
  }

  /**
   * Provide an 'extreme' roll within the information we have
   */
  _rollExtreme() {
    const { m, ship } = this.props;
    ship.clearModifications(m);
    const features = m.blueprint.grades[m.blueprint.grade].features;
    for (const featureName in features) {
      let value;
      if (Modifications.modifications[featureName].higherbetter) {
        // Higher is better, but is this making it better or worse?
        if (features[featureName][0] < 0 || (features[featureName][0] === 0 && features[featureName][1] < 0)) {
          value = features[featureName][0];
        } else {
          value = features[featureName][1];
        }
      } else {
        // Higher is worse, but is this making it better or worse?
        if (features[featureName][0] < 0 || (features[featureName][0] === 0 && features[featureName][1] < 0)) {
          value = features[featureName][1];
        } else {
          value = features[featureName][0];
        }
      }

      this._setRollResult(ship, m, featureName, value);
    }

    this.props.onChange();
  }

  /**
   * Reset modification information
   */
  _reset() {
    const { m, ship } = this.props;
    ship.clearModifications(m);
    ship.clearModuleBlueprint(m);

    this.props.onChange();
  }

  /**
   * Render the list
   * @return {React.Component} List
   */
  render() {
    const { language, tooltip, termtip } = this.context;
    const translate = language.translate;
    const { m } = this.props;
    const { blueprintMenuOpened, specialMenuOpened } = this.state;

    const _toggleBlueprintsMenu = this._toggleBlueprintsMenu;
    const _toggleSpecialsMenu = this._toggleSpecialsMenu;
    const _rollBest = this._rollBest;
    const _rollExtreme = this._rollExtreme;
    const _rollWorst = this._rollWorst;
    const _rollRandom = this._rollRandom;
    const _reset = this._reset;

    let blueprintLabel;
    let haveBlueprint = false;
    let blueprintTt;
    if (m.blueprint && m.blueprint.name) {
      blueprintLabel = translate(m.blueprint.name) + ' ' + translate('grade') + ' ' + m.blueprint.grade;
      haveBlueprint = true;
      blueprintTt  = blueprintTooltip(translate, m.blueprint.grades[m.blueprint.grade], Modifications.modules[m.grp].blueprints[m.blueprint.fdname].grades[m.blueprint.grade].engineers, m.grp);
    }

    let specialLabel;
    if (m.blueprint && m.blueprint.special) {
      specialLabel = m.blueprint.special.name;
    } else {
      specialLabel = translate('PHRASE_SELECT_SPECIAL');
    }

    const specials = this._renderSpecials(this.props, this.context);

    const showBlueprintsMenu = blueprintMenuOpened;
    const showSpecial = haveBlueprint && specials.length && !blueprintMenuOpened;
    const showSpecialsMenu = specialMenuOpened;
    const showRolls = haveBlueprint && !blueprintMenuOpened && !specialMenuOpened;
    const showReset = !blueprintMenuOpened && !specialMenuOpened;
    const showMods = !blueprintMenuOpened && !specialMenuOpened;

    return (
      <div
          className={cn('select', this.props.className)}
          onClick={(e) => e.stopPropagation() }
          onContextMenu={stopCtxPropagation}
      >
        { showBlueprintsMenu ? '' : haveBlueprint ? 
          <div className={ cn('section-menu', { selected: blueprintMenuOpened })} style={{ cursor: 'pointer' }} onMouseOver={termtip.bind(null, blueprintTt)} onMouseOut={tooltip.bind(null, null)} onClick={_toggleBlueprintsMenu}>{blueprintLabel}</div> : 
          <div className={ cn('section-menu', { selected: blueprintMenuOpened })} style={{ cursor: 'pointer' }} onClick={_toggleBlueprintsMenu}>{translate('PHRASE_SELECT_BLUEPRINT')}</div> }
        { showBlueprintsMenu ? this._renderBlueprints(this.props, this.context) : null }
        { showSpecial ? <div className={ cn('section-menu', { selected: specialMenuOpened })} style={{ cursor: 'pointer' }} onClick={_toggleSpecialsMenu}>{specialLabel}</div> : null }
        { showSpecialsMenu ? specials : null }
        { showRolls || showReset ?
            <table style={{ width: '100%', backgroundColor: 'transparent' }}>
              <tbody>
          { showRolls ?
                <tr>
                  <td> { translate('roll') }: </td>
                  <td style={{ cursor: 'pointer' }} onClick={_rollWorst} onMouseOver={termtip.bind(null, 'PHRASE_BLUEPRINT_WORST')} onMouseOut={tooltip.bind(null, null)}> { translate('worst') } </td>
                  <td style={{ cursor: 'pointer' }} onClick={_rollBest}onMouseOver={termtip.bind(null, 'PHRASE_BLUEPRINT_BEST')} onMouseOut={tooltip.bind(null, null)}> { translate('best') } </td>
                  <td style={{ cursor: 'pointer' }} onClick={_rollExtreme}onMouseOver={termtip.bind(null, 'PHRASE_BLUEPRINT_EXTREME')} onMouseOut={tooltip.bind(null, null)}> { translate('extreme') } </td>
                  <td style={{ cursor: 'pointer' }} onClick={_rollRandom} onMouseOver={termtip.bind(null, 'PHRASE_BLUEPRINT_RANDOM')} onMouseOut={tooltip.bind(null, null)}> { translate('random') } </td>
                </tr> : null }
          { showReset ?
                <tr>
                  <td colSpan={'5'} style={{ cursor: 'pointer' }} onClick={_reset}onMouseOver={termtip.bind(null, 'PHRASE_BLUEPRINT_RESET')} onMouseOut={tooltip.bind(null, null)}> { translate('reset') } </td>
                </tr> : null }
              </tbody>
          </table> : null }
        { showMods ?
          <span onMouseOver={termtip.bind(null, 'HELP_MODIFICATIONS_MENU')} onMouseOut={tooltip.bind(null, null)} >
            { this._renderModifications(this.props) }
          </span> : null }
      </div>
    );
  }
}
