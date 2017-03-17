import React from 'react';
import cn from 'classnames';
import { Ships } from 'coriolis-data/dist';
import Ship from '../shipyard/Ship';
import { Insurance } from '../shipyard/Constants';
import { slotName, slotComparator } from '../utils/SlotFunctions';
import TranslatedComponent from './TranslatedComponent';
import PowerManagement from './PowerManagement';
import CostSection from './CostSection';
import EngineProfile from './EngineProfile';
import FSDProfile from './FSDProfile';
import Movement from './Movement';
import Defence from './Defence';

/**
 * Outfitting subpages
 */
export default class OutfittingSubpages extends TranslatedComponent {

  static propTypes = {
    ship: React.PropTypes.object.isRequired,
    code: React.PropTypes.string.isRequired,
    onChange: React.PropTypes.func.isRequired,
    chartWidth: React.PropTypes.number.isRequired,
    buildName: React.PropTypes.string,
    sys: React.PropTypes.number.isRequired,
    eng: React.PropTypes.number.isRequired,
    wep: React.PropTypes.number.isRequired,
    cargo: React.PropTypes.number.isRequired,
    fuel: React.PropTypes.number.isRequired,
    boost: React.PropTypes.bool.isRequired,
    engagementRange: React.PropTypes.number.isRequired,
    opponent: React.PropTypes.object.isRequired,
    opponentBuild: React.PropTypes.string
  };

  /**
   * Constructor
   * @param  {Object} props   React Component properties
   */
  constructor(props) {
    super(props);
    this._powerTab = this._powerTab.bind(this);

    this.state = {
      tab: 'power'
    };
  }

  /**
   * Show selected tab
   * @param  {string} tab Tab name
   */
  _showTab(tab) {
    this.setState({ tab });
  }

  /**
   * Render the power tab
   * @return {React.Component} Tab contents
   */
  _powerTab() {
    let { ship, buildName, code, onChange } = this.props;

    return <div>
      <PowerManagement ship={ship} code={code} onChange={onChange} />
      <CostSection ship={ship} buildName={buildName} code={code} />
    </div>;
  }

  /**
   * Render the profiles tab
   * @return {React.Component} Tab contents
   */
  _profilesTab() {
    const { ship, code, chartWidth, cargo, fuel, eng, boost } = this.props;
    let realBoost = boost && ship.canBoost();

    const engineProfileMarker = `${ship.toString()}:${cargo}:${fuel}:${eng}:${realBoost}`;
    const fsdProfileMarker = `${ship.toString()}:${cargo}:${fuel}`;
    const movementMarker = `${ship.topSpeed}:${ship.pitch}:${ship.roll}:${ship.yaw}:${ship.canBoost()}`;

    return <div>
      <div className='group third'>
        <EngineProfile ship={ship} marker={engineProfileMarker} chartWidth={chartWidth} fuel={fuel} cargo={cargo} eng={eng} boost={realBoost} />
      </div>

      <div className='group third'>
        <FSDProfile ship={ship} marker={fsdProfileMarker} fuel={fuel} cargo={cargo} chartWidth={chartWidth} />
      </div>

      <div className='group third'>
        <Movement marker={movementMarker} ship={ship} boost={boost} eng={eng} cargo={cargo} fuel={fuel}/>
      </div>
    </div>;
  }

  /**
   * Render the offence tab
   * @return {React.Component} Tab contents
   */
  _offenceTab() {
    const { ship, sys, eng, wep, cargo, fuel, boost, engagementRange, opponent, opponentBuild } = this.props;

    return <div>
      <h1>Offence goes here</h1>
    </div>;
  }

  /**
   * Render the defence tab
   * @return {React.Component} Tab contents
   */
  _defenceTab() {
    const { ship, sys, eng, wep, cargo, fuel, boost, engagementRange, opponent, opponentBuild } = this.props;

    const marker = `${ship.shield}:${ship.shieldCells}:${ship.shieldExplRes}:${ship.shieldKinRes}:${ship.shieldThermRes}:${ship.armour}:${ship.standard[4].m.getSystemsCapacity()}:${ship.standard[4].m.getSystemsRechargeRate()}:${opponent.name}:${opponentBuild}:${engagementRange}`;

    return <div>
      <Defence marker={marker} ship={ship} opponent={opponent} sys={sys} engagementrange={engagementRange}/>
    </div>;
  }

  /**
   * Render the section
   * @return {React.Component} Contents
   */
  render() {
    const tab = this.state.tab || 'power';
    const translate = this.context.language.translate;
    let tabSection;

    switch (tab) {
      case 'power': tabSection = this._powerTab(); break;
      case 'profiles': tabSection = this._profilesTab(); break;
      case 'offence': tabSection = this._offenceTab(); break;
      case 'defence': tabSection = this._defenceTab(); break;
    }

    return (
      <div className='group full' style={{ minHeight: '1000px' }}>
        <table className='tabs'>
          <thead>
            <tr>
              <th style={{ width:'25%' }} className={cn({ active: tab == 'power' })} onClick={this._showTab.bind(this, 'power')} >{translate('power and costs')}</th>
              <th style={{ width:'25%' }} className={cn({ active: tab == 'profiles' })} onClick={this._showTab.bind(this, 'profiles')} >{translate('profiles')}</th>
              <th style={{ width:'25%' }} className={cn({ active: tab == 'offence' })} onClick={this._showTab.bind(this, 'offence')} >{translate('offence')}</th>
              <th style={{ width:'25%' }} className={cn({ active: tab == 'defence' })} onClick={this._showTab.bind(this, 'defence')} >{translate('defence')}</th>
            </tr>
          </thead>
        </table>
        {tabSection}
      </div>
    );
  }
}
