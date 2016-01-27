import { EventEmitter } from 'fbemitter';

const LS_KEY_BUILDS = 'builds';
const LS_KEY_COMPARISONS = 'comparisons';
const LS_KEY_LANG = 'NG_TRANSLATE_LANG_KEY';
const LS_KEY_COST_TAB = 'costTab';
const LS_KEY_INSURANCE = 'insurance';
const LS_KEY_DISCOUNTS = 'discounts';
const LS_KEY_STATE = 'state';
const LS_KEY_SIZE_RATIO = 'sizeRatio';
const LS_KEY_TOOLTIPS = 'tooltips';

let LS;

// Safe check to determine if localStorage is enabled
try {
  localStorage.setItem('test_string', 1);
  localStorage.removeItem('test_string');
  LS = localStorage;
} catch(e) {
  LS = null;
}

/**
 * Safe localstorage put
 * @param  {string} key key
 * @param  {any} value data to store
 */
function _put(key, value) {
  if (LS) {
    LS.setItem(key, typeof value != 'string' ? JSON.stringify(value) : value);
  }
}

/**
 * Safe localstorage get string
 * @param  {string} key key
 * @return {string} The stored string
 */
function _getString(key) {
  return LS ? LS.getItem(key) : null;
}

/**
 * Safe localstorage get
 * @param  {string} key key
 * @return {object | number} The stored data
 */
function _get(key) {
  let str = _getString(key);
  return str ? JSON.parse(str) : null;
}

/**
 * Safe localstorage delete
 * @param  {string} key key
 */
function _delete(key) {
  if (LS) {
    LS.removeItem(key);
  }
}


/**
 * Persist store / service for all user settings. Currently uses localstorage only
 */
class Persist extends EventEmitter {

  /**
   * Create an instance
   */
  constructor() {
    super();
    let buildJson = _get(LS_KEY_BUILDS);
    let comparisonJson = _get(LS_KEY_COMPARISONS);
    let tips = _get(LS_KEY_TOOLTIPS);

    this.builds = buildJson ? buildJson : {};
    this.comparisons = comparisonJson ? comparisonJson : {};
    this.buildCount = Object.keys(this.builds).length;
    this.langCode = _getString(LS_KEY_LANG) || 'en';
    this.insurance = _getString(LS_KEY_INSURANCE) || 'standard';
    this.discounts = _get(LS_KEY_DISCOUNTS) || [1, 1];
    this.costTab = _getString(LS_KEY_COST_TAB);
    this.state =  _get(LS_KEY_STATE);
    this.sizeRatio = _get(LS_KEY_SIZE_RATIO) || 1;
    this.tooltipsEnabled = tips === null ? true : tips;
  }

  /**
   * Get the current language code
   * @return {stirng} language code
   */
  getLangCode() {
    return this.langCode;
  };

  /**
   * Update and save the current language
   * @param {string} langCode language code
   */
  setLangCode(langCode) {
    this.langCode = langCode;
    _put(LS_KEY_LANG, langCode);
    this.emit('language', langCode);
  }

  /**
   * Show tooltips setting
   * @param  {boolean} show Optional - update setting
   * @return {boolean} True if tooltips should be shown
   */
  showTooltips(show) {
    if (show !== undefined) {
      this.tooltipsEnabled = !!show;
      _put(LS_KEY_TOOLTIPS, this.tooltipsEnabled);
      this.emit('tooltips', this.tooltipsEnabled);
    }

    return this.tooltipsEnabled;
  }

  /**
   * Persist a ship build in local storage.
   *
   * @param  {string} shipId The unique id for a model of ship
   * @param  {string} name   The name of the build
   * @param  {string} code   The serialized code
   */
  saveBuild(shipId, name, code) {
    if (!this.builds[shipId]) {
      this.builds[shipId] = {};
    }
    this.builds[shipId][name] = code;
    _put(LS_KEY_BUILDS, this.builds);
    this.emit('buildSaved', shipId, name, code);
  }

  /**
   * Get the serialized code/string for a build. Returns null if a
   * build is not found.
   *
   * @param  {string} shipId The unique id for a model of ship
   * @param  {string} name   The name of the build
   * @return {string}        The serialized build string.
   */
  getBuild(shipId, name) {
    if (this.builds[shipId] && this.builds[shipId][name]) {
      return this.builds[shipId][name];
    }
    return null;
  }

  /**
   *  Get all builds (object) or builds for a specific ship (array)
   * @param  {string} shipId Optional Ship Id
   * @return {Object | Array} Object if Ship Id is not provided
   */
  getBuilds(shipId) {
    if(shipId && shipId.length > 0) {
      return this.builds[shipId];
    }
    return this.builds;
  }

  /**
   * Get an array of all builds names for a ship
   * @param  {string} shipId Ship Id
   * @return {Array}  Array of string or empty array
   */
  getBuildsNamesFor(shipId) {
    if (this.builds[shipId]) {
      return Object.keys(this.builds[shipId]).sort();
    } else {
      return [];
    }
  }

  /**
   * Check if a build has been saved
   * @param  {string} shipId  Ship Id
   * @param  {string} name    Build name
   * @return {Boolean}        True if the build exists
   */
  hasBuild(shipId, name) {
    return this.builds[shipId] && this.builds[shipId][name];
  }

  /**
   * Check if any builds have been saved
   * @return {Boolean} True if any builds have been saved
   */
  hasBuilds() {
    return Object.keys(this.builds).length > 0;
  }

  /**
   * Delete a build from local storage. It will also delete the ship build collection if
   * it becomes empty
   *
   * @param  {string} shipId The unique id for a model of ship
   * @param  {string} name   The name of the build
   */
  deleteBuild(shipId, name) {
    if (this.builds[shipId][name]) {
      delete this.builds[shipId][name];
      if (Object.keys(this.builds[shipId]).length === 0) {
        delete this.builds[shipId];
      }
      _put(LS_KEY_BUILDS, this.builds);
      // Check if the build was used in existing comparisons
      let comps = this.comparisons;
      for (let c in comps) {
        for (let i = 0; i < comps[c].builds.length; i++) {  // For all builds in the current comparison
          if (comps[c].builds[i].shipId == shipId && comps[c].builds[i].buildName == name) {
            comps[c].builds.splice(i, 1);
            break;  // A build is unique per comparison
          }
        }
      }
      _put(LS_KEY_COMPARISONS, this.comparisons);
      this.emit('buildDeleted', shipId, name);
    }
  }

  /**
   * Persist a comparison in localstorage.
   *
   * @param  {string} name   The name of the comparison
   * @param  {array} builds  Array of builds
   * @param  {array} facets  Array of facet indices
   */
  saveComparison(name, builds, facets) {
    if (!this.comparisons[name]) {
      this.comparisons[name] = {};
    }
    this.comparisons[name] = {
      facets,
      builds: builds.map(b => { return { shipId: b.id || b.shipId, buildName: b.buildName }; })
    };
    _put(LS_KEY_COMPARISONS, this.comparisons);
    this.emit('comparisons', this.comparisons);
  }

  /**
   * [getComparison description]
   * @param  {string} name [description]
   * @return {object}      Object containing array of facets and ship id + build names
   */
  getComparison(name) {
    if (this.comparisons[name]) {
      return this.comparisons[name];
    }
    return null;
  }

  /**
   * Get all saved comparisons
   * @return {Object} All comparisons
   */
  getComparisons() {
    return this.comparisons;
  }

  /**
   * Check if a comparison has been saved
   * @param  {string}  name Comparison name
   * @return {Boolean}      True if a comparison has been saved
   */
  hasComparison(name) {
    return !!this.comparisons[name];
  }

  /**
   * Check if any comparisons have been saved
   * @return {Boolean} True if any comparisons have been saved
   */
  hasComparisons() {
    return Object.keys(this.comparisons).length > 0;
  }

  /**
   * Removes the comparison from localstorage.
   * @param  {string} name Comparison name
   */
  deleteComparison(name) {
    if (this.comparisons[name]) {
      delete this.comparisons[name];
      _put(LS_KEY_COMPARISONS, this.comparisons);
      this.emit('comparisons', this.comparisons);
    }
  }

  /**
   * Delete all builds and comparisons from localStorage
   */
  deleteAll() {
    this.builds = {};
    this.comparisons = {};
    _delete(LS_KEY_BUILDS);
    _delete(LS_KEY_COMPARISONS);
    this.emit('deletedAll');
  }

  /**
   * Get all saved data and settings
   * @return {Object} Data and settings
   */
  getAll() {
    let data = {};
    data[LS_KEY_BUILDS] = this.getBuilds();
    data[LS_KEY_COMPARISONS] = this.getComparisons();
    data[LS_KEY_INSURANCE] = this.getInsurance();
    data[LS_KEY_DISCOUNTS] = this.discounts;
    return data;
  }

  /**
   * Get the saved insurance type
   * @return {string} The name of the saved insurance type of null
   */
  getInsurance() {
    return this.insurance.toLowerCase();
  }

  /**
   * Persist selected insurance type
   * @param {string} insurance Insurance type name
   */
  setInsurance(insurance) {
    this.insurance = insurance.toLowerCase();
    _put(LS_KEY_INSURANCE, insurance);
    this.emit('insurance', insurance);
  }

  /**
   * Persist selected ship discount
   * @param {number} shipDiscount Discount value/amount
   */
  setShipDiscount(shipDiscount) {
    this.discounts[0] = shipDiscount;
    _put(LS_KEY_DISCOUNTS, this.discounts);
    this.emit('discounts', this.discounts);
  }

  /**
   * Get the saved ship discount
   * @return {number} val Discount value/amount
   */
  getShipDiscount() {
    return this.discounts[0];
  };

  /**
   * Persist selected module discount
   * @param {number} moduleDiscount Discount value/amount
   */
  setModuleDiscount(moduleDiscount) {
    this.discounts[1] = moduleDiscount;
    _put(LS_KEY_DISCOUNTS, this.discounts);
    this.emit('discounts', this.discounts);
  }

  /**
   * Get the saved ship discount
   * @return {number} val Discount value/amount
   */
  getModuleDiscount() {
    return this.discounts[1];
  }

  /**
   * Persist selected cost tab
   * @param {number} tabName Cost tab name
   */
  setCostTab(tabName) {
    this.costTab = tabName;
    _put(LS_KEY_COST_TAB, tabName);
  }

  /**
   * Get the saved  discount
   * @return {number} val Discount value/amount
   */
  getCostTab() {
    return this.costTab;
  }

  /**
   * Retrieve the last router state from local storage
   * @return {object} state State object containing state name and params
   */
  getState() {
    return this.state;
  }

  /**
   * Save the current router state to localstorage
   * @param {object} state State object containing state name and params
   */
  setState(state) {
    this.state = state;
    _put(LS_KEY_STATE, state);
  }

  /**
   * Retrieve the last router state from local storage
   * @return {number} size Ratio
   */
  getSizeRatio() {
    return this.sizeRatio;
  }

  /**
   * Save the current size ratio to localstorage
   * @param {number} sizeRatio Size ratio scale
   */
  setSizeRatio(sizeRatio) {
    if (sizeRatio != this.sizeRatio) {
      this.sizeRatio = sizeRatio;
      _put(LS_KEY_SIZE_RATIO, sizeRatio);
      this.emit('sizeRatio', sizeRatio);
    }
  }

  /**
   * Check if localStorage is enabled/active
   * @return {Boolean} True if localStorage is enabled
   */
  isEnabled() {
    return LS != null;
  }
}

export default new Persist();
