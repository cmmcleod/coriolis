import { EventEmitter } from 'fbemitter';

const LS_KEY_BUILDS = 'builds';
const LS_KEY_COMPARISONS = 'comparisons';
const LS_KEY_LANG = 'NG_TRANSLATE_LANG_KEY';
const LS_KEY_COST_TAB = 'costTab';
const LS_KEY_INSURANCE = 'insurance';
const LS_KEY_DISCOUNTS = 'discounts';
const LS_KEY_STATE = 'state';
const LS_KEY_SIZE_RATIO = 'sizeRatio';

let LS;

// Safe check to determine if localStorage is enabled
try {
  localStorage.setItem('s', 1);
  localStorage.removeItem('s');
  LS = localStorage;
} catch(e) {
  LS = null;
}

function _put(key, value) {
  if (LS) {
    LS.setItem(key, typeof value != 'string' ? JSON.stringify(value) : value);
  }
}

function _getString(key) {
  return LS.getItem(key);
}

function _get(key) {
  let str = _getString(key);
  return str ? JSON.parse(str) : null;
}

function _delete(key) {
  if (LS) {
    LS.removeItem(key);
  }
}


/**
 * [description]
 */
class Persist extends EventEmitter {

  constructor() {
    super();
    let buildJson = _get(LS_KEY_BUILDS);
    let comparisonJson = _get(LS_KEY_COMPARISONS);

    this.builds = buildJson ? buildJson : {};
    this.comparisons = comparisonJson ? comparisonJson: {};
    this.buildCount = Object.keys(this.builds).length;
    this.langCode = _getString(LS_KEY_LANG) || 'en';
    this.insurance = _getString(LS_KEY_INSURANCE);
    this.discounts = _get(LS_KEY_DISCOUNTS);
    this.costTab = _getString(LS_KEY_COST_TAB);
    this.state =  _get(LS_KEY_STATE);
    this.sizeRatio = _get(LS_KEY_SIZE_RATIO) || 1;
  }

  getLangCode() {
    return this.langCode;
  };

  setLangCode(langCode) {
    this.langCode = langCode;
    _put(LS_KEY_LANG, langCode);
    this.emit('language', langCode);
  }

  /**
   * Persist a ship build in local storage.
   *
   * @param  {string} shipId The unique id for a model of ship
   * @param  {string} name   The name of the build
   * @param  {string} code   The serialized code
   */
  saveBuild(shipId, name, code) {
    if (LS) {
      if (!this.builds[shipId]) {
        this.builds[shipId] = {};
      }
      let newBuild = !this.builds[shipId][name];
      this.builds[shipId][name] = code;
      _put(LS_KEY_BUILDS, this.builds);
      if (newBuild) {
        this.emit('builds', this.builds);
      }
    }
  };

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
  };

  getBuilds() {
    return this.builds;
  }

  hasBuild(shipId, name) {
    return this.builds[shipId] && this.builds[shipId][name];
  }

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
      var comps = this.comparisons;
      for (var c in comps) {
        for (var i = 0; i < comps[c].builds.length; i++) {  // For all builds in the current comparison
          if (comps[c].builds[i].shipId == shipId && comps[c].builds[i].buildName == name) {
            comps[c].builds.splice(i, 1);
            break;  // A build is unique per comparison
          }
        }
      }
      _put(LS_KEY_COMPARISONS, this.comparisons);
      this.emit('builds', this.builds);
    }
  };

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
      facets: facets,
      builds: builds.map(b => { return { shipId: b.id || b.shipId, buildName: b.buildName }; })
    };
    _put(LS_KEY_COMPARISONS, this.comparisons);
    this.emit('comparisons', this.comparisons);
  };

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
  };

  getComparisons() {
    return this.comparisons;
  }

  hasComparison(name) {
    return !!this.comparisons[name];
  }

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
  };

  /**
   * Delete all builds and comparisons from localStorage
   */
  deleteAll() {
    this.builds = {};
    this.comparisons = {};
    _delete(LS_KEY_BUILDS);
    _delete(LS_KEY_COMPARISONS);
    this.emit('deletedall');
  };

  getAll() {
    var data = {};
    data[LS_KEY_BUILDS] = this.getBuilds();
    data[LS_KEY_COMPARISONS] = this.getComparisons();
    data[LS_KEY_INSURANCE] = this.getInsurance();
    data[LS_KEY_DISCOUNTS] = this.getDiscount();
    return data;
  };

  /**
   * Get the saved insurance type
   * @return {string} The name of the saved insurance type of null
   */
  getInsurance() {
    return this.insurance;
  };

  /**
   * Persist selected insurance type
   * @param {string} name Insurance type name
   */
  setInsurance(insurance) {
    this.insurance = insurance
    _put(LS_KEY_INSURANCE, insurance);
    this.emit('insurance', insurance);
  };

  /**
   * Persist selected discount
   * @param {number} val Discount value/amount
   */
  setShipDiscount(shipDiscount) {
    this.discounts[0] = shipDiscount;
    _put(LS_KEY_DISCOUNTS, this.discounts);
    this.emit('discounts', this.discounts);
  };

  /**
   * Get the saved ship discount
   * @return {number} val Discount value/amount
   */
  getShipDiscount() {
    return this.discounts[0];
  };

  /**
   * Persist selected discount
   * @param {number} val Discount value/amount
   */
  setModuleDiscount(moduleDiscount) {
    this.discounts[1] = moduleDiscount;
    _put(LS_KEY_DISCOUNTS, this.discounts);
    this.emit('discounts', this.discounts);
  };

  /**
   * Get the saved ship discount
   * @return {number} val Discount value/amount
   */
  getComponentDiscount() {
    return this.discounts[1];
  };

  /**
   * Persist selected cost tab
   * @param {number} val Discount value/amount
   */
  setCostTab(tabName) {
    this.costTab = tabName;
    _put(LS_KEY_COST_TAB, tabName);
  };

  /**
   * Get the saved  discount
   * @return {number} val Discount value/amount
   */
  getCostTab() {
    return this.costTab;
  };

  /**
   * Retrieve the last router state from local storage
   * @return {object} state State object containing state name and params
   */
  getState() {
     return this.state;
  };

  /**
   * Save the current router state to localstorage
   * @param {object} state State object containing state name and params
   */
  setState(state) {
    this.state = state;
    _put(LS_KEY_STATE, state);
  };

  /**
   * Retrieve the last router state from local storage
   * @return {number} size Ratio
   */
  getSizeRatio() {
    return this.sizeRatio;
  };

  /**
   * Save the current size ratio to localstorage
   * @param {number} sizeRatio
   */
  setSizeRatio(sizeRatio) {
    if (sizeRatio != this.sizeRatio) {
      this.sizeRatio = sizeRatio;
      _put(LS_KEY_SIZE_RATIO, sizeRatio);
      this.emit('sizeRatio', sizeRatio);
    }
  };

  /**
   * Check if localStorage is enabled/active
   * @return {Boolean} True if localStorage is enabled
   */
  isEnabled() {
    return LS != null;
  }
}

export default new Persist();
