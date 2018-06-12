import React from 'react';
import PropTypes from 'prop-types';
import TranslatedComponent from './TranslatedComponent';
import ShortenUrl from '../utils/ShortenUrl';
import Persist from '../stores/Persist';

/**
 * Permalink modal
 */
export default class ModalShoppingList extends TranslatedComponent {

  static propTypes = {
    ship: PropTypes.object.isRequired
  };

  /**
   * Constructor
   * @param  {Object} props   React Component properties
   */
  constructor(props) {
    super(props);
    this.state = {
      matsList: '',
      mats: {},
      matsPerGrade: Persist.getRolls()
    };
  }

  /**
   * React component did mount
   */
  componentDidMount() {
    this.renderMats();
  }

  /**
   * Convert mats object to string
   */
  renderMats() {
    const ship = this.props.ship;
    let mats = {};
    for (const module of ship.costList) {
      if (module.type === 'SHIP') {
        continue;
      }
      if (module.m && module.m.blueprint) {
        if (!module.m.blueprint.grade || !module.m.blueprint.grades) {
          continue;
        }
        for (const g in module.m.blueprint.grades) {
          if (g > module.m.blueprint.grade) {
            continue;
          }
          for (const i in module.m.blueprint.grades[g].components) {
            if (mats[i]) {
              mats[i] += module.m.blueprint.grades[g].components[i] * this.state.matsPerGrade[g];
            } else {
              mats[i] = module.m.blueprint.grades[g].components[i] * this.state.matsPerGrade[g];
            }
          }
        }
      }
    }
    let matsString = '';
    for (const i in mats) {
      if (!mats.hasOwnProperty(i)) {
        continue;
      }
      if (mats[i] === 0) {
        delete mats[i];
        continue;
      }
      matsString += `${i}: ${mats[i]}\n`;
    }
    this.setState({ matsList: matsString, mats });
  }

  /**
   * Handler for changing roll amounts
   * @param {SyntheticEvent} e React Event
   */
  changeHandler(e) {
    let grade = e.target.id;
    let newState = this.state.matsPerGrade;
    newState[grade] = parseInt(e.target.value);
    this.setState({ matsPerGrade: newState });
    Persist.setRolls(newState);
    this.renderMats();
  }

  /**
   * Render the modal
   * @return {React.Component} Modal Content
   */
  render() {
    let translate = this.context.language.translate;
    this.changeHandler = this.changeHandler.bind(this);
    return <div className='modal' onClick={ (e) => e.stopPropagation() }>
      <h2>{translate('PHRASE_SHOPPING_MATS')}</h2>
      <label>Grade 1 rolls </label>
      <input id={1} type={'number'} min={0} defaultValue={this.state.matsPerGrade[1]} onChange={this.changeHandler} />
      <br/>
      <label>Grade 2 rolls </label>
      <input id={2} type={'number'} min={0} defaultValue={this.state.matsPerGrade[2]} onChange={this.changeHandler} />
      <br/>
      <label>Grade 3 rolls </label>
      <input id={3} type={'number'} min={0} value={this.state.matsPerGrade[3]} onChange={this.changeHandler} />
      <br/>
      <label>Grade 4 rolls </label>
      <input id={4} type={'number'} min={0} value={this.state.matsPerGrade[4]} onChange={this.changeHandler} />
      <br/>
      <label>Grade 5 rolls </label>
      <input id={5} type={'number'} min={0} value={this.state.matsPerGrade[5]} onChange={this.changeHandler} />
      <div>
        <textarea className='cb json' readOnly value={this.state.matsList} />
      </div>
      <button className={'r dismiss cap'} onClick={this.context.hideModal}>{translate('close')}</button>
    </div>;
  }
}
