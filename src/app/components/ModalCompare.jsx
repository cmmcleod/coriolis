import React from 'react';
import TranslatedComponent from './TranslatedComponent';
import InterfaceEvents from '../utils/InterfaceEvents';
import { Ships } from 'coriolis-data';
import Persist from '../stores/Persist';

function buildComparator(a, b) {
  if (a.name == b.name) {
    return a.buildName > b.buildName;
  }
  return a.name > b.name;
}


export default class ModalCompare extends TranslatedComponent {

  static propTypes = {
    onSelect: React.PropTypes.func.isRequired,
    builds: React.PropTypes.array
  };

  static defaultProps = {
    builds: []
  }

  constructor(props) {
    super(props);
    let builds = props.builds;
    let allBuilds = Persist.getBuilds();
    let unusedBuilds = [];

    for (let id in allBuilds) {
      for (let buildName in allBuilds[id]) {
        if (!builds.find((e) => e.buildName == buildName && e.id == id)) {
          unusedBuilds.push({ id, buildName, name: Ships[id].properties.name })
        }
      }
    }

    builds.sort(buildComparator);
    unusedBuilds.sort(buildComparator);

    this.state = { builds, unusedBuilds };
  }

  _addBuild(buildIndex) {
    let { builds, unusedBuilds } = this.state;
    builds.push(unusedBuilds[buildIndex]);
    unusedBuilds = unusedBuilds.splice(buildIndex, 1);
    builds.sort(buildComparator);

    this.setState({ builds, unusedBuilds });
  }

  _removeBuild(buildIndex) {
    let { builds, unusedBuilds } = this.state;
    unusedBuilds.push(builds[buildIndex]);
    builds = builds.splice(buildIndex, 1);
    unusedBuilds.sort(buildComparator);

    this.setState({ builds, unusedBuilds });
  }

  _selectBuilds() {
    this.props.onSelect(this.state.builds);
  }

  render() {
    let { builds, unusedBuilds } = this.state;
    let translate = this.context.language.translate;

    let availableBuilds = unusedBuilds.map((build, i) =>
      <tr key={i} onClick={this._addBuild.bind(this, i)}>
        <td className='tl'>{build.name}</td>
        <td className='tl'>{build.buildName}</td>
      </tr>
    );

    let selectedBuilds = builds.map((build, i) =>
      <tr key={i} onClick={this._removeBuild.bind(this, i)}>
        <td className='tl'>{build.name}</td><
        td className='tl'>{build.buildName}</td>
      </tr>
    );

    return <div className='modal' onClick={ (e) => e.stopPropagation() }>
      <h3>{translate('PHRASE_SELECT_BUILDS')}</h3>
      <div id='build-select'>
        <table>
          <thead><tr><th colSpan='2'>{translate('available')}</th></tr></thead>
          <tbody>
            {availableBuilds}
          </tbody>
        </table>
        <h1>⇆</h1>
        <table>
          <thead><tr><th colSpan='2'>{translate('added')}</th></tr></thead>
          <tbody>
            {selectedBuilds}
          </tbody>
        </table>
      </div>
      <br/>
      <button className='cap' onClick={this._selectBuilds.bind(this)}>{translate('Ok')}</button>
      <button className='r cap' onClick={() => InterfaceEvents.hideModal()}>{translate('Cancel')}</button>
    </div>;
  }
}
