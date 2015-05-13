/**
 * [description]
 */
angular.module('app').service('Persist', ['lodash', function (_) {
  var LS_KEY_BUILDS = 'builds';
  var LS_KEY_COMPARISONS = 'comparisons';

  var buildJson = localStorage.getItem(LS_KEY_BUILDS);

  if (buildJson) {
    this.builds = angular.fromJson(localStorage.getItem(LS_KEY_BUILDS));
  } else {
    this.builds = {};
  }

  var buildCount = Object.keys(this.builds).length;

  this.state = {
    buildCount: buildCount,
    hasBuilds: buildCount > 0
  }
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
  }

  /**
   * Get the serialized code/string for a build. Returns null if a
   * build is not found.
   *
   * @param  {string} shipId The unique id for a model of ship
   * @param  {string} name   The name of the build
   * @return {string}        The serialized build string.
   */
  this.getBuild = function (shipId, name) {
    if (this.builds[shipId]) {
      return this.builds[shipId][name];
    }
    return null;
  }

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
      if (Object.keys(this.builds[shipId]).length == 0) {
        delete this.builds[shipId];
        this.state.buildCount--;
        this.state.hasBuilds = this.state.buildCount > 0;
      }
      // Persist updated build collection to localStorage
      localStorage.setItem(LS_KEY_BUILDS, angular.toJson(this.builds));
    }
  }

  /**
   * Delete all builds and comparisons from localStorage
   */
  this.deleteAll = function() {
    angular.copy({}, this.builds); // Empty object but keep original instance
    angular.copy({}, this.comparisons);
    this.state.hasBuilds = false;
    localStorage.removeItem(LS_KEY_BUILDS);
    localStorage.removeItem(LS_KEY_COMPARISONS);
  }

}]);
