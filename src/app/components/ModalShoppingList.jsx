import React from 'react';
import PropTypes from 'prop-types';
import TranslatedComponent from './TranslatedComponent';
import ShortenUrl from '../utils/ShortenUrl';

/**
 * Permalink modal
 */
export default class ModalShoppingList extends TranslatedComponent {

  static propTypes = {
    mats: PropTypes.object.isRequired
  };

  /**
   * Constructor
   * @param  {Object} props   React Component properties
   */
  constructor(props) {
    super(props);

    this.state = {
      mats: props.mats,
      matsList: ''
    };
  }

  /**
   * Convert mats object to string
   */
  renderMats() {
    let matsString = '';
    for (const i in this.state.mats) {
      if (!this.state.mats.hasOwnProperty(i)) {
        continue;
      }
      matsString += `${i}: ${this.state.mats[i]}\n`;
    }
    this.setState({ matsList: matsString });
  }

  /**
   * Render the modal
   * @return {React.Component} Modal Content
   */
  render() {
    let translate = this.context.language.translate;
    this.renderMats();
    return <div className='modal' onClick={ (e) => e.stopPropagation() }>
      <h2>{translate('PHRASE_SHOPPING_MATS')}</h2>
      <div>
        <textarea className='cb json' ref={node => this.exportField = node} readOnly value={this.state.matsList} />
      </div>
      <button className={'r dismiss cap'} onClick={this.context.hideModal}>{translate('close')}</button>
    </div>;
  }
}
