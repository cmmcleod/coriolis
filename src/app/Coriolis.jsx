import React from 'react';
import Router from './Router';
import { getLanguage } from './i18n/Language';
import Persist from './stores/Persist';
import InterfaceEvents from './utils/InterfaceEvents';

import Header from './components/Header';
import AboutPage from './pages/AboutPage';
import NotFoundPage from './pages/NotFoundPage';
import OutfittingPage from './pages/OutfittingPage';
import ShipyardPage from './pages/ShipyardPage';

export default class Coriolis extends React.Component {

  static childContextTypes = {
    language: React.PropTypes.object.isRequired,
    route: React.PropTypes.object
  };

  constructor() {
    super();
    this._setPage = this._setPage.bind(this);

    this.state = {
      page: null,
      language: getLanguage(Persist.getLangCode()),
      route: null
    };

    Router('', (r) => this._setPage(ShipyardPage, r));
    // Router('/', (ctx) => this._setPage(ShipyardPage, ctx));
    Router('/outfitting/:ship', (r) => this._setPage(OutfittingPage, r));
    Router('/outfitting/:ship/:code', (r) => this._setPage(OutfittingPage, r));
    // Router('/compare/:name', compare);
    // Router('/comparison/:code', comparison);
    // Router('/settings', settings);
    Router('/about', (r) => this._setPage(AboutPage, r));
    Router('*', (r) => this._setPage(null, r));
  }

  _setPage(page, route) {
    this.setState({ page, route });
  }

  _onError(msg, scriptUrl, line, col, errObj) {
      this._setPage(<div>Some errors occured!!</div>);
  }

  _onLanguageChange(lang) {
    this.setState({ language: getLanguage(Persist.getLangCode()) });
  }

  _keyDown(e) {
    switch (e.keyCode) {
      case 27:
        InterfaceEvents.closeAll();
        this._hideModal();
        break;
    }
  }

  _showModal(content) {
    let modal = <div className='modal-bg' onClick={(e) => this._hideModal() }>{content}</div>;
    this.setState({ modal });
  }

  _hideModal() {
    if (this.state.modal) {
      this.setState({ modal: null });
    }
  }

  getChildContext() {
    return {
      language: this.state.language,
      route: this.state.route
    };
  }

  componentWillMount() {
    // Listen for appcache updated event, present refresh to update view
    if (window.applicationCache) {
      window.applicationCache.addEventListener('updateready', () => {
        if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
          this.setState({appCacheUpdate: true}); // Browser downloaded a new app cache.
        }
      }, false);
    }

    window.onerror = this._onError.bind(this);
    document.addEventListener('keydown', this._keyDown.bind(this));
    Persist.addListener('language', this._onLanguageChange.bind(this));
    Persist.addListener('language', this._onLanguageChange.bind(this));
    InterfaceEvents.addListener('showModal', this._showModal.bind(this));
    InterfaceEvents.addListener('hideModal', this._hideModal.bind(this));

    Router.start();
  }


  render() {
    return (
      <div onClick={InterfaceEvents.closeAll}>
        <Header appCacheUpdate={this.state.appCacheUpdate} />
        {this.state.page? <this.state.page /> : <NotFoundPage/>}
        {this.state.modal}
      </div>
    );
  }
}
