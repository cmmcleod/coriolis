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
 * Requires an onChange() function of the form onChange(sys, eng, wep, boost) which is triggered whenever the pips change.
 */
export default class Pips extends TranslatedComponent {
  static propTypes = {
    ship: React.PropTypes.object.isRequired,
    onChange: React.PropTypes.func.isRequired
  };

  /**
   * Constructor
   * @param  {Object} props   React Component properties
   * @param  {Object} context   React Component context
   */
  constructor(props, context) {
    super(props);
    const ship = props.ship;
    const pd = ship.standard[4].m;

    this._keyDown = this._keyDown.bind(this);
    this._toggleBoost = this._toggleBoost.bind(this);

    let pipsSvg = this._renderPips(2, 2, 2);
    this.state = {
      sys: 2,
      eng: 2,
      wep: 2,
      boost: false,
      sysCap: pd.getSystemsCapacity(),
      engCap: pd.getEnginesCapacity(),
      wepCap: pd.getWeaponsCapacity(),
      sysRate: pd.getSystemsRechargeRate(),
      engRate: pd.getEnginesRechargeRate(),
      wepRate: pd.getWeaponsRechargeRate(),
      pipsSvg
    };
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
   * Update values if we change ship
   * @param   {Object} nextProps   Incoming/Next properties
   * @returns {boolean}            Returns true if the component should be rerendered
   */
  componentWillReceiveProps(nextProps) {
    const { sysCap, engCap, wepCap, sysRate, engRate, wepRate } = this.state;
    const ship = nextProps.ship;
    const pd = ship.standard[4].m;

    const nextSysCap = pd.getSystemsCapacity();
    const nextEngCap = pd.getEnginesCapacity();
    const nextWepCap = pd.getWeaponsCapacity();
    const nextSysRate = pd.getSystemsRechargeRate();
    const nextEngRate = pd.getEnginesRechargeRate();
    const nextWepRate = pd.getWeaponsRechargeRate();
    if (nextSysCap != sysCap ||
        nextEngCap != engCap ||
        nextWepCap != wepCap ||
        nextSysRate != sysRate ||
        nextEngRate != engRate ||
        nextWepRate != wepRate) {
      this.setState({
        sysCap: nextSysCap,
        engCap: nextEngCap,
        wepCap: nextWepCap,
        sysRate: nextSysRate,
        engRate: nextEngRate,
        wepRate: nextWepRate
      });
    }

    return true;
  }

  /**
   * Handle Key Down
   * @param  {Event} e  Keyboard Event
   */
  _keyDown(e) {
    switch (e.keyCode) {
      case 9:     // Tab == boost
        e.preventDefault();
        this._toggleBoost();
        break;
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
    let { sys, eng, wep, boost } = this.state;
    if (sys != 2 || eng != 2 || wep != 2) {
      sys = eng = wep = 2;
      this.setState({ sys, eng, wep, pipsSvg: this._renderPips(sys, eng, wep) });
      this.props.onChange(sys, eng, wep, boost);
    }
  }

  /**
   * Increment the SYS capacitor
   */
  _incSys() {
    let { sys, eng, wep, boost } = this.state;

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
      this.setState({ sys, eng, wep, pipsSvg: this._renderPips(sys, eng, wep) });
      this.props.onChange(sys, eng, wep, boost);
    }
  }

  /**
   * Increment the ENG capacitor
   */
  _incEng() {
    let { sys, eng, wep, boost } = this.state;

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
      this.setState({ sys, eng, wep, pipsSvg: this._renderPips(sys, eng, wep) });
      this.props.onChange(sys, eng, wep, boost);
    }
  }

  /**
   * Increment the WEP capacitor
   */
  _incWep() {
    let { sys, eng, wep, boost } = this.state;

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
      this.setState({ sys, eng, wep, pipsSvg: this._renderPips(sys, eng, wep) });
      this.props.onChange(sys, eng, wep, boost);
    }
  }

  /**
   * Toggle the boost feature
   */
  _toggleBoost() {
    let { boost, sys, eng, wep } = this.state;
    boost = !boost;
    this.setState({ boost });
    this.props.onChange(sys, eng, wep, boost);
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
    const { ship } = this.props;
    const { boost, sys, eng, wep, sysCap, engCap, wepCap, sysRate, engRate, wepRate, pipsSvg } = this.state;

    const onSysClicked = this.onClick.bind(this, 'SYS');
    const onEngClicked = this.onClick.bind(this, 'ENG');
    const onWepClicked = this.onClick.bind(this, 'WEP');
    const onRstClicked = this.onClick.bind(this, 'RST');

    return (
      <div id='pips'>
        <table>
          <tbody>
	    { ship.canBoost() ?
            <tr>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td><button className={boost ? 'selected' : null} onClick={this._toggleBoost}>{translate('boost')}</button></td>
              <td>&nbsp;</td>
            </tr> : null }
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
            <tr>
              <td>{translate('capacity')} ({units.MJ})</td>
              <td>{formats.f1(sysCap)}</td>
              <td>{formats.f1(engCap)}</td>
              <td>{formats.f1(wepCap)}</td>
            </tr>
            <tr>
              <td>{translate('recharge')} ({units.MW})</td>
              <td>{formats.f1(sysRate * (sys / 4))}</td>
              <td>{formats.f1(engRate * (eng / 4))}</td>
              <td>{formats.f1(wepRate * (wep / 4))}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}
