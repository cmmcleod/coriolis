import React from 'react';
import Page from './Page';
import Router from '../Router';
import cn from 'classnames';
import { Ships } from 'coriolis-data';
import Ship from '../shipyard/Ship';
import Serializer from '../shipyard/Serializer';
import InterfaceEvents from '../utils/InterfaceEvents';
import Persist from '../stores/Persist';
import { SizeMap, ShipFacets } from '../shipyard/Constants';
import ComparisonTable from '../components/ComparisonTable';
import ModalCompare from '../components/ModalCompare';
import { FloppyDisk, Bin, Download, Embed, Rocket, LinkIcon } from '../components/SvgIcons';


function sortBy(predicate) {
  return (a, b) => {
    if (a[predicate] === b[predicate]) {
      return 0;
    }
    if (typeof a[predicate] == 'string') {
      return a[predicate].toLowerCase() > b[predicate].toLowerCase() ? 1 : -1;
    }
    return a[predicate] > b[predicate] ? 1 : -1;
  };
}

export default class ComparisonPage extends Page {

  constructor(props, context) {
    super(props, context);
    this._sortShips = this._sortShips.bind(this);
    this._buildsSelected = this._buildsSelected.bind(this);
    this.state = this._initState(props, context);
  }

  _initState(props, context) {
    let defaultFacets = [9, 6, 4, 1, 3, 2]; // Reverse order of Armour, Shields, Speed, Jump Range, Cargo Capacity, Cost
    let params = context.route.params;
    let code = params.code;
    let name = params.name ? decodeURIComponent(params.name) : null;
    let newName = '';
    let compareMode = !code;
    let facets = [];
    let builds = [];
    let saved = false;
    let predicate = 'name';
    let desc = false;
    let importObj = {};

    if (compareMode) {
      if (name == 'all') {
        let allBuilds = Persist.getBuilds();
        newName = name;
        for (let shipId in allBuilds) {
          for (let buildName in allBuilds[shipId]) {
            builds.push(this._createBuild(shipId, buildName, allBuilds[shipId][buildName]));
          }
        }
      } else {

        let comparisonData = Persist.getComparison(name);
        if (comparisonData) {
          defaultFacets = comparisonData.facets;
          comparisonData.builds.forEach((b) => builds.push(this._createBuild(b.shipId, b.buildName)));
          saved = true;
          newName = name;
        }
      }
    } else {
      try {
        let comparisonData = Serializer.toComparison(code);
        defaultFacets = comparisonData.f;
        newName = name = comparisonData.n;
        predicate = comparisonData.p;
        desc = comparisonData.d;
        comparisonData.b.forEach((build) => {
          builds.push(this._createBuild(build.s, build.n, build.c));
          if (!importObj[build.s]) {
            importObj[build.s] = {};
          }
          importObj[build.s][build.n] = build.c;
        });
      } catch (e) {
        throw { type: 'bad-comparison', message: e.message, details: e };
      }
    }

    for (let i = 0; i < ShipFacets.length; i++) {
        facets.push(Object.assign({ index: i }, ShipFacets[i]));
    }

    let selectedFacets = [];

    for (let fi of defaultFacets) {
      let facet = facets.splice(fi, 1)[0];
      facet.active = true;
      selectedFacets.unshift(facet);
    }

    facets = selectedFacets.concat(facets);
console.log(selectedFacets);
    builds.sort(sortBy(predicate));

    return {
      title: 'Coriolis - Compare',
      predicate,
      desc,
      facets,
      builds,
      compareMode,
      code,
      name,
      newName,
      saved,
      importObj
    };
  }

  _createBuild(id, name, code) {
    code = code ? code : Persist.getBuild(id, name); // Retrieve build code if not passed

    if (!code) {  // No build found
      return;
    }

    let data = Ships[id];   // Get ship properties
    let b = new Ship(id, data.properties, data.slots); // Create a new Ship instance
    b.buildFrom(code);  // Populate components from code
    b.buildName = name;
    return b;
  };

  /**
   * Sort ships
   * @param  {object} key Sort predicate
   */
  _sortShips(predicate) {
    let { builds, desc } = this.state;
    if (this.state.predicate == predicate) {
      desc = !desc;
    }

    builds.sort(sortBy(predicate));

    if (desc) {
      builds.reverse();
    }

    this.setState({ predicate, desc });
  };

  _selectBuilds() {
    InterfaceEvents.showModal(React.cloneElement(
      <ModalCompare onSelect={this._buildsSelected}/>,
      { builds: this.state.builds }
    ));
  }

  _buildsSelected(newBuilds) {
    InterfaceEvents.hideModal();
    let builds = [];

    for (let b of newBuilds) {
      builds.push(this._createBuild(b.id, b.buildName));
    }

    this.setState({ builds });
  }

  _toggleFacet(facet) {
    facet.active = !facet.active;
    this.setState({ facets: [].concat(this.state.facets), saved: false });
  }

  _facetDrag(e) {
    this.dragged = e.currentTarget;
    let placeholder = this.placeholder = document.createElement("li");
    placeholder.style.width = this.dragged.offsetWidth + 'px';
    placeholder.className = "facet-placeholder";
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData("text/html", e.currentTarget);
  }

  _facetDrop(e) {
    this.dragged.parentNode.removeChild(this.placeholder);
    let facets = this.state.facets;
    let frm = Number(this.dragged.dataset.i);
    let to = Number(this.over.dataset.i);

    if (frm < to) {
      to--;
    }
    if (this.nodeAfter) {
      to++;
    }

    facets.splice(to, 0, facets.splice(frm, 1)[0]);
    this.dragged.style.display = null;
    this.setState({ facets: [].concat(facets) });
  }

  _facetDragOver(e) {
    e.preventDefault();

    if(e.target.className == "facet-placeholder") {
      return;
    }

    this.over = e.target;
    this.dragged.style.display = "none";
    let relX = e.clientX - this.over.getBoundingClientRect().left;
    let width = this.over.offsetWidth / 2;
    let parent = e.target.parentNode;

    if (parent == e.currentTarget) {
      if(relX > width) {
        this.nodeAfter = true;
        parent.insertBefore(this.placeholder, e.target.nextElementSibling);
      }
      else {
        this.nodeAfter = false;
        parent.insertBefore(this.placeholder, e.target);
      }
    }
  }

  _onNameChange(e) {
    this.setState({ newName: e.target.value, saved: false });
  }

  _delete() {
    Persist.deleteComparison(this.state.name);
    Router.go('/compare');
  }

  _import() {

  }

  _save() {
    let { newName, builds, facets } = this.state;

    let selectedFacets = [];
    facets.forEach((f) => {
      if (f.active) {
        selectedFacets.unshift(f.index);
      }
    });
console.log(selectedFacets);
    //Persist.saveComparison(newName, builds, selectedFacets);
    Router.replace(`/compare/${encodeURIComponent(this.state.newName)}`)
    this.setState ({ name: newName, saved: true });
  }

  /**
   * Generates the long permalink URL
   * @return {string} The long permalink URL
   */
  _genPermalink() {
    let { facets, builds, name, predicate, desc } = this.state;
    let selectedFacets = [];

    for (let f of facets){
      if (f.active) {
        selectedFacets.unshift(f.index);
      }
    }

    let code = Serializer.fromComparison(name, builds, selectedFacets, predicate, desc);
    // send code to permalink modal
  }


  componentWillReceiveProps(nextProps, nextContext) {
    if (this.context.route !== nextContext.route) {  // Only reinit state if the route has changed
      this.setState(this._initState(nextProps, nextContext));
    }
  }

  render() {
    let translate = this.context.language.translate;
    let compareHeader;
    let {newName, name, saved, builds, facets, predicate, desc } = this.state;

    if (this.state.compareMode) {
      compareHeader = <tr>
        <td className='head'>{translate('comparison')}</td>
        <td>
          <input value={newName} onChange={this._onNameChange} placeholder={translate('Enter Name')} maxLength='50' />
          <button onClick={this._save} disabled={!newName || newName == 'all' || saved}>
            <FloppyDisk  className='lg'/><span className='button-lbl'>{translate('save')}</span>
          </button>
          <button onClick={this._delete} disabled={name == 'all' || !saved}><Bin className='lg warning'/></button>
          <button onClick={this._selectBuilds}>
            <Rocket className='lg'/><span className='button-lbl'>{translate('builds')}</span>
          </button>
          <button className='r' ng-click='permalink($event)' ng-disabled='builds.length == 0'>
            <LinkIcon className='lg'/><span className='button-lbl'>{translate('permalink')}</span>
          </button>
          <button className='r' ng-click='embed($event)' ng-disabled='builds.length == 0'>
            <Embed className='lg'/><span className='button-lbl'>{translate('forum')}</span>
          </button>
        </td>
      </tr>;
    } else {
      compareHeader = <tr>
        <td className='head'>{translate('comparison')}</td>
        <td>
          <h3>{name}</h3>
          <button className='r' onClick={this._import}><Download className='lg'/>{translate('import')}</button>
        </td>
      </tr>;
    }

    return (
      <div className={'page'} style={{ fontSize: this.context.sizeRatio + 'em'}}>
        <table id='comparison'>
          <tbody>
            {compareHeader}
            <tr key='facets'>
              <td className='head'>{translate('compare')}</td>
              <td>
                <ul id='facet-container' onDragOver={this._facetDragOver}>
                  {facets.map((f, i) =>
                    <li key={f.title} data-i={i} draggable='true' onDragStart={this._facetDrag} onDragEnd={this._facetDrop} className={cn('facet', {active: f.active})} onClick={this._toggleFacet.bind(this, f)}>
                      {'↔  ' + translate(f.title)}
                    </li>
                  )}
                </ul>
              </td>
            </tr>
          </tbody>
        </table>

        <ComparisonTable builds={builds} facets={facets} onSort={this._sortShips} predicate={predicate} desc={desc} />

        {/*<div ng-repeat='f in facets | filter:{active:true}' ng-if='builds.length > 0' className='chart' bar-chart facet='f' data='builds'>
          <h3 ng-click='sort(f.props[0])' >{{f.title | translate}}</h3>
        </div>*/}

      </div>
    );
  }
}
