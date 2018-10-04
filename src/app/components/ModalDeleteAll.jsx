import React from 'react';
import TranslatedComponent from './TranslatedComponent';
import Persist from '../stores/Persist';

/**
 * Delete All saved data modal
 */
export default class ModalDeleteAll extends TranslatedComponent {
  /**
   * Delete everything and hide the modal
   */
  _deleteAll() {
    Persist.deleteAll();
    this.context.hideModal();
  }

  /**
   * Renders the component
   * @return {React.Component} Modal contents
   */
  render() {
    let translate = this.context.language.translate;

    return <div className='modal' onClick={(e) => e.stopPropagation()}>
      <h2>{translate('delete all')}</h2>
      <p className='cen'>{translate('PHRASE_CONFIRMATION')}</p>
      <button className='l cap' onClick={this._deleteAll.bind(this)}>{translate('yes')}</button>
      <button className='r cap' onClick={this.context.hideModal}>{translate('no')}</button>
    </div>;
  }
}
