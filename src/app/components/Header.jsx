import React from 'react';
import TranslatedComponent from './TranslatedComponent';
import Link from './Link';
import ActiveLink from './ActiveLink';
import cn from 'classnames';
import { Cogs, CoriolisLogo, Hammer, Rocket, StatsBars } from './SvgIcons';
import Ships from '../shipyard/Ships';
import InterfaceEvents from '../utils/InterfaceEvents';
import Persist from '../stores/Persist';
import ModalDeleteAll from './ModalDeleteAll';

export default class Header extends TranslatedComponent {

  constructor(props) {
    super(props);
    this.state = {
      openedMenu: null
    };

    this._close = this._close.bind(this);
    this.shipOrder = Object.keys(Ships).sort();
  }

  _close() {
    this.setState({ openedMenu: null });
  }

  _setInsurance(e) {
    e.stopPropagation();
    Persist.setInsurance('Beta'); // TODO: get insurance name
  }

  _setModuleDiscount(e) {
    e.stopPropagation();
    Persist.setModuleDiscount(0); // TODO: get module discount
  }

  _setShipDiscount(e) {
    e.stopPropagation();
    Persist.setShipDiscount(0); // TODO: get ship discount
  }

  _showDeleteAll(e) {
    e.preventDefault();
    InterfaceEvents.showModal(<ModalDeleteAll />);
    this._close();
  };

  _showBackup(e) {
    e.preventDefault();
    /*$state.go('modal.export', {
      title: 'backup',
      data: Persist.getAll(),
      description: 'PHRASE_BACKUP_DESC'
    });*/
    // TODO: implement modal
  };

  _showDetailedExport(e){
    e.preventDefault();
    e.stopPropagation();

    /*$state.go('modal.export', {
      title: 'detailed export',
      data: Serializer.toDetailedExport(Persist.getBuilds()),
      description: 'PHRASE_EXPORT_DESC'
    });*/
    // TODO: implement modal
  }

  _setTextSize(size) {
      Persist.setSizeRatio(size); // TODO: implement properly
  }

  _resetTextSize() {
    Persist.setSizeRatio(1);
  }

  _openMenu(event, openedMenu) {
    event.stopPropagation();

    if (this.state.openedMenu == openedMenu) {
      openedMenu = null;
    }

    this.setState({ openedMenu });
  }

  _getShipsMenu() {
    let shipList = [];

    for (let s in Ships) {
      shipList.push(<ActiveLink key={s} href={'/outfitting/' + s} className={'block'}>{Ships[s].properties.name}</ActiveLink>);
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
          let href = ['/outfitting/', shipId, '/', builds[shipId][buildName], '?bn=', buildName].join('');
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
      let comparisons = [];
      let comps =  Object.keys(Persist.getComparisons()).sort();
      console.log(comps);

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
          <li><select className={'cap'} ng-model="language.current" ng-options="langCode as langName for (langCode,langName) in language.opts" ng-change="changeLanguage()"></select></li>
        </ul><br/>
        <ul>
          {translate('insurance')}
          <li><select className={'cap'} ng-model="insurance.current" ng-options="ins.name | translate for (i,ins) in insurance.opts" ng-change="updateInsurance()"></select></li>
        </ul><br/>
        <ul>
          {translate('ship')} {translate('discount')}
          <li><select className={'cap'} ng-model="discounts.ship" ng-options="i for (i,d) in discounts.opts" ng-change="updateDiscount()"></select></li>
        </ul><br/>
        <ul>
          {translate('component')} {translate('discount')}
          <li><select className={'cap'} ng-model="discounts.components" ng-options="i for (i,d) in discounts.opts" ng-change="updateDiscount()"></select></li>
        </ul>
        <hr />
        <ul>
          {translate('builds')} & {translate('comparisons')}
          <li><a href="#" className={'block'} ng-click="backup($event)">{translate('backup')}</a></li>
          <li><a href="#" className={'block'} ng-click="detailedExport($event)">{translate('detailed export')}</a></li>
          <li><a href="#" className={'block'} ui-sref="modal.import">{translate('import')}</a></li>
          <li><a href="#" onClick={this._showDeleteAll.bind(this)}>{translate('delete all')}</a></li>
        </ul>
        <hr />
        <table style={{width: 300, backgroundColor: 'transparent'}}>
          <tbody>
            <tr>
              <td style={{width: 20}}><u>A</u></td>
              <td slider min="0.65" def="sizeRatio" max="1.2" on-change="textSizeChange(val)" ignore-resize="true"></td>
              <td style={{width: 20}}><span style={{fontSize: 30}}>A</span></td>
            </tr>
            <tr>
             <td></td><td style={{ textAlign: 'center' }} className={'primary-disabled cap'} ng-click="resetTextSize()" translate="reset"></td><td></td>
            </tr>
          </tbody>
        </table>
        <hr />
        <Link href="/about" className={'block'}>{translate('about')}</Link>
      </div>
    );
  }

  componentWillMount() {
    this.closeAllListener = InterfaceEvents.addListener('closeAll', this._close);
  }

  componentWillUnmount() {
    this.closeAllListener.remove();
  }

  render() {
    let translate = this.context.language.translate;
    let openedMenu = this.state.openedMenu;
    let hasBuilds = Persist.hasBuilds();

    if (this.props.appCacheUpdate) {
      return <div id="app-update" onClick={window.location.reload}>{ 'PHRASE_UPDATE_RDY' | translate }</div>;
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