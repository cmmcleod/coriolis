jest.dontMock('../src/app/stores/Persist');

import React from 'react';
import ReactDOM from 'react-dom';
import TU from 'react-testutils-additions';

xdescribe('Persist', function() {

  const Persist = require('../src/app/stores/Persist').default;

  describe('Builds', function() {


  });

  describe('Comparisons', function() {


  });

  describe('Settings', function() {

    it("has defaults", function() {
      expect(false).toBeTruthy('Implement');
    });

    it("loads from localStorage correctly", function() {
      expect(false).toBeTruthy('Implement');
    });

    it("generates the backup", function() {
      expect(false).toBeTruthy('Implement');
    });

  });

});
