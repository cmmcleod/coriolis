import React from 'react';
import PropTypes from 'prop-types';
import TranslatedComponent from './TranslatedComponent';
import { orbisUpload } from '../utils/ShortenUrl';

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
      orbisUrl: 'Shortening...'
    };
  }

  /**
   * Shorten URL on mount
   */
  componentWillMount() {
    orbisUpload(this.props.ship,
      (orbisUrl) => this.setState({ orbisUrl }),
      (error) => this.setState({ orbisUrl: 'Error - ' + error })
    );
  }

  /**
   * Render the modal
   * @return {React.Component} Modal Content
   */
  render() {
    let translate = this.context.language.translate;

    return <div className='modal' onClick={ (e) => e.stopPropagation() }>
      <h2>{translate('permalink')}</h2>
      <br/>
      <h3>{translate('URL')}</h3>
      <input value={this.props.url} size={40} readOnly onFocus={ (e) => e.target.select() }/>
      <br/><br/>
      <h3 >{translate('shortened')}</h3>
      <input value={this.state.orbisUrl} readOnly size={25} onFocus={ (e) => e.target.select() }/>
      <br/><br/>
      <button className={'r dismiss cap'} onClick={this.context.hideModal}>{translate('close')}</button>
    </div>;
  }
}
