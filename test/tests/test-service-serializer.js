describe("Serializer Service", function() {
  beforeEach(module('app'));

  var Ship, Serializer;

  beforeEach(inject(function (_Ship_, _Serializer_) {
    Ship = _Ship_;
    Serializer = _Serializer_;
  }));

  describe("Detailed Export", function() {
    var code = '48A6A6A5A8A8A5C2c0o0o0o1m1m0q0q0404-0l0b0100034k5n052d04--0303326b.AwRj4yo5dig=.MwBhEYy6duwEziA',
        anaconda = DB.ships['anaconda'],
        testBuild,
        exportData;

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

});
