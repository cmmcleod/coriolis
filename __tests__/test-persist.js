jest.dontMock('../src/app/stores/Persist');

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

  describe('Builds', function() {
    it("loads from localStorage correctly", function() {

    });

    it("can save a build", function() {

    });

    it("can delete a build", function() {

    });

    it("works without localStorage", function() {

    });
  });

  describe('Comparisons', function() {
    it("loads from localStorage correctly", function() {

    });

    it("works without localStorage", function() {

    });
  });

  describe('Multi tab/window', function() {
    it.only("syncs builds", function() {
      window.localStorage = localStorage;

      let p = new Persist();
      let newBuilds = {};

      storageListener({ key: 'builds', newValue: JSON.stringify(newBuilds) });
    });
  });

  describe('General and Settings', function() {
    it.only("has defaults", function() {
      let p = new Persist();
      expect(p.getLangCode()).toBe('en');
      expect(p.showTooltips()).toBe(true);
      expect(p.getInsurance()).toBe('standard');
      expect(p.getShipDiscount()).toBe(1);
      expect(p.getModuleDiscount()).toBe(1);
      expect(p.getSizeRatio()).toBe(1);
    });

    it("loads from localStorage correctly", function() {
      expect(false).toBeTruthy('TODO: Implement');
    });

    it("uses defaults from a corrupted localStorage", function() {
      expect(false).toBeTruthy('TODO: Implement');
    });

    it("works without localStorage", function() {

    });

    it("generates the backup", function() {
      expect(false).toBeTruthy('TODO: Implement');
    });

  });

});
