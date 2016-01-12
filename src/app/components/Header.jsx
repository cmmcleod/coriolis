import React from 'react';
import TranslatedComponent from './TranslatedComponent';
import { Languages } from '../i18n/Language';
import { Insurance, Discounts } from '../shipyard/Constants';
import Link from './Link';
import ActiveLink from './ActiveLink';
import cn from 'classnames';
import { Cogs, CoriolisLogo, Hammer, Rocket, StatsBars } from './SvgIcons';
import { Ships } from 'coriolis-data';
import InterfaceEvents from '../utils/InterfaceEvents';
import Persist from '../stores/Persist';
import { toDetailedExport } from '../shipyard/Serializer';
import ModalDeleteAll from './ModalDeleteAll';
import ModalExport from './ModalExport';
import ModalImport from './ModalImport';
import Slider from './Slider';

const SIZE_MIN = 0.65;
const SIZE_RANGE = 0.55;

export default class Header extends TranslatedComponent {

  constructor(props, context) {
    super(props);
    this.shipOrder = Object.keys(Ships).sort();

    this._setLanguage = this._setLanguage.bind(this);
    this._setInsurance = this._setInsurance.bind(this);

    this.languageOptions = [];
    this.insuranceOptions = [];
    this.discountOptions = [];

    let translate = context.language.translate;

    for (let langCode in Languages) {
      this.languageOptions.push(<option key={langCode} value={langCode}>{Languages[langCode]}</option>);
    }

    for (let name in Insurance) {
      this.insuranceOptions.push(<option key={name} value={name}>{translate(name)}</option>);
    }

    for (let name in Discounts) {
      this.discountOptions.push(<option key={name} value={Discounts[name]}>{name}</option>);
    }

  }

  _setInsurance(e) {
    Persist.setInsurance(e.target.value);
  }

  _setModuleDiscount(e) {
    Persist.setModuleDiscount(e.target.value * 1);
  }

  _setShipDiscount(e) {
    Persist.setShipDiscount(e.target.value * 1);
  }

  _setLanguage(e){
    Persist.setLangCode(e.target.value);
  }

  _showDeleteAll(e) {
    e.preventDefault();
    InterfaceEvents.showModal(<ModalDeleteAll />);
  };

  _showBackup(e) {
    let translate = this.context.language.translate;
    e.preventDefault();
    InterfaceEvents.showModal(<ModalExport
      title={translate('backup')}
      description={translate('PHRASE_BACKUP_DESC')}
      data={Persist.getAll()}
    />);
  };

  _showDetailedExport(e){
    let translate = this.context.language.translate;
    e.preventDefault();

    InterfaceEvents.showModal(<ModalExport
      title={translate('detailed export')}
      description={translate('PHRASE_EXPORT_DESC')}
      data={toDetailedExport(Persist.getBuilds())}
    />);
  }

  _showImport(e) {
    e.preventDefault();
    InterfaceEvents.showModal(<ModalImport/>);
  }

  _setTextSize(size) {
    Persist.setSizeRatio((size * SIZE_RANGE) + SIZE_MIN);
  }

  _resetTextSize() {
    Persist.setSizeRatio(1);
  }

  _openMenu(event, menu) {
    event.stopPropagation();

    if (this.props.currentMenu == menu) {
      menu = null;
    }

    InterfaceEvents.openMenu(menu);
  }

  _getShipsMenu() {
    let shipList = [];

    for (let s in Ships) {
      shipList.push(<ActiveLink key={s} href={'/outfit/' + s} className={'block'}>{Ships[s].properties.name}</ActiveLink>);
    }

    return (
      <div className={'menu-list dbl no-wrap'} onClick={ (e) => e.stopPropagation() }>
        {shipList}
      </div>
    );
  }

  _getBuildsMenu() {
    let builds = Persist.getBuilds();
    let buildList = [];
    for (let shipId of this.shipOrder) {
      if (builds[shipId]) {
        let shipBuilds = [];
        let buildNameOrder = Object.keys(builds[shipId]).sort();
        for (let buildName of buildNameOrder) {
          let href = ['/outfit/', shipId, '/', builds[shipId][buildName], '?bn=', buildName].join('');
          shipBuilds.push(<li key={shipId + '-' + buildName} ><ActiveLink href={href} className={'block'}>{buildName}</ActiveLink></li>);
        }
        buildList.push(<ul key={shipId}>{Ships[shipId].properties.name}{shipBuilds}</ul>);
      }
    }

    return (
      <div className={'menu-list'} onClick={ (e) => e.stopPropagation() }>
        <div className={'dbl'}>{buildList}</div>
      </div>
    );
  }

  _getComparisonsMenu() {
    let comparisons;
    let translate = this.context.language.translate;

    if (Persist.hasComparisons()) {
      comparisons = [];
      let comps =  Object.keys(Persist.getComparisons()).sort();

      for (let name of comps) {
        comparisons.push(<ActiveLink key={name} href={'/compare/' + name} className={'block name'}>{name}</ActiveLink>);
      }
    } else {
      comparisons = <span className={'cap'}>{translate('none created')}</span>;
    }

    return (
      <div className={'menu-list'} onClick={ (e) => e.stopPropagation() } style={{ whiteSpace: 'nowrap' }}>
        {comparisons}
        <hr />
        <Link href='/compare/all' ui-sref="compare({name: 'all'})" className={'block cap'}>{translate('compare all')}</Link>
        <Link href='/compare' className={'block cap'}>{translate('create new')}</Link>
      </div>
    );
  }

  _getSettingsMenu() {
    let translate = this.context.language.translate;

    return (
      <div className={'menu-list no-wrap cap'} onClick={ (e) => e.stopPropagation() }>
        <ul>
          {translate('language')}
          <li>
            <select className={'cap'} value={Persist.getLangCode()} onChange={this._setLanguage}>
            {this.languageOptions}
            </select>
          </li>
        </ul><br/>
        <ul>
          {translate('insurance')}
          <li>
            <select className={'cap'} value={Persist.getInsurance()} onChange={this._setInsurance}>
            {this.insuranceOptions}
            </select>
          </li>
        </ul><br/>
        <ul>
          {translate('ship')} {translate('discount')}
          <li>
            <select className={'cap'} value={Persist.getShipDiscount()} onChange={this._setShipDiscount}>
            {this.discountOptions}
            </select>
          </li>
        </ul><br/>
        <ul>
          {translate('module')} {translate('discount')}
          <li>
            <select className={'cap'} value={Persist.getModuleDiscount()} onChange={this._setModuleDiscount} >
            {this.discountOptions}
            </select>
          </li>
        </ul>
        <hr />
        <ul>
          {translate('builds')} & {translate('comparisons')}
          <li><a href="#" className={'block'} onClick={this._showBackup.bind(this)}>{translate('backup')}</a></li>
          <li><a href="#" className={'block'} onClick={this._showDetailedExport.bind(this)}>{translate('detailed export')}</a></li>
          <li><a href="#" className={'block'} onClick={this._showImport.bind(this)}>{translate('import')}</a></li>
          <li><a href="#" onClick={this._showDeleteAll.bind(this)}>{translate('delete all')}</a></li>
        </ul>
        <hr />
        <table style={{width: 300, backgroundColor: 'transparent'}}>
          <tbody>
            <tr>
              <td style={{ width: '1em', verticalAlign: 'top' }}><u>A</u></td>
              <td><Slider onChange={this._setTextSize} percent={(Persist.getSizeRatio() - SIZE_MIN) / SIZE_RANGE} /></td>
              <td style={{ width: 20 }}><span style={{ fontSize: 30 }}>A</span></td>
            </tr>
            <tr>
             <td colSpan='3' style={{ textAlign: 'center', cursor: 'pointer' }} className={'primary-disabled cap'} onClick={this._resetTextSize.bind(this)}>{translate('reset')}</td>
            </tr>
          </tbody>
        </table>
        <hr />
        <Link href="/about" className={'block'}>{translate('about')}</Link>
      </div>
    );
  }

  componentWillMount(){
    Persist.addListener('language', () => this.forceUpdate());
    Persist.addListener('insurance', () => this.forceUpdate());
    Persist.addListener('discounts', () => this.forceUpdate());
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if(this.context.language != nextContext.language) {
      let translate = nextContext.language.translate;
      this.insuranceOptions = [];
      for (let name in Insurance) {
        this.insuranceOptions.push(<option key={name} value={name}>{translate(name)}</option>);
      }
    }
  }

  render() {
    let translate = this.context.language.translate;
    let openedMenu = this.props.currentMenu;
    let hasBuilds = Persist.hasBuilds();

    if (this.props.appCacheUpdate) {
      return <div id="app-update" onClick={() => window.location.reload() }>{translate('PHRASE_UPDATE_RDY')}</div>;
    }

    return (
      <header>
        <Link className={'l'} href="/" style={{marginRight: '1em'}} title="Home"><CoriolisLogo className={'icon xl'} /></Link>

        <div className={'l menu'}>
          <div className={cn('menu-header', {selected: openedMenu == 's'})} onClick={ (e) => this._openMenu(e,'s') } >
            <Rocket className={'warning'} /><span className={'menu-item-label'}>{' ' + translate('ships')}</span>
          </div>
          {openedMenu == 's' ? this._getShipsMenu() : null}
        </div>

        <div className={'l menu'}>
          <div className={cn('menu-header', {selected: openedMenu == 'b', disabled: !hasBuilds})} onClick={ hasBuilds ? (e) => this._openMenu(e,'b') : null }>
            <Hammer className={cn('warning', { 'warning-disabled': !hasBuilds})} /><span className={'menu-item-label'}>{' ' + translate('builds')}</span>
          </div>
          {openedMenu == 'b' ? this._getBuildsMenu() : null}
        </div>

        <div className={'l menu'}>
          <div className={cn('menu-header', {selected: openedMenu == 'comp', disabled: !hasBuilds})} onClick={ hasBuilds ? (e) => this._openMenu(e,'comp') : null }>
            <StatsBars className={cn('warning', { 'warning-disabled': !hasBuilds})} /><span className={'menu-item-label'}>{' ' + translate('compare')}</span>
          </div>
          {openedMenu == 'comp' ? this._getComparisonsMenu() : null}
        </div>

        <div className={'r menu'}>
          <div className={cn('menu-header', {selected: openedMenu == 'settings'})}onClick={ (e) => this._openMenu(e,'settings') }>
            <Cogs className={'xl warning'}/><span className={'menu-item-label'}>{translate('settings')}</span>
          </div>
          {openedMenu == 'settings' ? this._getSettingsMenu() : null}
        </div>
      </header>
    );
  }

}