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
    this._openMenu = this._openMenu.bind(this);
    this._closeMenu = this._closeMenu.bind(this);
    this._showModal = this._showModal.bind(this);
    this._hideModal = this._hideModal.bind(this);
    this._onLanguageChange = this._onLanguageChange.bind(this)
    this._keyDown = this._keyDown.bind(this);

    this.state = {
      page: null,
      language: getLanguage(Persist.getLangCode()),
      route: null
    };

    Router('', (r) => this._setPage(ShipyardPage, r));
    Router('/outfit/:ship/:code?', (r) => this._setPage(OutfittingPage, r));
    // Router('/compare/:name', compare);
    // Router('/comparison/:code', comparison);
    Router('/about', (r) => this._setPage(AboutPage, r));
    Router('*', (r) => this._setPage(null, r));
  }

  _setPage(page, route) {
    this.setState({ page, route, currentMenu: null });
  }

  _onError(msg, scriptUrl, line, col, errObj) {
    console.log('WINDOW ERROR', arguments);
    //this._setPage(<div>Some errors occured!!</div>);
  }

  _onLanguageChange(lang) {
    this.setState({ language: getLanguage(Persist.getLangCode()) });
  }

  _keyDown(e) {
    switch (e.keyCode) {
      case 27:
        this._hideModal();
        this._closeMenu();
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

  _openMenu(currentMenu) {
    if (this.state.currentMenu != currentMenu) {
      this.setState({ currentMenu });
    }
  }

  _closeMenu() {
    if (this.state.currentMenu) {
      this.setState({ currentMenu: null });
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
          this.setState({ appCacheUpdate: true }); // Browser downloaded a new app cache.
        }
      });
    }

    window.onerror = this._onError.bind(this);
    window.addEventListener('resize', InterfaceEvents.windowResized);
    document.addEventListener('keydown', this._keyDown);
    Persist.addListener('language', this._onLanguageChange);
    Persist.addListener('language', this._onLanguageChange);
    InterfaceEvents.addListener('openMenu', this._openMenu);
    InterfaceEvents.addListener('closeMenu', this._closeMenu);
    InterfaceEvents.addListener('showModal', this._showModal);
    InterfaceEvents.addListener('hideModal', this._hideModal);

    Router.start();
  }

  render() {
    return (
      <div onClick={this._closeMenu}>
        <Header appCacheUpdate={this.state.appCacheUpdate} currentMenu={this.state.currentMenu} />
        { this.state.page ? <this.state.page currentMenu={this.state.currentMenu} /> : <NotFoundPage/> }
        { this.state.modal }
      </div>
    );
  }
}
