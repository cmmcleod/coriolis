jest.unmock('../src/app/stores/Persist');

import React from 'react';
import ReactDOM from 'react-dom';
import TU from 'react-testutils-additions';

let origAddEventListener = window.addEventListener;
let storageListener;
let ls = {};

// Implment mock localStorage
let localStorage = {
  getItem: function(key) {
    return ls[key];
  },
  setItem: function(key, value) {
    ls[key] = value;
  },
  removeItem: function(key) {
    delete ls[key];
  },
  clear: function() {
    ls = {};
  }
}

window.addEventListener = function(eventName, listener) {

  if(eventName == 'storage') {
    storageListener = listener; // Keep track of latest storage listener
  } else {
    origAddEventListener.apply(arguments);
  }
}

describe('Persist', function() {

  const Persist = require('../src/app/stores/Persist').Persist;

  describe('Multi tab/window', function() {
    it("syncs builds", function() {
      window.localStorage = localStorage;
      ls = {};
      let p = new Persist();
      let newBuilds = {
        anaconda: { test: '1234' }
      };

      storageListener({ key: 'builds', newValue: JSON.stringify(newBuilds) });
      expect(p.getBuild('anaconda', 'test')).toBe('1234');
    });
  });

  describe('General and Settings', function() {
    it("has defaults", function() {
      window.localStorage = localStorage;
      ls = {};
      let p = new Persist();
      expect(p.getLangCode()).toBe('en');
      expect(p.showTooltips()).toBe(true);
      expect(p.getInsurance()).toBe('standard');
      expect(p.getShipDiscount()).toBe(0);
      expect(p.getModuleDiscount()).toBe(0);
      expect(p.getSizeRatio()).toBe(1);
    });

    it("loads from localStorage correctly", function() {
      window.localStorage = localStorage;
      let savedData = require('./fixtures/valid-backup');
      ls = {};
      ls.builds = JSON.stringify(savedData.builds);
      ls.NG_TRANSLATE_LANG_KEY = 'de';
      ls.insurance = 'Standard';
      ls.shipDiscount = 0.25;
      ls.moduleDiscount = 0.15;
      let p = new Persist();

      expect(p.getInsurance()).toBe('standard');
      expect(p.getShipDiscount()).toBe(0.25);
      expect(p.getModuleDiscount()).toBe(0.15);
      expect(p.getLangCode()).toEqual('de');
      expect(p.getBuilds('anaconda')).toEqual(savedData.builds.anaconda);
      expect(p.getBuilds('python')).toEqual(savedData.builds.python);
      expect(p.getBuildsNamesFor('imperial_clipper')).toEqual(['Cargo', 'Current', 'Dream', 'Multi-purpose']);
      expect(p.getBuild('type_7_transport', 'Cargo')).toEqual('02A5D5A4D3D3D5C--------0505040403480101');
    });

    it("uses defaults from a corrupted localStorage", function() {
      window.localStorage = localStorage;
      ls = {};
      ls.builds = "not valid json";
      ls.comparisons = "1, 3, 4";
      ls.insurance = 'this insurance does not exist';
      ls.shipDiscount = 'this is not a number';
      ls.moduleDiscount = 10; // Way to big

      let p = new Persist();
      expect(p.getLangCode()).toBe('en');
      expect(p.showTooltips()).toBe(true);
      expect(p.getInsurance()).toBe('standard');
      expect(p.getShipDiscount()).toBe(0);
      expect(p.getModuleDiscount()).toBe(0);
      expect(p.getBuilds()).toEqual({});
      expect(p.getComparisons()).toEqual({});
    });

    it("works without localStorage", function() {
      window.localStorage = null;
      let p = new Persist();
      expect(p.getLangCode()).toBe('en');
      expect(p.showTooltips()).toBe(true);
      expect(p.getInsurance()).toBe('standard');
      expect(p.getShipDiscount()).toBe(0);
      expect(p.getModuleDiscount()).toBe(0);
      expect(p.getSizeRatio()).toBe(1);

      p.saveBuild('anaconda', 'test', '12345');
      expect(p.getBuild('anaconda', 'test')).toBe('12345');

      p.deleteBuild('anaconda', 'test');
      expect(p.hasBuilds()).toBe(false);
    });

    it("generates the backup", function() {
      window.localStorage = localStorage;
      let savedData = require('./fixtures/valid-backup');
      ls = {};
      ls.builds = JSON.stringify(savedData.builds);
      ls.insurance = 'Beta';
      ls.shipDiscount = 0.25;
      ls.moduleDiscount = 0.15;

      let p = new Persist();
      let backup = p.getAll();

      expect(backup.insurance).toBe('beta');
      expect(backup.shipDiscount).toBe(0.25);
      expect(backup.moduleDiscount).toBe(0.15);
      expect(backup.builds).toEqual(savedData.builds);
      expect(backup.comparisons).toEqual({});
    });
  });
})
