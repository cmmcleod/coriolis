import React from 'react';
import PropTypes from 'prop-types';
import request from 'superagent';
import TranslatedComponent from './TranslatedComponent';
import { orbisUpload } from '../utils/ShortenUrl';
import Persist from '../stores/Persist';

/**
 * Permalink modal
 */
export default class ModalBatchOrbis extends TranslatedComponent {

  static propTypes = {
    ships: PropTypes.any.isRequired
  };

  /**
   * Constructor
   * @param  {Object} props   React Component properties
   */
  constructor(props) {
    super(props);

    this.state = {
      orbisCreds: Persist.getOrbisCreds(),
      resp: ''
    };
  }

  /**
   * Send ship to Orbis.zone
   * @param {SyntheticEvent} e React Event
   * @return {Promise} Promise sending post request to orbis
   */
  sendToOrbis(e) {
    let agent;
    try {
      agent = request.agent(); // apparently this crashes somehow
    } catch (e) {
      console.error(e);
    }
    if (!agent) {
      agent = request;
    }
    const API_ORBIS = 'https://orbis.zone/api/builds/add/batch';
    return new Promise((resolve, reject) => {
      try {
        agent
          .post(API_ORBIS)
          .withCredentials()
          .redirects(0)
          .set('Content-Type', 'application/json')
          .send(this.props.ships)
          .end((err, response) => {
            console.log(response);
            if (err) {
              console.error(err);
              this.setState({ resp: response.text });
              reject('Bad Request');
            } else {
              this.setState({ resp: 'All builds uploaded. Check https://orbis.zone' });
              resolve('All builds uploaded. Check https://orbis.zone');
            }
          });
      } catch (e) {
        console.log(e);
        reject(e.message ? e.message : e);
      }
    });
  }

  /**
   * Render the modal
   * @return {React.Component} Modal Content
   */
  render() {
    let translate = this.context.language.translate;
    this.sendToOrbis = this.sendToOrbis.bind(this);

    return <div className='modal' onClick={ (e) => e.stopPropagation() }>
      <h2>{translate('permalink')}</h2>
      <br/>
      <a className='button' href="https://orbis.zone/api/auth">Log in / signup to Orbis</a>
      <br/><br/>
      <h3 >{translate('success')}</h3>
      <input value={this.state.resp} readOnly size={25} onFocus={ (e) => e.target.select() }/>
      <br/><br/>
      <p>Orbis.zone is currently in a trial period, and may be wiped at any time as development progresses. Some elements are also still placeholders.</p>
      <button className={'l cb dismiss cap'} disabled={!!this.state.failed} onClick={this.sendToOrbis}>{translate('PHASE_UPLOAD_ORBIS')}</button>
      <button className={'r dismiss cap'} onClick={this.context.hideModal}>{translate('close')}</button>
    </div>;
  }
}
