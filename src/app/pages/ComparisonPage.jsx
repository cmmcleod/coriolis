import React from 'react';
import Page from './Page';
import Ships from '../shipyard/Ships';
import cn from 'classnames';
import Ship from '../shipyard/Ship';
import * as ModuleUtils from '../shipyard/ModuleUtils';
import { SizeMap } from '../shipyard/Constants';
import Link from '../components/Link';

export default class ComparisonPage extends Page {

  constructor(props, context) {
    super(props, context);
    this.state = {
      title: 'Coriolis - Shipyard',
      shipPredicate: 'name',
      shipDesc: false
    };
    this.context = context;
    this.shipSummaries = [];

    for (let s in Ships) {
      this.shipSummaries.push(this._shipSummary(s, Ships[s]));
    }
  }

  /**
   * Sort ships
   * @param  {object} key Sort predicate
   */
  _sortShips(shipPredicate, shipPredicateIndex) {
    let shipDesc = this.state.shipDesc;

    if (typeof shipPredicateIndex == "object") {
      shipPredicateIndex = undefined;
    }

    if (this.state.shipPredicate == shipPredicate && this.state.shipPredicateIndex == shipPredicateIndex) {
      shipDesc = !shipDesc;
    }

    this.setState({ shipPredicate, shipDesc, shipPredicateIndex });
  };

  _shipRowElement(s, translate, u, fInt, fRound) {
    return <tr key={s.id} className={'highlight'}>
      <td className={'le'}><Link href={'/outfitting/' + s.id}>{s.name}</Link></td>
      <td className={'le'}>{s.manufacturer}</td>
      <td className={'cap'}>{translate(SizeMap[s.class])}</td>
      <td className={'ri'}>{fInt(s.speed)}{u.ms}</td>
      <td className={'ri'}>{fInt(s.boost)}{u.ms}</td>
      <td className={'ri'}>{s.baseArmour}</td>
      <td className={'ri'}>{fInt(s.baseShieldStrength)}{u.MJ}</td>
      <td className={'ri'}>{fInt(s.topSpeed)}{u.ms}</td>
      <td className={'ri'}>{fInt(s.topBoost)}{u.ms}</td>
      <td className={'ri'}>{fRound(s.maxJumpRange)}{u.LY}</td>
      <td className={'ri'}>{fInt(s.maxCargo)}{u.T}</td>
      <td className={cn({ disabled: !s.hp[1] })}>{s.hp[1]}</td>
      <td className={cn({ disabled: !s.hp[2] })}>{s.hp[2]}</td>
      <td className={cn({ disabled: !s.hp[3] })}>{s.hp[3]}</td>
      <td className={cn({ disabled: !s.hp[4] })}>{s.hp[4]}</td>
      <td className={cn({ disabled: !s.hp[0] })}>{s.hp[0]}</td>
      <td className={cn({ disabled: !s.int[0] })}>{s.int[0]}</td>
      <td className={cn({ disabled: !s.int[1] })}>{s.int[1]}</td>
      <td className={cn({ disabled: !s.int[2] })}>{s.int[2]}</td>
      <td className={cn({ disabled: !s.int[3] })}>{s.int[3]}</td>
      <td className={cn({ disabled: !s.int[4] })}>{s.int[4]}</td>
      <td className={cn({ disabled: !s.int[5] })}>{s.int[5]}</td>
      <td className={cn({ disabled: !s.int[6] })}>{s.int[6]}</td>
      <td className={cn({ disabled: !s.int[7] })}>{s.int[7]}</td>
      <td className={'ri'}>{fInt(s.hullMass)}{u.T}</td>
      <td className={'ri'}>{s.masslock}</td>
      <td className={'ri'}>{fInt(s.retailCost)}{u.CR}</td>
    </tr>;
  }

  _renderSummaries(language) {
    let fInt = language.formats.int;
    let fRound = language.formats.round;
    let translate = language.translate;
    let u = language.units;
    // Regenerate ship rows on prop change
    for (let s of this.shipSummaries) {
      s.rowElement = this._shipRowElement(s, translate, u, fInt, fRound);
    }
  }

  componentWillUpdate(nextProps, nextState, nextContext) {
    if (this.context.language !== nextContext.language) {
      this._renderSummaries(language);
    }
  }

  render() {
    let shipSummaries = this.shipSummaries;
    let shipPredicate = this.state.shipPredicate;
    let shipPredicateIndex = this.state.shipPredicateIndex;
    let shipRows = [];
    let sortShips = (predicate, index) => this._sortShips.bind(this, predicate, index);

    // Sort shipsOverview
    shipSummaries.sort((a, b) => {
      let valA = a[shipPredicate], valB = b[shipPredicate];

      if (shipPredicateIndex != undefined) {
        valA = valA[shipPredicateIndex];
        valB = valB[shipPredicateIndex];
      }

      if (!this.state.shipDesc) {
        let val = valA;
        valA = valB;
        valB = val;
      }

      if(valA == valB) {
        if (a.name > b.name) {
          return 1;
        } else {
          return -1;
        }
      } else if (valA > valB) {
        return 1;
      } else {
        return -1;
      }
    });

    let formats = this.context.language.formats;
    let fInt = formats.int;
    let fRound = formats.round;
    let translate = this.context.language.translate;

    for (let s of shipSummaries) {
      shipRows.push(s.rowElement);
    }

    return (
      <div className={'page'}>
        <table id="comparison">
          <tr ng-show="compareMode">
            <td class="head" translate="comparison"></td>
            <td>
              <input ng-model="name" ng-change="nameChange()" placeholder="{{'enter name' | translate}}"  maxlength="50" />
              <button ng-click="save()" ng-disabled="!name || name == 'all' || saved">
                <svg class="icon lg "><use xlink:href="#floppy-disk"></use></svg><span class="button-lbl"> {{'save' | translate}}</span>
              </button>
              <button ng-click="delete()" ng-disabled="name == 'all' || !saved"><svg class="icon lg warning "><use xlink:href="#bin"></use></svg></button>
              <button ng-click="selectBuilds(true, $event)">
            <svg class="icon lg "><use xlink:href="#rocket"></use></svg><span class="button-lbl"> {{'builds' | translate}}</span>
              </button>
              <button class="r" ng-click="permalink($event)" ng-disabled="builds.length == 0">
                <svg class="icon lg "><use xlink:href="#link"></use></svg><span class="button-lbl"> {{'permalink' | translate}}</span>
              </button>
              <button class="r" ng-click="embed($event)" ng-disabled="builds.length == 0">
                <svg class="icon lg "><use xlink:href="#embed"></use></svg><span class="button-lbl"> {{'forum' | translate}}</span>
                </button>
            </td>
          </tr>
          <tr ng-show="!compareMode">
            <td class="head" translate="comparison"></td>
            <td>
              <h3 ng-bind="name"></h3>
              <button class="r" ui-sref="modal.import({obj:importObj})"><svg class="icon lg "><use xlink:href="#download"></use></svg> {{'import' | translate}}</button>
            </td>
          </tr>
          <tr>
            <td class="head" translate="compare"></td>
            <td>
              <ul id="facet-container" as-sortable="facetSortOpts" ng-model="facets" class="sortable" update="tblUpdate">
                <li ng-repeat="(i,f) in facets" as-sortable-item class="facet" ng-class="{active: f.active}" ng-click="toggleFacet(i)">
                  <div as-sortable-item-handle>&#x2194; <span ng-bind="f.title | translate"></span></div>
                </li>
              </ul>
            </td>
            </tr>
        </table>

        <div class="scroll-x">
          <table id="comp-tbl" comparison-table ng-click="handleClick($event)"></table>
        </div>

        <div ng-repeat="f in facets | filter:{active:true}" ng-if="builds.length > 0" class="chart" bar-chart facet="f" data="builds">
          <h3 ng-click="sort(f.props[0])" >{{f.title | translate}}</h3>
        </div>

        <div class="modal-bg" ng-show="showBuilds" ng-click="selectBuilds(false, $event)">
          <div class="modal" ui-view="modal-content" ng-click="$event.stopPropagation()">
            <h3 translate="PHRASE_SELECT_BUILDS"></h3>
            <div id="build-select">
              <table>
                <thead><tr><th colspan="2" translate="available"></th></tr></thead>
                <tbody>
                  <tr ng-repeat="b in unusedBuilds | orderBy:'name'" ng-click="addBuild(b.id, b.buildName)">
                    <td class="tl" ng-bind="b.name"></td><td class="tl" ng-bind="b.buildName"></td>
                  </tr>
                </tbody>
              </table>
              <h1>⇆</h1>
              <table>
                <thead><tr><th colspan="2" translate="added"></th></tr></thead>
                <tbody>
                  <tr ng-repeat="b in builds | orderBy:'name'" ng-click="removeBuild(b.id, b.buildName)">
                    <td class="tl" ng-bind="b.name"></td><td class="tl" ng-bind="b.buildName"></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <br/>
            <button class="r dismiss cap" ng-click="selectBuilds(false, $event)" translate="done"></button>
          </div>
        </div>
      </div>
    );
  }
}
