/**
 * [description]
 */
angular.module('app').service('Persist', ['$window', 'lodash', function($window, _) {
  var LS_KEY_BUILDS = 'builds';
  var LS_KEY_COMPARISONS = 'comparisons';
  var LS_KEY_COST_TAB = 'costTab';
  var LS_KEY_INSURANCE = 'insurance';
  var LS_KEY_DISCOUNTS = 'discounts';
  var localStorage = $window.localStorage;
  var buildJson = null;
  var comparisonJson = null;

  // Safe check to determine if localStorage is enabled
  try {
    localStorage.setItem('s', 1);
    localStorage.removeItem('s');
    buildJson = localStorage.getItem(LS_KEY_BUILDS);
    comparisonJson = localStorage.getItem(LS_KEY_COMPARISONS);
    this.lsEnabled = true;
  } catch(e) {
    this.lsEnabled = false;
  }

  this.builds = buildJson ? angular.fromJson(buildJson) : {};
  this.comparisons = comparisonJson ? angular.fromJson(comparisonJson) : {};
  var buildCount = Object.keys(this.builds).length;

  this.state = {
    buildCount: buildCount,
    hasBuilds: buildCount > 0,
    hasComparisons: Object.keys(this.comparisons).length > 0
  };
  /**
   * Persist a ship build in local storage.
   *
   * @param  {string} shipId The unique id for a model of ship
   * @param  {string} name   The name of the build
   * @param  {string} code   The serialized code
   */
  this.saveBuild = function(shipId, name, code) {
    if (!this.lsEnabled) {
      return;
    }

    if (!this.builds[shipId]) {
      this.builds[shipId] = {};
    }

    if (!this.builds[shipId][name]) {
      this.state.buildCount++;
      this.state.hasBuilds = true;
    }

    this.builds[shipId][name] = code;
    // Persist updated build collection to localStorage
    localStorage.setItem(LS_KEY_BUILDS, angular.toJson(this.builds));
  };

  /**
   * Get the serialized code/string for a build. Returns null if a
   * build is not found.
   *
   * @param  {string} shipId The unique id for a model of ship
   * @param  {string} name   The name of the build
   * @return {string}        The serialized build string.
   */
  this.getBuild = function(shipId, name) {
    if (this.builds[shipId] && this.builds[shipId][name]) {
      return this.builds[shipId][name];
    }
    return null;
  };

  /**
   * Delete a build from local storage. It will also delete the ship build collection if
   * it becomes empty
   *
   * @param  {string} shipId The unique id for a model of ship
   * @param  {string} name   The name of the build
   */
  this.deleteBuild = function(shipId, name) {
    if (this.lsEnabled && this.builds[shipId][name]) {
      delete this.builds[shipId][name];
      if (Object.keys(this.builds[shipId]).length === 0) {
        delete this.builds[shipId];
        this.state.buildCount--;
        this.state.hasBuilds = this.state.buildCount > 0;
      }
      // Persist updated build collection to localStorage
      localStorage.setItem(LS_KEY_BUILDS, angular.toJson(this.builds));
      // Check if the build was used in existing comparisons
      var comps = this.comparisons;
      for (var c in comps) {
        for (var i = 0; i < comps[c].builds.length; i++) {  // For all builds in the current comparison
          if (comps[c].builds[i].shipId == shipId && comps[c].builds[i].buildName == name) {
            comps[c].builds.splice(i, 1);
            break;  // A build is unique ber comparison
          }
        }
      }
      localStorage.setItem(LS_KEY_COMPARISONS, angular.toJson(this.comparisons));
    }
  };

  /**
   * Persist a comparison in localstorage.
   *
   * @param  {string} name   The name of the comparison
   * @param  {array} builds  Array of builds
   * @param  {array} facets  Array of facet indices
   */
  this.saveComparison = function(name, builds, facets) {
    if (!this.lsEnabled) {
      return;
    }

    if (!this.comparisons[name]) {
      this.comparisons[name] = {};
    }
    this.comparisons[name] = {
      facets: facets,
      builds: _.map(builds, function(b) { return { shipId: b.id || b.shipId, buildName: b.buildName }; })
    };
    localStorage.setItem(LS_KEY_COMPARISONS, angular.toJson(this.comparisons));
    this.state.hasComparisons = true;
  };

  /**
   * [getComparison description]
   * @param  {string} name [description]
   * @return {object}      Object containing array of facets and ship id + build names
   */
  this.getComparison = function(name) {
    if (this.comparisons[name]) {
      return this.comparisons[name];
    }
    return null;
  };

  /**
   * Removes the comparison from localstorage.
   * @param  {string} name Comparison name
   */
  this.deleteComparison = function(name) {
    if (this.lsEnabled && this.comparisons[name]) {
      delete this.comparisons[name];
      localStorage.setItem(LS_KEY_COMPARISONS, angular.toJson(this.comparisons));
      this.state.hasComparisons = Object.keys(this.comparisons).length > 0;
    }
  };

  /**
   * Delete all builds and comparisons from localStorage
   */
  this.deleteAll = function() {
    angular.copy({}, this.builds); // Empty object but keep original instance
    angular.copy({}, this.comparisons);
    this.state.hasBuilds = false;
    this.state.buildCount = 0;

    if (this.lsEnabled) {
      localStorage.removeItem(LS_KEY_BUILDS);
      localStorage.removeItem(LS_KEY_COMPARISONS);
    }
  };

  this.getAll = function() {
    var data = {};
    data[LS_KEY_BUILDS] = this.builds;
    data[LS_KEY_COMPARISONS] = this.comparisons;
    data[LS_KEY_INSURANCE] = this.getInsurance();
    data[LS_KEY_DISCOUNTS] = this.getDiscount();

    return data;
  };

  /**
   * Get the saved insurance type
   * @return {string} The name of the saved insurance type of null
   */
  this.getInsurance = function() {
    if (this.lsEnabled) {
      return localStorage.getItem(LS_KEY_INSURANCE);
    }
    return null;
  };

  /**
   * Persist selected insurance type
   * @param {string} name Insurance type name
   */
  this.setInsurance = function(name) {
    if (this.lsEnabled) {
      return localStorage.setItem(LS_KEY_INSURANCE, name);
    }
  };

  /**
   * Persist selected discount
   * @param {number} val Discount value/amount
   */
  this.setDiscount = function(val) {
    if (this.lsEnabled) {
      return localStorage.setItem(LS_KEY_DISCOUNTS, angular.toJson(val));
    }
  };

  /**
   * Get the saved  discount
   * @return {number} val Discount value/amount
   */
  this.getDiscount = function() {
    if (this.lsEnabled) {
      return angular.fromJson(localStorage.getItem(LS_KEY_DISCOUNTS));
    }
    return null;
  };

  /**
   * Persist selected cost tab
   * @param {number} val Discount value/amount
   */
  this.setCostTab = function(tabName) {
    if (this.lsEnabled) {
      return localStorage.setItem(LS_KEY_COST_TAB, tabName);
    }
  };

  /**
   * Get the saved  discount
   * @return {number} val Discount value/amount
   */
  this.getCostTab = function() {
    if (this.lsEnabled) {
      return localStorage.getItem(LS_KEY_COST_TAB);
    }
    return null;
  };

  /**
   * Retrieve the last router state from local storage
   * @param {object} state State object containing state name and params
   */
  this.getState = function() {
    if (this.lsEnabled) {
      var state = localStorage.getItem('state');
      if (state) {
        return angular.fromJson(state);
      }
    }
    return null;
  };

  /**
   * Save the current router state to localstorage
   * @param {object} state State object containing state name and params
   */
  this.setState = function(state) {
    if (this.lsEnabled) {
      localStorage.setItem('state', angular.toJson(state));
    }
  };

  /**
   * Check if localStorage is enabled/active
   * @return {Boolean} True if localStorage is enabled
   */
  this.isEnabled = function() {
    return this.lsEnabled;
  };

}]);
