import React from 'react';
import TranslatedComponent from './TranslatedComponent';
import InterfaceEvents from '../utils/InterfaceEvents';

export default class ModalPermalink extends TranslatedComponent {

  static propTypes = {
    url: React.propTypes.string.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      shortenedUrl: 'Shortening...'
    };
  }

  componentWillMount(){
    ShortenUrl(this.props.url,
      (shortenedUrl) => this.setState({ shortenedUrl }),
      (error) => this.setState({ shortenedUrl: 'Error - ' + e.statusText })
    );
  }

  render() {
    let translate = this.context.language.translate;

    return <div className='modal' onClick={ (e) => e.stopPropagation() }>
      <h2>{translate('permalink')}</h2>
      <br/>
      <h3>{translate('URL')}</h3>
      <input value={this.props.url} size={40} onFocus={ (e) => e.target.select() }/>
      <br/><br/>
      <h3 >{translate('shortened')}</h3>
      <input value={this.state.shortenedUrl} size={25} onFocus={ (e) => e.target.select() }/>
      <br/><br/>
      <button className={'r dismiss cap'} onClick={InterfaceEvents.hideModal}>{translate('close')}</button>
    </div>;
  }
}
