describe("Serializer Service", function() {
  beforeEach(module('app'));

  var Ship,
      Serializer,
      code = '48A6A6A5A8A8A5C2c0o0o0o1m1m0q0q0404-0l0b0100034k5n052d04--0303326b',
      anaconda = DB.ships['anaconda'],
      testBuild,
      exportData;

  beforeEach(inject(function (_Ship_, _Serializer_) {
    Ship = _Ship_;
    Serializer = _Serializer_;
  }));

  describe("To Detailed Build", function() {

    beforeEach(function() {
      testBuild = new Ship('anaconda', anaconda.properties, anaconda.slots);
      Serializer.toShip(testBuild, code);
      exportData = Serializer.toDetailedBuild('Test', testBuild, code);
    });

    it("conforms to the ship-loadout schema", function() {
      var shipLoadoutSchema = __json__['schemas/ship-loadout/1'];
      var validate = jsen(shipLoadoutSchema);
      var valid = validate(exportData);
      expect(valid).toBeTruthy();
    });

    it("contains the correct components and stats", function() {
      var anacondaTestExport = __json__['fixtures/anaconda-test-detailed-export'];
      expect(exportData.components).toEqual(anacondaTestExport.components);
      expect(exportData.stats).toEqual(anacondaTestExport.stats);
      expect(exportData.ship).toEqual(anacondaTestExport.ship);
      expect(exportData.name).toEqual(anacondaTestExport.name);
    });

  });

  describe("From Detailed Build", function() {

    it("builds the ship correctly", function() {
      var anacondaTestExport = __json__['fixtures/anaconda-test-detailed-export'];
      testBuildA = new Ship('anaconda', anaconda.properties, anaconda.slots);
      Serializer.toShip(testBuildA, code);
      testBuildB = Serializer.fromDetailedBuild(anacondaTestExport);

      for(var p in testBuildB) {
        expect(testBuildB[p]).toEqual(testBuildA[p], p + ' does not match');
      }

    });

  });

});
