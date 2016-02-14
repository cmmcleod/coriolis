import React from 'react';
import Router from './Router';
import { EventEmitter } from 'fbemitter';
import { getLanguage } from './i18n/Language';
import Persist from './stores/Persist';

import Header from './components/Header';
import Tooltip from './components/Tooltip';
import ModalImport from './components/ModalImport';

import AboutPage from './pages/AboutPage';
import NotFoundPage from './pages/NotFoundPage';
import OutfittingPage from './pages/OutfittingPage';
import ComparisonPage from './pages/ComparisonPage';
import ShipyardPage from './pages/ShipyardPage';
import ErrorDetails from './pages/ErrorDetails';

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
    onWindowResize: React.PropTypes.func.isRequired,
    onCommand: React.PropTypes.func.isRequired
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
    this._onCommand = this._onCommand.bind(this);
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
    this.setState({ page, route, currentMenu: null, modal: null, error: null });
  }

  /**
   * Handle unexpected error. This is most likely an unhandled React Error which
   * is also most likely unrecoverable. The best option is to catch as many details
   * as possible so the user can report the error and provide a link to reload the page
   * to reset the VM and clear any error state.
   *
   * @param  {string} msg         Message
   * @param  {string} scriptUrl   URL
   * @param  {number} line        Line number
   * @param  {number} col         Column number
   * @param  {Object} errObj      Error Object
   */
  _onError(msg, scriptUrl, line, col, errObj) {
    console && console.error && console.error(arguments); // eslint-disable-line no-console
    this.setState({
      error: <ErrorDetails error={{ message: msg, details: { scriptUrl, line, col, error: JSON.stringify(errObj) } }}/>,
      page: null,
      currentMenu: null,
      modal: null
    });
    // TODO: Improve in the event of React Errors
    // Potentially ReactDOM.render into dom here instead
    // ReactDOM.render(this, document.getElementById('coriolis'));
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
    // .keyCode will eventually be replaced with .key
    switch (e.keyCode) {
      case 27:    // Escape Key
        this._hideModal();
        this._closeMenu();
        break;
      case 73:     // 'i'
        if (e.ctrlKey || e.metaKey) { // CTRL/CMD + i
          e.preventDefault();
          this._showModal(<ModalImport />);
        }
        break;
      case 101010:  // 's'
        if (e.ctrlKey || e.metaKey) { // CTRL/CMD + i
          e.preventDefault();
          this.emitter.emit('command', 'save');
        }
    }
  }

  /**
   * Opens the modal display with the specified content
   * @param  {React.Component} content Modal Content
   */
  _showModal(content) {
    let modal = <div className='modal-bg' onClick={(e) => this._hideModal() }>{content}</div>;
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
   * @param  {string} term            Term or Phrase
   * @param  {Object} opts            Options - dontCap, orientation (n,e,s,w)
   * @param  {SyntheticEvent} event   Event
   */
  _termtip(term, opts, event) {
    if (opts && opts.nativeEvent) { // Opts is a SyntheticEvent
      event = opts;
      opts = { cap: true };
    }
    this._tooltip(
      <div className={'cen' + (opts.cap ? ' cap' : '')}>{this.state.language.translate(term)}</div>,
      event.currentTarget.getBoundingClientRect(),
      opts
    );
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
   * Add a listener to global commands such as save,
   * @param  {Function} listener Listener callback
   * @return {Object}            Subscription token
   */
  _onCommand(listener) {
    return this.emitter.addListener('command', listener);
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
      onWindowResize: this._onWindowResize,
      onCommand: this._onCommand
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
    return <div onClick={this._closeMenu}>
      <Header appCacheUpdate={this.state.appCacheUpdate} currentMenu={this.state.currentMenu} />
      { this.state.error ? this.state.error : this.state.page ? <this.state.page currentMenu={this.state.currentMenu} /> : <NotFoundPage/> }
      { this.state.modal }
      { this.state.tooltip }
    </div>;
  }
}
