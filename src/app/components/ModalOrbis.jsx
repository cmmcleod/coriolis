import React from 'react';
import PropTypes from 'prop-types';
import TranslatedComponent from './TranslatedComponent';
import { orbisUpload } from '../utils/ShortenUrl';
import Persist from '../stores/Persist';

/**
 * Permalink modal
 */
export default class ModalOrbis extends TranslatedComponent {

  static propTypes = {
    ship: PropTypes.any.isRequired
  };

  /**
   * Constructor
   * @param  {Object} props   React Component properties
   */
  constructor(props) {
    super(props);

    this.state = {
      orbisCreds: Persist.getOrbisCreds(),
      orbisUrl: '...'
    };
  }

  /**
   * Send ship to Orbis.zone
   * @param {SyntheticEvent} e React Event
   */
  sendToOrbis(e) {
    const target = e.target;
    target.disabled = true;
    this.setState({ orbisUrl: 'Sending...' }, () => {
      orbisUpload(this.props.ship, this.state.orbisCreds)
        .then(orbisUrl => {
          target.disabled = false;
          this.setState({ orbisUrl });
        })
        .catch(err => {
          target.disabled = false;
          this.setState({ orbisUrl: 'Error - ' + err });
        });
    });
  }

  /**
   * Handler for changing cmdr name
   * @param {SyntheticEvent} e React Event
   */
  orbisPasswordHandler(e) {
    let password = e.target.value;
    this.setState({ orbisCreds: { email: this.state.orbisCreds.email, password } }, () => {
      Persist.setOrbisCreds(this.state.orbisCreds);
    });
  }

  /**
   * Handler for changing cmdr name
   * @param {SyntheticEvent} e React Event
   */
  orbisUsername(e) {
    let orbisUsername = e.target.value;
    this.setState({ orbisCreds: { email: orbisUsername, password: this.state.orbisCreds.password } }, () => {
      Persist.setOrbisCreds(this.state.orbisCreds);
    });
  }

  /**
   * Render the modal
   * @return {React.Component} Modal Content
   */
  render() {
    let translate = this.context.language.translate;
    this.orbisPasswordHandler = this.orbisPasswordHandler.bind(this);
    this.orbisUsername = this.orbisUsername.bind(this);
    this.sendToOrbis = this.sendToOrbis.bind(this);

    return <div className='modal' onClick={ (e) => e.stopPropagation() }>
      <h2>{translate('permalink')}</h2>
      <br/>
      <a className='button' href="https://orbis.zone/api/auth">Log in / signup to Orbis</a>
      <br/><br/>
      <h3 >{translate('Orbis link')}</h3>
      <input value={this.state.orbisUrl} readOnly size={25} onFocus={ (e) => e.target.select() }/>
      <br/><br/>
      <p>Orbis.zone is currently in a trial period, and may be wiped at any time as development progresses. Some elements are also still placeholders.</p>
      <button className={'l cb dismiss cap'} disabled={!!this.state.failed} onClick={this.sendToOrbis}>{translate('PHASE_UPLOAD_ORBIS')}</button>
      <button className={'r dismiss cap'} onClick={this.context.hideModal}>{translate('close')}</button>
    </div>;
  }
}
