import Ship from '../src/app/shipyard/Ship';
import { Ships } from 'coriolis-data/dist';
import * as ModuleUtils from '../src/app/shipyard/ModuleUtils';

describe("Agility", function() {

  it("correctly calculates speed", function() {
    let agilityData = require('./fixtures/agility-data');

    for (let shipId in agilityData) {
      for (let thrusterId in agilityData[shipId]) {
        const thrusterData = agilityData[shipId][thrusterId];
        let shipData = Ships[shipId];
        let ship = new Ship(shipId, shipData.properties, shipData.slots);
        ship.buildWith(shipData.defaults);
        ship.use(ship.standard[1], ModuleUtils.findModule('t', thrusterId));

        expect(Math.round(ship.topSpeed)).toBe(thrusterData.speed);
      }
    }
  });

  it("correctly calculates boost", function() {
    let agilityData = require('./fixtures/agility-data');

    for (let shipId in agilityData) {
      for (let thrusterId in agilityData[shipId]) {
        const thrusterData = agilityData[shipId][thrusterId];
        let shipData = Ships[shipId];
        let ship = new Ship(shipId, shipData.properties, shipData.slots);
        ship.buildWith(shipData.defaults);
	// Turn off internals to ensure we have enough power to boost
	for (let internal in ship.internal) {
          ship.internal[internal].enabled = 0;
	}
        ship.use(ship.standard[1], ModuleUtils.findModule('t', thrusterId));

        expect(Math.round(ship.topBoost)).toBe(thrusterData.boost);
      }
    }
  });

  it("correctly calculates pitch", function() {
    let agilityData = require('./fixtures/agility-data');

    for (let shipId in agilityData) {
      for (let thrusterId in agilityData[shipId]) {
        const thrusterData = agilityData[shipId][thrusterId];
        let shipData = Ships[shipId];
        let ship = new Ship(shipId, shipData.properties, shipData.slots);
        ship.buildWith(shipData.defaults);
        ship.use(ship.standard[1], ModuleUtils.findModule('t', thrusterId));

        expect(Math.round(ship.pitches[4] * 100) / 100).toBeCloseTo(thrusterData.pitch, 1);
      }
    }
  });

  it("correctly calculates roll", function() {
    let agilityData = require('./fixtures/agility-data');

    for (let shipId in agilityData) {
      for (let thrusterId in agilityData[shipId]) {
        const thrusterData = agilityData[shipId][thrusterId];
        let shipData = Ships[shipId];
        let ship = new Ship(shipId, shipData.properties, shipData.slots);
        ship.buildWith(shipData.defaults);
        ship.use(ship.standard[1], ModuleUtils.findModule('t', thrusterId));

        expect(Math.round(ship.rolls[4] * 100) / 100).toBeCloseTo(thrusterData.roll, 1);
      }
    }
  });

  it("correctly calculates yaw", function() {
    let agilityData = require('./fixtures/agility-data');

    for (let shipId in agilityData) {
      for (let thrusterId in agilityData[shipId]) {
        const thrusterData = agilityData[shipId][thrusterId];
        let shipData = Ships[shipId];
        let ship = new Ship(shipId, shipData.properties, shipData.slots);
        ship.buildWith(shipData.defaults);
        ship.use(ship.standard[1], ModuleUtils.findModule('t', thrusterId));

        expect(Math.round(ship.yaws[4] * 100) / 100).toBeCloseTo(thrusterData.yaw, 1);
      }
    }
  });
});
