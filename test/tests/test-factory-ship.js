describe("Ship Factory", function() {

  var Ship;
  var Components;

  beforeEach(module('shipyard'));
  beforeEach(inject(['Ship', 'Components', function (_Ship_, _Components_) {
    Ship = _Ship_;
    Components = _Components_;
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
      expect(ship.armour).toBeGreaterThan(0, s + ' armour');
    }
  });

  it("resets and rebuilds properly", function() {
    var id = 'cobra_mk_iii';
    var cobra = DB.ships[id];
    var shipA = new Ship(id, cobra.properties, cobra.slots);
    var shipB = new Ship(id, cobra.properties, cobra.slots);
    var testShip = new Ship(id, cobra.properties, cobra.slots);

    var buildA = cobra.defaults;
    var buildB = {
      common:['4A', '4A', '4A', '3D', '3A', '3A', '4C'],
      hardpoints: ['0s', '0s', '2d', '2d', 0, '04'],
      internal: ['45', '03', '2b', '2o', '27', '53']
    };

    shipA.buildWith(buildA); // Build A
    shipB.buildWith(buildB);// Build B
    testShip.buildWith(buildA);

    for(var p in testShip) {
      expect(testShip[p]).toEqual(shipA[p], p + ' does not match');
    }

    testShip.buildWith(buildB);

    for(var p in testShip) {
      expect(testShip[p]).toEqual(shipB[p], p + ' does not match');
    }

    testShip.buildWith(buildA);

    for(var p in testShip) {
      expect(testShip[p]).toEqual(shipA[p], p + ' does not match');
    }
  });

  it("discounts hull and components properly", function() {
    var id = 'cobra_mk_iii';
    var cobra = DB.ships[id];
    var testShip = new Ship(id, cobra.properties, cobra.slots);
    testShip.buildWith(cobra.defaults);

    var originalHullCost = testShip.hullCost;
    var originalTotalCost = testShip.totalCost;
    var discount = 0.9;

    expect(testShip.c.discountedCost).toEqual(originalHullCost, 'Hull cost does not match');

    testShip.applyDiscounts(discount, discount);

    // Floating point errors cause miniscule decimal places which are handled in the app by rounding/formatting

    expect(Math.floor(testShip.c.discountedCost)).toEqual(Math.floor(originalHullCost * discount), 'Discounted Hull cost does not match');
    expect(Math.floor(testShip.totalCost)).toEqual(Math.floor(originalTotalCost * discount), 'Discounted Total cost does not match');

    testShip.applyDiscounts(1, 1); // No discount, 100% of cost

    expect(testShip.c.discountedCost).toEqual(originalHullCost, 'Hull cost does not match');
    expect(testShip.totalCost).toEqual(originalTotalCost, 'Total cost does not match');

    testShip.applyDiscounts(discount, 1); // Only discount hull

    expect(Math.floor(testShip.c.discountedCost)).toEqual(Math.round(originalHullCost * discount), 'Discounted Hull cost does not match');
    expect(testShip.totalCost).toEqual(originalTotalCost - originalHullCost + testShip.c.discountedCost, 'Total cost does not match');

  });

  it("enforces a single shield generator", function() {
    var id = 'anaconda';
    var anacondaData = DB.ships[id];
    var anaconda = new Ship(id, anacondaData.properties, anacondaData.slots);
    anaconda.buildWith(anacondaData.defaults);

    expect(anaconda.internal[2].c.grp).toEqual('sg', 'Anaconda default shield generator slot');

    anaconda.use(anaconda.internal[1], '4j', Components.internal('4j'));  // 6E Shield Generator

    expect(anaconda.internal[2].c).toEqual(null, 'Anaconda default shield generator slot is empty');
    expect(anaconda.internal[2].id).toEqual(null, 'Anaconda default shield generator slot id is null');
    expect(anaconda.internal[1].id).toEqual('4j', 'Slot 1 should have SG 4j in it');
    expect(anaconda.internal[1].c.grp).toEqual('sg','Slot 1 should have SG 4j in it');

  });

  it("enforces a single shield fuel scoop", function() {
    var id = 'anaconda';
    var anacondaData = DB.ships[id];
    var anaconda = new Ship(id, anacondaData.properties, anacondaData.slots);
    anaconda.buildWith(anacondaData.defaults);

    anaconda.use(anaconda.internal[4], '32', Components.internal('32')); // 4A Fuel Scoop
    expect(anaconda.internal[4].c.grp).toEqual('fs', 'Anaconda fuel scoop slot');

    anaconda.use(anaconda.internal[3], '32', Components.internal('32'));

    expect(anaconda.internal[4].c).toEqual(null, 'Anaconda original fuel scoop slot is empty');
    expect(anaconda.internal[4].id).toEqual(null, 'Anaconda original fuel scoop slot id is null');
    expect(anaconda.internal[3].id).toEqual('32', 'Slot 1 should have FS 32 in it');
    expect(anaconda.internal[3].c.grp).toEqual('fs','Slot 1 should have FS 32 in it');
  });

  it("enforces a single refinery", function() {
    var id = 'anaconda';
    var anacondaData = DB.ships[id];
    var anaconda = new Ship(id, anacondaData.properties, anacondaData.slots);
    anaconda.buildWith(anacondaData.defaults);

    anaconda.use(anaconda.internal[4], '23', Components.internal('23')); // 4E Refinery
    expect(anaconda.internal[4].c.grp).toEqual('rf', 'Anaconda refinery slot');

    anaconda.use(anaconda.internal[3], '23', Components.internal('23'));

    expect(anaconda.internal[4].c).toEqual(null, 'Anaconda original refinery slot is empty');
    expect(anaconda.internal[4].id).toEqual(null, 'Anaconda original refinery slot id is null');
    expect(anaconda.internal[3].id).toEqual('23', 'Slot 1 should have RF 23 in it');
    expect(anaconda.internal[3].c.grp).toEqual('rf','Slot 1 should have RF 23 in it');
  });

});
