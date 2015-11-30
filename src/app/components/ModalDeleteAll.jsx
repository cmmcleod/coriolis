import React from 'react';
import TranslatedComponent from './TranslatedComponent';
import InterfaceEvents from '../utils/InterfaceEvents';

export default class ModalDeleteAll extends TranslatedComponent {

  _deleteAll() {
    Persist.deleteAll();
    InterfaceEvents.hideModal();
  }

  render() {
    let translate = this.context.language.translate;

    return <div className='modal' onClick={(e) => e.stopPropagation()}>
      <h2>{translate('delete all')}</h2>
      <p style={{textAlign: 'center'}}>{translate('PHRASE_CONFIRMATION')}</p>
      <button className='l cap' onClick={this._deleteAll}>{translate('yes')}</button>
      <button className='r cap' onClick={InterfaceEvents.hideModal}>{translate('no')}</button>
    </div>;
  }
}
