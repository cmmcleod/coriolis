/**
 * [description]
 */
angular.module('app').service('Persist', ['$window','lodash', function ($window, _) {
  var LS_KEY_BUILDS = 'builds';
  var LS_KEY_COMPARISONS = 'comparisons';
  var localStorage = $window.localStorage;
  var buildJson = localStorage.getItem(LS_KEY_BUILDS);
  var comparisonJson = localStorage.getItem(LS_KEY_COMPARISONS);

  this.builds = buildJson? angular.fromJson(buildJson) : {};
  this.comparisons = comparisonJson? angular.fromJson(comparisonJson) : {};

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
  this.saveBuild = function (shipId, name, code) {
    if (!this.builds[shipId]) {
      this.builds[shipId] = {};
    }

    if(!this.builds[shipId][name]) {
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
  this.getBuild = function (shipId, name) {
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
  this.deleteBuild = function (shipId, name) {
    if(this.builds[shipId][name]) {
      delete this.builds[shipId][name];
      if (Object.keys(this.builds[shipId]).length === 0) {
        delete this.builds[shipId];
        this.state.buildCount--;
        this.state.hasBuilds = this.state.buildCount > 0;
      }
      // Persist updated build collection to localStorage
      localStorage.setItem(LS_KEY_BUILDS, angular.toJson(this.builds));
      // TODO: Check if build exists in comparisons
    }
  };

  /**
   * Persist a comparison in localstorage.
   *
   * @param  {string} name   The name of the comparison
   * @param  {array} builds  Array of builds
   * @param  {array} facets  Array of facet indices
   */
  this.saveComparison = function (name, builds, facets){
    if (!this.comparisons[name]) {
      this.comparisons[name] = {};
    }
    this.comparisons[name] = {
      facets: facets,
      builds: _.map(builds, function (b) { return {shipId: b.id, buildName: b.buildName }; })
    };
    localStorage.setItem(LS_KEY_COMPARISONS, angular.toJson(this.comparisons));
    this.state.hasComparisons = true;
  };

  /**
   * [getComparison description]
   * @param  {string} name [description]
   * @return {object}      Object containing array of facets and ship id + build names
   */
  this.getComparison = function (name) {
    if (this.comparisons[name]) {
      return this.comparisons[name];
    }
    return null;
  };

  /**
   * Removes the comparison from localstorage.
   * @param  {string} name Comparison name
   */
  this.deleteComparison = function (name) {
    if (this.comparisons[name]) {
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
    localStorage.removeItem(LS_KEY_BUILDS);
    localStorage.removeItem(LS_KEY_COMPARISONS);
  };

}]);
