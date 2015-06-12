describe("Ship Factory", function() {

  var Ship;

  beforeEach(module('shipyard'));
  beforeEach(inject(['Ship', function (_Ship_) {
    Ship = _Ship_;
  }]));

  it("can build all ships", function() {
    for (var s in DB.ships) {
      var shipData = DB.ships[s];
      var ship = new Ship(s, shipData.properties, shipData.slots);

      for (p in shipData.properties) {
        expect(ship[p]).toEqual(shipData.properties[p], s + ' property [' + p + '] does not match when built');
      }

      ship.buildWith(shipData.defaults);

      expect(ship.totalCost).toEqual(shipData.retailCost, s + ' retail cost does not match default build cost');
      expect(ship.priorityBands[0].retracted).toBeGreaterThan(0, s + ' cargo');
      expect(ship.powerAvailable).toBeGreaterThan(0, s + ' powerAvailable');
      expect(ship.unladenRange).toBeGreaterThan(0, s + ' unladenRange');
      expect(ship.ladenRange).toBeGreaterThan(0, s + ' ladenRange');
      expect(ship.fuelCapacity).toBeGreaterThan(0, s + ' fuelCapacity');
      expect(ship.unladenTotalRange).toBeGreaterThan(0, s + ' unladenTotalRange');
      expect(ship.ladenTotalRange).toBeGreaterThan(0, s + ' ladenTotalRange');
      expect(ship.shieldStrength).toBeGreaterThan(0, s + ' shieldStrength');
      expect(ship.armourTotal).toBeGreaterThan(0, s + ' armourTotal');
    }
  });

});