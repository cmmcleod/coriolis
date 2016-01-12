import React from 'react';
import cn from 'classnames';
import TranslatedComponent from './TranslatedComponent';
import InterfaceEvents from '../utils/InterfaceEvents';
import Persist from '../stores/Persist';
import { Ships } from 'coriolis-data';
import Ship from '../shipyard/Ship';
import * as ModuleUtils from '../shipyard/ModuleUtils';
import { Download } from './SvgIcons';


const textBuildRegex = new RegExp('^\\[([\\w \\-]+)\\]\n');
const lineRegex = new RegExp('^([\\dA-Z]{1,2}): (\\d)([A-I])[/]?([FGT])?([SD])? ([\\w\\- ]+)');
const mountMap = { 'H': 4, 'L': 3, 'M': 2, 'S': 1, 'U': 0 };
const standardMap = { 'RB': 0, 'TM': 1, 'FH': 2, 'EC': 3, 'PC': 4, 'SS': 5, 'FS': 6 };
const bhMap = { 'lightweight alloy': 0, 'reinforced alloy': 1, 'military grade composite': 2, 'mirrored surface composite': 3, 'reactive surface composite': 4 };

function isEmptySlot(slot) {
  return slot.maxClass == this && slot.m === null;
}

function equalsIgnoreCase(str) {
  return str.toLowerCase() == this.toLowerCase();
}

function validateBuild(shipId, code, name) {
  let shipData = Ships[shipId];

  if (!shipData) {
    throw '"' + shipId + '" is not a valid Ship Id!';
  }
  if (typeof name != 'string' || name.length == 0) {
    throw shipData.properties.name + ' build "' + name + '" must be a string at least 1 character long!';
  }
  if (typeof code != 'string' || code.length < 10) {
    throw shipData.properties.name + ' build "' + name + '" is not valid!';
  }
  try {
    let ship = new Ship(shipId, shipData.properties, shipData.slots);
    ship.buildFrom(code);
  } catch (e) {
    throw shipData.properties.name + ' build "' + name + '" is not valid!';
  }
}

function detailedJsonToBuild(detailedBuild) {
  let ship;
  if (!detailedBuild.name) {
    throw 'Build Name missing!';
  }

  if (!detailedBuild.name.trim()) {
    throw 'Build Name must be a string at least 1 character long!';
  }

  try {
    ship = Serializer.fromDetailedBuild(detailedBuild);
  } catch (e) {
    throw detailedBuild.ship + ' Build "' + detailedBuild.name + '": Invalid data';
  }

  return { shipId: ship.id, name: detailedBuild.name, code: ship.toString() };
}

export default class ModalImport extends TranslatedComponent {

  constructor(props) {
    super(props);

    this.state = {
      builds: null,
      canEdit: true,
      comparisons: null,
      discounts: null,
      errorMsg: null,
      importString: null,
      importValid: false,
      insurance: null
    };

    this._process = this._process.bind(this);
    this._import = this._import.bind(this);
    this._importBackup = this._importBackup.bind(this);
    this._importDetailedArray = this._importDetailedArray.bind(this);
    this._importTextBuild = this._importTextBuild.bind(this);
    this._validateImport = this._validateImport.bind(this);
  }

  _importBackup(importData) {
    if (importData.builds && typeof importData.builds == 'object') {
      for (let shipId in importData.builds) {
        for (let buildName in importData.builds[shipId]) {
          validateBuild(shipId, importData.builds[shipId][buildName], buildName);
        }
      }
      this.setState({ builds: importData.builds });
    } else {
      throw 'builds must be an object!';
    }
    if (importData.comparisons) {
      for (let compName in importData.comparisons) {
        let comparison = importData.comparisons[compName];
        for (let i = 0, l = comparison.builds.length; i < l; i++) {
          let build = comparison.builds[i];
          if (!importData.builds[build.shipId] || !importData.builds[build.shipId][build.buildName]) {
            throw build.shipId + ' build "' + build.buildName + '" data is missing!';
          }
        }
      }
      this.setState({ comparisons: importData.comparisons });
    }
    if (importData.discounts instanceof Array && importData.discounts.length == 2) {
      this.setState({ discounts: importData.discounts });
    }
    if (typeof importData.insurance == 'string' && importData.insurance.length > 3) {
      this.setState({ insurance: importData.insurance });
    }
  }

  _importDetailedArray(importArr) {
    let builds = {};
    for (let i = 0, l = importArr.length; i < l; i++) {
      let build = detailedJsonToBuild(importArr[i]);
      if (!builds[build.shipId]) {
        builds[build.shipId] = {};
      }
      builds[build.shipId][build.name] = build.code;
    }
    this.setState({ builds });
  }

  _importTextBuild(buildStr) {
    let buildName = textBuildRegex.exec(buildStr)[1].trim();
    let shipName = buildName.toLowerCase();
    let shipId = null;

    for (let sId in Ships) {
      if (Ships[sId].properties.name.toLowerCase() == shipName) {
        shipId = sId;
        break;
      }
    }

    if (!shipId) {
      throw 'No such ship found: "' + buildName + '"';
    }

    let lines = buildStr.split('\n');
    let ship = new Ship(shipId, Ships[shipId].properties, Ships[shipId].slots);
    ship.buildWith(null);

    for (let i = 1; i < lines.length; i++) {
      let line = lines[i].trim();

      if (!line) { continue; }
      if (line.substring(0, 3) == '---') { break; }

      let parts = lineRegex.exec(line);

      if (!parts) { throw 'Error parsing: "' + line + '"'; }

      let typeSize = parts[1];
      let cl = parts[2];
      let rating = parts[3];
      let mount = parts[4];
      let missile = parts[5];
      let name = parts[6].trim();
      let slot, group;

      if (isNaN(typeSize)) {  // Standard or Hardpoint
        if (typeSize.length == 1) { // Hardpoint
          let slotClass = mountMap[typeSize];

          if (cl > slotClass) { throw cl + rating + ' ' + name + ' exceeds slot size: "' + line + '"'; }

          slot = _.find(ship.hardpoints, isEmptySlot, slotClass);

          if (!slot) { throw 'No hardpoint slot available for: "' + line + '"'; }

          group = _.find(GroupMap, equalsIgnoreCase, name);

          let hp = ModuleUtils.findHardpoint(group, cl, rating, group ? null : name, mount, missile);

          if (!hp) { throw 'Unknown component: "' + line + '"'; }

          ship.use(slot, hp, true);

        } else if (typeSize == 'BH') {
          let bhId = bhMap[name.toLowerCase()];

          if (bhId === undefined) { throw 'Unknown bulkhead: "' + line + '"'; }

          ship.useBulkhead(bhId, true);

        } else if (standardMap[typeSize] != undefined) {
          let standardIndex = standardMap[typeSize];

          if (ship.standard[standardIndex].maxClass < cl) { throw name + ' exceeds max class for the ' + ship.name; }

          ship.use(ship.standard[standardIndex], cl + rating, ModuleUtils.standard(standardIndex, cl + rating), true);

        } else {
          throw 'Unknown component: "' + line + '"';
        }
      } else {
        if (cl > typeSize) { throw cl + rating + ' ' + name + ' exceeds slot size: "' + line + '"'; }

        slot = _.find(ship.internal, isEmptySlot, typeSize);

        if (!slot) { throw 'No internal slot available for: "' + line + '"'; }

        group = _.find(GroupMap, equalsIgnoreCase, name);

        let intComp = ModuleUtils.findInternal(group, cl, rating, group ? null : name);

        if (!intComp) { throw 'Unknown component: "' + line + '"'; }

        ship.use(slot, intComp.id, intComp);
      }
    }

    let builds = {};
    builds[shipId] = {};
    builds[shipId]['Imported ' + buildName] = Serializer.fromShip(ship);
    this.setState({ builds });
  }

  _validateImport(e) {
    let importData = null;
    let importString = e.target.value;
    this.setState({
      builds: null,
      comparisons: null,
      discounts: null,
      errorMsg: null,
      importValid: false,
      insurance: null,
      importString,
    });

    if (!importString) {
      return;
    }

    try {
      if (textBuildRegex.test(importString)) {  // E:D Shipyard build text
        importTextBuild(importString);
      } else {                                  // JSON Build data
        importData = JSON.parse(importString);

        if (!importData || typeof importData != 'object') {
          throw 'Must be an object or array!';
        }

        if (importData instanceof Array) {   // Must be detailed export json
          this._importDetailedArray(importData);
        } else if (importData.ship && typeof importData.name !== undefined) { // Using JSON from a single ship build export
          this._importDetailedArray([importData]); // Convert to array with singleobject
        } else { // Using Backup JSON
          this._importBackup(importData);
        }
      }
    } catch (e) {
      this.setState({ errorMsg: (typeof e == 'string') ? e : 'Cannot Parse the data!' });
      return;
    }

    this.setState({ importValid: true });
  };

  _process() {
    let builds = null, comparisons = null;

    if (this.state.builds) {
      builds = this.state.builds;
      for (let shipId in builds) {
        for (let buildName in builds[shipId]) {
          let code = builds[shipId][buildName];
          // Update builds object such that orginal name retained, but can be renamed
          builds[shipId][buildName] = {
            code: code,
            useName: buildName
          };
        }
      }
    }

    if (this.state.comparisons) {
      let comparisons = this.state.comparisons;
      for (let name in comparisons) {
        comparisons[name].useName = name;
      }
    }

    this.setState({ processed: true, builds, comparisons });
  };

  _import() {

    if (this.state.builds) {
      let builds = this.state.builds;
      for (let shipId in builds) {
        for (let buildName in builds[shipId]) {
          let build = builds[shipId][buildName];
          let name = build.useName.trim();
          if (name) {
            Persist.saveBuild(shipId, name, build.code);
          }
        }
      }
    }

    if (this.state.comparisons) {
      let comparisons = this.state.comparisons;
      for (let comp in comparisons) {
        let comparison = comparisons[comp];
        let useName = comparison.useName.trim();
        if (useName) {
          Persist.saveComparison(useName, comparison.builds, comparison.facets);
        }
      }
    }

    if (this.state.discounts) {
      Persist.setDiscount(this.state.discounts);
    }

    if (this.state.insurance) {
      Persist.setInsurance(this.state.insurance);
    }

    InterfaceEvents.hideModal();
  };

  componentWillMount() {
    if (this.props.importingBuilds) {
      this.setState({ builds: this.props.importingBuilds, canEdit : false});
      this._process();
    }
  }

  render() {
    let translate = this.context.language.translate;
    let state = this.state;
    let importStage;

    if (!state.processed) {
      importStage = (
        <div>
          <textarea className='cb json' onChange={this._validateImport} defaultValue={this.state.importString} placeholder={translate('PHRASE_IMPORT')} />
          <button className='l cap' onClick={this._process} disabled={!state.importValid} >{translate('proceed')}</button>
          <div className='l warning' style={{ marginLeft:'3em' }}>{state.errorMsg}</div>
        </div>
      );
    } else {
      let comparisonTable, edit, buildRows = [];
      if (state.comparisons) {
        let comparisonRows = [];

        for (let name in comparisons) {
          let comparison = comparisons[name];
          let hasComparison = Persist.hasComparison(name);
          comparisonRows.push(
            <tr key={name} className='cb'>
              <td>
                <input type='text' value={comparison.useName}/>
              </td>
              <td style={{ textAlign:'center' }} className={ cn({ warning: hasComparison, disabled: comparison.useName == '' }) }>
                <span>{translate(comparison.useName == '' ? 'skip' : (hasComparison ? 'overwrite' : 'create'))}></span>
              </td>
            </tr>
          );
        }

        comparisonTable = (
          <table className='l' style={{ overflow:'hidden', margin: '1em 0', width: '100%'}} >
            <thead>
              <tr>
                <th style={{ textAlign:'left' }}>{translate('comparison')}</th>
                <th >{translate('action')}</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows}
            </tbody>
          </table>
          );
      }

      if(this.state.canEdit) {
        edit = <button className='l cap' style={{ marginLeft: '2em' }} onClick={() => this.setState({processed: false})}>{translate('edit data')}</button>
      }

      let builds = this.state.builds;
      for (let shipId in builds) {
        let shipBuilds = builds[shipId];
        for (let buildName in shipBuilds) {
          let b = shipBuilds[buildName];
          let hasBuild = Persist.hasBuild(shipId, b.useName);
          buildRows.push(
            <tr className='cb'>
              <td>{Ships[shipId].properties.name}</td>
              <td><input type='text' value={b.useName}/></td>
              <td style={{ textAlign: 'center' }} className={cn({ warning: hasBuild, disabled: b.useName == ''})}>
                <span>{translate(b.useName == '' ? 'skip'  : (hasBuild ? 'overwrite' : 'create'))}></span>
              </td>
            </tr>
          );
        }
      }

      importStage = (
        <div>
          <table className='l' style={{ overflow:'hidden', margin: '1em 0', width: '100%'}}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }} >{translate('ship')}</th>
                <th style={{ textAlign: 'left' }} >{translate('build name')}</th>
                <th >{translate('action')}</th>
              </tr>
            </thead>
            <tbody>
              {buildRows}
            </tbody>
          </table>
          {comparisonTable}
          <button className='cl l' onClick={this._import}><Download/> {translate('import')}</button>
          {edit}
        </div>
      );
    }

    return <div className='modal' onClick={ (e) => e.stopPropagation() }>
      <h2 >{translate('import')}</h2>
      {importStage}
      <button className={'r dismiss cap'} onClick={InterfaceEvents.hideModal}>{translate('close')}</button>
    </div>;
  }
}
