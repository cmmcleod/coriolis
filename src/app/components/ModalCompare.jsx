import React from 'react';
import PropTypes from 'prop-types';
import TranslatedComponent from './TranslatedComponent';
import { Ships } from 'coriolis-data/dist';
import Persist from '../stores/Persist';

/**
 * Build ship and name comparator
 * @param  {Object} a [description]
 * @param  {Object} b [description]
 * @return {number}   1, 0, -1
 */
function buildComparator(a, b) {
  if (a.name == b.name) {
    return a.buildName.localeCompare(b.buildName);
  }
  return a.name.localeCompare(b.name);
}

/**
 * Compare builds modal
 */
export default class ModalCompare extends TranslatedComponent {

  static propTypes = {
    onSelect: PropTypes.func.isRequired,
    builds: PropTypes.array
  };

  static defaultProps = {
    builds: []
  };

  /**
   * Constructor
   * @param  {Object} props   React Component properties
   */
  constructor(props) {
    super(props);
    let builds = props.builds;
    let allBuilds = Persist.getBuilds();
    let unusedBuilds = [];
    let usedBuilds = [];

    for (let id in allBuilds) {
      for (let buildName in allBuilds[id]) {
        let b = { id, buildName, name: Ships[id].properties.name };
        builds.find((e) => e.buildName == buildName && e.id == id) ? usedBuilds.push(b) : unusedBuilds.push(b);
      }
    }

    usedBuilds.sort(buildComparator);
    unusedBuilds.sort(buildComparator);

    this.state = { usedBuilds, unusedBuilds, used: usedBuilds.length };
  }

  /**
   * Add a build to the compare list
   * @param {number} buildIndex Idnex of build in list
   */
  _addBuild(buildIndex) {
    let { usedBuilds, unusedBuilds } = this.state;
    usedBuilds.push(unusedBuilds[buildIndex]);
    unusedBuilds.splice(buildIndex, 1);
    usedBuilds.sort(buildComparator);

    this.setState({ used: usedBuilds.length });
  }

  /**
   * Remove a build from the compare list
   * @param {number} buildIndex Idnex of build in list
   */
  _removeBuild(buildIndex) {
    let { usedBuilds, unusedBuilds } = this.state;
    unusedBuilds.push(usedBuilds[buildIndex]);
    usedBuilds.splice(buildIndex, 1);
    unusedBuilds.sort(buildComparator);

    this.setState({ used: usedBuilds.length });
  }

  /**
   * OK Action - Use selected builds
   */
  _selectBuilds() {
    this.props.onSelect(this.state.usedBuilds);
  }

  /**
   * Render the modal
   * @return {React.Component} Modal Content
   */
  render() {
    let { usedBuilds, unusedBuilds } = this.state;
    let translate = this.context.language.translate;

    let availableBuilds = unusedBuilds.map((build, i) =>
      <tr key={i} onClick={this._addBuild.bind(this, i)}>
        <td className='tl'>{build.name}</td>
        <td className='tl'>{build.buildName}</td>
      </tr>
    );

    let selectedBuilds = usedBuilds.map((build, i) =>
      <tr key={i} onClick={this._removeBuild.bind(this, i)}>
        <td className='tl'>{build.name}</td><
        td className='tl'>{build.buildName}</td>
      </tr>
    );

    return <div className='modal' onClick={ (e) => e.stopPropagation() }>
      <h3>{translate('PHRASE_SELECT_BUILDS')}</h3>
      <div id='build-select'>
        <div className='build-section'>
          <h1>{translate('available')}</h1>
          <div>
            <table>
              <tbody>
                {availableBuilds}
              </tbody>
            </table>
          </div>
        </div>
        <h1>⇆</h1>
        <div className='build-section'>
          <h1>{translate('added')}</h1>
          <div>
            <table>
              <tbody>
                {selectedBuilds}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <br/>
      <button className='cap' onClick={this._selectBuilds.bind(this)}>{translate('ok')}</button>
      <button className='r cap' onClick={() => this.context.hideModal()}>{translate('cancel')}</button>
    </div>;
  }
}
