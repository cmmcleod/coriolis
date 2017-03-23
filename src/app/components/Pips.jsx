import React from 'react';
import TranslatedComponent from './TranslatedComponent';
import { Ships } from 'coriolis-data/dist';
import ShipSelector from './ShipSelector';
import { nameComparator } from '../utils/SlotFunctions';
import { Pip } from './SvgIcons';
import LineChart from '../components/LineChart';
import Slider from '../components/Slider';
import * as ModuleUtils from '../shipyard/ModuleUtils';
import Module from '../shipyard/Module';

/**
 * Pips displays SYS/ENG/WEP pips and allows users to change them with key presses by clicking on the relevant area.
 * Requires an onChange() function of the form onChange(sys, eng, wep) which is triggered whenever the pips change.
 */
export default class Pips extends TranslatedComponent {
  static propTypes = {
    sys: React.PropTypes.number.isRequired,
    eng: React.PropTypes.number.isRequired,
    wep: React.PropTypes.number.isRequired,
    onChange: React.PropTypes.func.isRequired
  };

  /**
   * Constructor
   * @param  {Object} props   React Component properties
   * @param  {Object} context   React Component context
   */
  constructor(props, context) {
    super(props);
    const { sys, eng, wep } = props;

    this._keyDown = this._keyDown.bind(this);
  }

  /**
   * Add listeners after mounting
   */
  componentDidMount() {
    document.addEventListener('keydown', this._keyDown);
  }

  /**
   * Remove listeners before unmounting
   */
  componentWillUnmount() {
    document.removeEventListener('keydown', this._keyDown);
  }

  /**
   * Handle Key Down
   * @param  {Event} e  Keyboard Event
   */
  _keyDown(e) {
    if (e.ctrlKey || e.metaKey) { // CTRL/CMD
      switch (e.keyCode) {
        case 37:     // Left arrow == increase SYS
          e.preventDefault();
          this._incSys();
          break;
        case 38:     // Up arrow == increase ENG
          e.preventDefault();
          this._incEng();
          break;
        case 39:     // Right arrow == increase WEP
          e.preventDefault();
          this._incWep();
          break;
        case 40:     // Down arrow == reset
          e.preventDefault();
          this._reset();
          break;
      }
    }
  }

  /**
   * Handle a click
   * @param {string} which  Which item was clicked
   */
  onClick(which) {
    if (which == 'SYS') {
      this._incSys();
    } else if (which == 'ENG') {
      this._incEng();
    } else if (which == 'WEP') {
      this._incWep();
    } else if (which == 'RST') {
      this._reset();
    }
  }

  /**
   * Reset the capacitor
   */
  _reset() {
    let { sys, eng, wep } = this.props;
    if (sys != 2 || eng != 2 || wep != 2) {
      sys = eng = wep = 2;
      this.props.onChange(sys, eng, wep);
    }
  }

  /**
   * Increment the SYS capacitor
   */
  _incSys() {
    let { sys, eng, wep } = this.props;

    const required = Math.min(1, 4 - sys);
    if (required > 0) {
      if (required == 0.5) {
        // Take from whichever is larger
        if (eng > wep) {
          eng -= 0.5;
          sys += 0.5;
        } else {
          wep -= 0.5;
          sys += 0.5;
        }
      } else {
        // Required is 1 - take from both if possible
        if (eng == 0) {
          wep -= 1;
          sys += 1;
        } else if (wep == 0) {
          eng -= 1;
          sys += 1;
        } else {
          eng -= 0.5;
          wep -= 0.5;
          sys += 1;
        }
      }
      this.props.onChange(sys, eng, wep);
    }
  }

  /**
   * Increment the ENG capacitor
   */
  _incEng() {
    let { sys, eng, wep } = this.props;

    const required = Math.min(1, 4 - eng);
    if (required > 0) {
      if (required == 0.5) {
        // Take from whichever is larger
        if (sys > wep) {
          sys -= 0.5;
          eng += 0.5;
        } else {
          wep -= 0.5;
          eng += 0.5;
        }
      } else {
        // Required is 1 - take from both if possible
        if (sys == 0) {
          wep -= 1;
          eng += 1;
        } else if (wep == 0) {
          sys -= 1;
          eng += 1;
        } else {
          sys -= 0.5;
          wep -= 0.5;
          eng += 1;
        }
      }
      this.props.onChange(sys, eng, wep);
    }
  }

  /**
   * Increment the WEP capacitor
   */
  _incWep() {
    let { sys, eng, wep } = this.props;

    const required = Math.min(1, 4 - wep);
    if (required > 0) {
      if (required == 0.5) {
        // Take from whichever is larger
        if (sys > eng) {
          sys -= 0.5;
          wep += 0.5;
        } else {
          eng -= 0.5;
          wep += 0.5;
        }
      } else {
        // Required is 1 - take from both if possible
        if (sys == 0) {
          eng -= 1;
          wep += 1;
        } else if (eng == 0) {
          sys -= 1;
          wep += 1;
        } else {
          sys -= 0.5;
          eng -= 0.5;
          wep += 1;
        }
      }
      this.props.onChange(sys, eng, wep);
    }
  }

  /**
   * Set up the rendering for pips
   * @param   {int}     sys the SYS pips
   * @param   {int}     eng the ENG pips
   * @param   {int}     wep the WEP pips
   * @returns {Object}      Object containing the rendering for the pips
   */
  _renderPips(sys, eng, wep) {
    const pipsSvg = {};

    // SYS
    pipsSvg['SYS'] = [];
    for (let i = 0; i < Math.floor(sys); i++) {
      pipsSvg['SYS'].push(<Pip className='full' key={i} />);
    }
    if (sys > Math.floor(sys)) {
      pipsSvg['SYS'].push(<Pip className='half' key={'half'} />);
    }
    for (let i = Math.floor(sys + 0.5); i < 4; i++) {
      pipsSvg['SYS'].push(<Pip className='empty' key={i} />);
    }

    // ENG
    pipsSvg['ENG'] = [];
    for (let i = 0; i < Math.floor(eng); i++) {
      pipsSvg['ENG'].push(<Pip className='full' key={i} />);
    }
    if (eng > Math.floor(eng)) {
      pipsSvg['ENG'].push(<Pip className='half' key={'half'} />);
    }
    for (let i = Math.floor(eng + 0.5); i < 4; i++) {
      pipsSvg['ENG'].push(<Pip className='empty' key={i} />);
    }

    // WEP
    pipsSvg['WEP'] = [];
    for (let i = 0; i < Math.floor(wep); i++) {
      pipsSvg['WEP'].push(<Pip className='full' key={i} />);
    }
    if (wep > Math.floor(wep)) {
      pipsSvg['WEP'].push(<Pip className='half' key={'half'} />);
    }
    for (let i = Math.floor(wep + 0.5); i < 4; i++) {
      pipsSvg['WEP'].push(<Pip className='empty' key={i} />);
    }

    return pipsSvg;
  }

  /**
   * Render pips
   * @return {React.Component} contents
   */
  render() {
    const { formats, translate, units } = this.context.language;
    const { sys, eng, wep } = this.props;

    const onSysClicked = this.onClick.bind(this, 'SYS');
    const onEngClicked = this.onClick.bind(this, 'ENG');
    const onWepClicked = this.onClick.bind(this, 'WEP');
    const onRstClicked = this.onClick.bind(this, 'RST');

    const pipsSvg = this._renderPips(sys, eng, wep);
    return (
      <span id='pips'>
        <table>
          <tbody>
            <tr>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td className='clickable' onClick={onEngClicked}>{pipsSvg['ENG']}</td>
              <td>&nbsp;</td>
            </tr>
            <tr>
              <td>&nbsp;</td>
              <td className='clickable' onClick={onSysClicked}>{pipsSvg['SYS']}</td>
              <td className='clickable' onClick={onEngClicked}>{translate('ENG')}</td>
              <td className='clickable' onClick={onWepClicked}>{pipsSvg['WEP']}</td>
            </tr>
            <tr>
              <td>&nbsp;</td>
              <td className='clickable' onClick={onSysClicked}>{translate('SYS')}</td>
              <td className='clickable' onClick={onRstClicked}>{translate('RST')}</td>
              <td className='clickable' onClick={onWepClicked}>{translate('WEP')}</td>
            </tr>
          </tbody>
        </table>
      </span>
    );
  }
}
