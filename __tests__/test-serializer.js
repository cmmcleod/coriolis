import Ship from '../src/app/shipyard/Ship';
import { Ships } from 'coriolis-data';
import * as Serializer from '../src/app/shipyard/Serializer';

describe("Serializer Service", function() {

  const anacondaTestExport = require.requireActual('./fixtures/anaconda-test-detailed-export-v3');
  const code = anacondaTestExport.references[0].code;
  const anaconda = Ships.anaconda;

  describe("To Detailed Build", function() {

    let testBuild, exportData;

    beforeEach(function() {
      testBuild = new Ship('anaconda', anaconda.properties, anaconda.slots);
      testBuild.buildFrom(code);
      exportData = Serializer.toDetailedBuild('Test', testBuild);
    });

    xit("conforms to the v2 ship-loadout schema", function() {
      // var validate = jsen(require('../schemas/ship-loadout/3'));
      // var valid = validate(exportData);
      expect(valid).toBeTruthy();
    });

    it("contains the correct components and stats", function() {
      expect(exportData.components).toEqual(anacondaTestExport.components);
      expect(exportData.stats).toEqual(anacondaTestExport.stats);
      expect(exportData.ship).toEqual(anacondaTestExport.ship);
      expect(exportData.name).toEqual(anacondaTestExport.name);
    });

  });

  describe("From Detailed Build", function() {

    it("builds the ship correctly", function() {
      let testBuildA = new Ship('anaconda', anaconda.properties, anaconda.slots);
      testBuildA.buildFrom(code);
      let testBuildB = Serializer.fromDetailedBuild(anacondaTestExport);

      for(var p in testBuildB) {
        if (p == 'availCS') {
          continue;
        }
        expect(testBuildB[p]).toEqual(testBuildA[p], p + ' does not match');
      }

    });

  });

});
