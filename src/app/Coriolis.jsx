import React from 'react';
import Router from './Router';
import { EventEmitter } from 'fbemitter';
import { getLanguage } from './i18n/Language';
import Persist from './stores/Persist';

import Header from './components/Header';
import Tooltip from './components/Tooltip';

import AboutPage from './pages/AboutPage';
import NotFoundPage from './pages/NotFoundPage';
import OutfittingPage from './pages/OutfittingPage';
import ComparisonPage from './pages/ComparisonPage';
import ShipyardPage from './pages/ShipyardPage';

/**
 * Coriolis App
 */
export default class Coriolis extends React.Component {

  static childContextTypes = {
    language: React.PropTypes.object.isRequired,
    sizeRatio: React.PropTypes.number.isRequired,
    route: React.PropTypes.object.isRequired,
    openMenu: React.PropTypes.func.isRequired,
    closeMenu: React.PropTypes.func.isRequired,
    showModal: React.PropTypes.func.isRequired,
    hideModal: React.PropTypes.func.isRequired,
    tooltip: React.PropTypes.func.isRequired,
    termtip: React.PropTypes.func.isRequired,
    onWindowResize: React.PropTypes.func.isRequired
  };

  /**
   * Creates an instance of the Coriolis App
   */
  constructor() {
    super();
    this._setPage = this._setPage.bind(this);
    this._openMenu = this._openMenu.bind(this);
    this._closeMenu = this._closeMenu.bind(this);
    this._showModal = this._showModal.bind(this);
    this._hideModal = this._hideModal.bind(this);
    this._tooltip = this._tooltip.bind(this);
    this._termtip = this._termtip.bind(this);
    this._onWindowResize = this._onWindowResize.bind(this);
    this._onLanguageChange = this._onLanguageChange.bind(this);
    this._onSizeRatioChange = this._onSizeRatioChange.bind(this);
    this._keyDown = this._keyDown.bind(this);

    this.emitter = new EventEmitter();
    this.state = {
      page: null,
      language: getLanguage(Persist.getLangCode()),
      route: null,
      sizeRatio: Persist.getSizeRatio()
    };

    Router('', (r) => this._setPage(ShipyardPage, r));
    Router('/outfit/:ship/:code?', (r) => this._setPage(OutfittingPage, r));
    Router('/compare/:name?', (r) => this._setPage(ComparisonPage, r));
    Router('/comparison/:code', (r) => this._setPage(ComparisonPage, r));
    Router('/about', (r) => this._setPage(AboutPage, r));
    Router('*', (r) => this._setPage(null, r));
  }

  /**
   * Updates / Sets the page and route context
   * @param {[type]} page  The page to be shown
   * @param {Object} route The current route
   */
  _setPage(page, route) {
    this.setState({ page, route, currentMenu: null });
  }

  /**
   * Handle unexpected error
   * TODO: Implement and fix to work with Webpack (dev + prod)
   * @param  {string} msg         Message
   * @param  {string} scriptUrl   URL
   * @param  {number} line        Line number
   * @param  {number} col         Column number
   * @param  {Object} errObj      Error Object
   */
  _onError(msg, scriptUrl, line, col, errObj) {
    console.log('WINDOW ERROR', arguments);
    //  this._setPage(<div>Some errors occured!!</div>);
  }

  /**
   * Propagate language and format changes
   * @param  {string} lang Language code
   */
  _onLanguageChange(lang) {
    this.setState({ language: getLanguage(Persist.getLangCode()) });
  }

  /**
   * Propagate the sizeRatio change
   * @param  {number} sizeRatio Size ratio / scale
   */
  _onSizeRatioChange(sizeRatio) {
    this.setState({ sizeRatio });
  }

  /**
   * Handle Key Down
   * @param  {Event} e  Keyboard Event
   */
  _keyDown(e) {
    switch (e.keyCode) {
      case 27:
        this._hideModal();
        this._closeMenu();
        break;
    }
  }

  /**
   * Opens the modal display with the specified content
   * @param  {React.Component} content Modal Content
   */
  _showModal(content) {
    let modal = <div className='modal-bg' onTouchTap={(e) => this._hideModal() }>{content}</div>;
    this.setState({ modal });
  }

  /**
   * Hides any open modal
   */
  _hideModal() {
    if (this.state.modal) {
      this.setState({ modal: null });
    }
  }

  /**
   * Sets the open menu state
   * @param  {string|object} currentMenu The reference to the current menu
   */
  _openMenu(currentMenu) {
    if (this.state.currentMenu != currentMenu) {
      this.setState({ currentMenu });
    }
  }

  /**
   * Closes the open menu
   */
  _closeMenu() {
    if (this.state.currentMenu) {
      this.setState({ currentMenu: null });
    }
  }

  /**
   * Show/Hide the tooltip
   * @param  {React.Component} content Tooltip content
   * @param  {DOMRect} rect            Target bounding rect
   * @param  {[type]} opts             Options
   */
  _tooltip(content, rect, opts) {
    if (!content && this.state.tooltip) {
      this.setState({ tooltip: null });
    } else if (content && Persist.showTooltips()) {
      this.setState({ tooltip: <Tooltip rect={rect} options={opts}>{content}</Tooltip> });
    }
  }

  /**
   * Show the term tip
   * @param  {string} term            Term
   * @param  {[type]} orientation     Tooltip orientation (n,e,s,w)
   * @param  {SyntheticEvent} event   Event
   */
  _termtip(term, orientation, event) {
    if (typeof orientation != 'string') {
      event = orientation;
      orientation = null;
    }
    this._tooltip(<div className='cap cen'>{this.state.language.translate(term)}</div>, event.currentTarget.getBoundingClientRect(), { orientation });
  }

  /**
   * Add a listener to on window resize
   * @param  {Function} listener Listener callback
   * @return {Object}            Subscription token
   */
  _onWindowResize(listener) {
    return this.emitter.addListener('windowResize', listener);
  }

  /**
   * Creates the context to be passed down to pages / components containing
   * language, sizeRatio and route references
   * @return {object} Context to be passed down
   */
  getChildContext() {
    return {
      language: this.state.language,
      route: this.state.route,
      sizeRatio: this.state.sizeRatio,
      openMenu: this._openMenu,
      closeMenu: this._closeMenu,
      showModal: this._showModal,
      hideModal: this._hideModal,
      tooltip: this._tooltip,
      termtip: this._termtip,
      onWindowResize: this._onWindowResize
    };
  }

  /**
   * Adds necessary listeners and starts Routing
   */
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
    window.addEventListener('resize', () => this.emitter.emit('windowResize'));
    document.body.addEventListener('scroll', () => this._tooltip());
    document.addEventListener('keydown', this._keyDown);
    Persist.addListener('language', this._onLanguageChange);
    Persist.addListener('sizeRatio', this._onSizeRatioChange);

    Router.start();
  }

  /**
   * Renders the main app
   * @return {React.Component} The main app
   */
  render() {
    return <div onTouchTap={this._closeMenu}>
      <Header appCacheUpdate={this.state.appCacheUpdate} currentMenu={this.state.currentMenu} />
      { this.state.page ? <this.state.page currentMenu={this.state.currentMenu} /> : <NotFoundPage/> }
      { this.state.modal }
      { this.state.tooltip }
    </div>;
  }
}
