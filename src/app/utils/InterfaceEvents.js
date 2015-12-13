import { EventEmitter } from 'fbemitter';

/**
 * Utility class to be used as a Singleton for handling common
 * interface events and operations
 */
class InterfaceEvents extends EventEmitter {

  /**
   * Binds the class methods
   */
  constructor() {
    super();
    this.openMenu = this.openMenu.bind(this);
    this.closeMenu = this.closeMenu.bind(this);
    this.hideModal = this.hideModal.bind(this);
    this.showModal = this.showModal.bind(this);
    this.windowResized = this.windowResized.bind(this);
  }

  /**
   * [openMenu description]
   * @param  {[type]} menu [description]
   */
  openMenu(menu) {
    this.emit('openMenu', menu);
  }

  /**
   * Emits the close menu event
   */
  closeMenu() {
    this.emit('closeMenu');
  }

  /**
   * Emits the hide modal event
   */
  hideModal() {
    this.emit('hideModal');
  }

  /**
   * Emits the show modal event the content/component passed
   * @param  {React.Component} content React Component content
   */
  showModal(content) {
    this.emit('showModal', content);
  }

  windowResized() {
    // debounce/ throttle
    this.emit('windowResized');
  }
}

export default new InterfaceEvents();

/**
 * Wraps the callback/context menu handler such that the default
 * operation can proceed if the SHIFT key is held while right-clicked
 * @param  {Function} cb Callback for contextMenu
 * @return {Function}    Wrapped contextmenu handler
 */
export function wrapCtxMenu(cb) {
  return (event) => {
    if (!event.getModifierState('Shift')) {
      event.preventDefault();
      cb.call(null, event);
    }
  };
}