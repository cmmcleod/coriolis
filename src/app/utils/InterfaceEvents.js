import { EventEmitter } from 'fbemitter';

class InterfaceEvents extends EventEmitter {

  constructor() {
    super();
    this.openMenu = this.openMenu.bind(this);
    this.closeAll = this.closeAll.bind(this);
    this.hideModal = this.hideModal.bind(this);
    this.showModal = this.showModal.bind(this);
  }

  openMenu(menu) {
    this.emit('openMenu', menu);
  }

  closeAll() {
    this.emit('closeAll', null);
  }

  hideModal() {
    this.emit('hideModal');
  }

  showModal(content) {
    this.emit('showModal', content);
  }
}

export default new InterfaceEvents();

export function contextMenuHandler(cb) {
  return (event) => {
    if (!event.getModifierState('Shift')){
      event.preventDefault();
      cb.call(null, event);
    }
  };
}