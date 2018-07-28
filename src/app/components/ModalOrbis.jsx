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
      console.log(this.props);
      console.log(this.state)
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
      <h3>{translate('orbis email')}</h3>
      <input defaultValue={this.state.orbisCreds.email} size={40} onChange={this.orbisUsername} onFocus={ (e) => e.target.select() }/>
      <br/><br/>
      <h3>{translate('orbis password')}</h3>
      <input defaultValue={this.state.orbisCreds.password} size={40} onChange={this.orbisPasswordHandler} type={'password'} onFocus={ (e) => e.target.select() }/>
      <br/><br/>
      <h3 >{translate('shortened')}</h3>
      <input value={this.state.orbisUrl} readOnly size={25} onFocus={ (e) => e.target.select() }/>
      <br/><br/>
      <button className={'l cb dismiss cap'} disabled={!!this.state.failed} onClick={this.sendToOrbis}>{translate('PHASE_UPLOAD_ORBIS')}</button>
      <button className={'r dismiss cap'} onClick={this.context.hideModal}>{translate('close')}</button>
    </div>;
  }
}
