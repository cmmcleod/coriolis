import React from 'react';
import TranslatedComponent from './TranslatedComponent';
import ShortenUrl from '../utils/ShortenUrl';

/**
 * Permalink modal
 */
export default class ModalPermalink extends TranslatedComponent {

  static propTypes = {
    url: React.PropTypes.string.isRequired
  };

  /**
   * Constructor
   * @param  {Object} props   React Component properties
   */
  constructor(props) {
    super(props);

    this.state = {
      shortenedUrl: 'Shortening...'
    };
  }

  /**
   * Shorten URL on mount
   */
  componentWillMount() {
    ShortenUrl(this.props.url,
      (shortenedUrl) => this.setState({ shortenedUrl }),
      (error) => this.setState({ shortenedUrl: 'Error - ' + error })
    );
  }

  /**
   * Render the modal
   * @return {React.Component} Modal Content
   */
  render() {
    let translate = this.context.language.translate;

    return <div className='modal' onTouchTap={ (e) => e.stopPropagation() }>
      <h2>{translate('permalink')}</h2>
      <br/>
      <h3>{translate('URL')}</h3>
      <input value={this.props.url} size={40} readOnly onFocus={ (e) => e.target.select() }/>
      <br/><br/>
      <h3 >{translate('shortened')}</h3>
      <input value={this.state.shortenedUrl} readOnly size={25} onFocus={ (e) => e.target.select() }/>
      <br/><br/>
      <button className={'r dismiss cap'} onTouchTap={this.context.hideModal}>{translate('close')}</button>
    </div>;
  }
}
