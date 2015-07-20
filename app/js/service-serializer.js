/**
 * Service managing seralization and deserialization of models for use in URLs and persistene.
 */
angular.module('app').service('Serializer', ['lodash', 'GroupMap', 'MountMap', 'ShipsDB', 'Ship', 'Components', '$state', function(_, GroupMap, MountMap, ShipsDB, Ship, Components, $state) {

 /**
   * Serializes the ships selected components for all slots to a URL friendly string.
   * @param {Ship} ship   The ship to be serialized.
   * @return {string}     Encoded string of components
   */
  this.fromShip = function(ship) {
    var power = {
      enabled: [ship.cargoScoop.enabled ? 1 : 0],
      priorities: [ship.cargoScoop.priority]
    };

    var data = [
      ship.bulkheads.id,
      _.map(ship.common, mapGroup, power),
      _.map(ship.hardpoints, mapGroup, power),
      _.map(ship.internal, mapGroup, power),
      '.',
      LZString.compressToBase64(power.enabled.join('')).replace(/\//g, '-'),
      '.',
      LZString.compressToBase64(power.priorities.join('')).replace(/\//g, '-')
    ];

    return _.flatten(data).join('');
  };

  /**
   * Updates an existing ship instance's slots with components determined by the
   * code.
   *
   * @param {Ship}    ship        The ship instance to be updated
   * @param {string}  dataString  The string to deserialize
   */
  this.toShip = function(ship, dataString) {
    var common = new Array(ship.common.length),
        hardpoints = new Array(ship.hardpoints.length),
        internal = new Array(ship.internal.length),
        parts = dataString.split('.'),
        priorities = null,
        enabled = null,
        code = parts[0];

    if (parts[1]) {
      enabled = LZString.decompressFromBase64(parts[1].replace(/-/g, '/')).split('');
    }

    if (parts[2]) {
      priorities = LZString.decompressFromBase64(parts[2].replace(/-/g, '/')).split('');
    }

    decodeToArray(code, internal, decodeToArray(code, hardpoints, decodeToArray(code, common, 1)));

    ship.buildWith(
      {
        bulkheads: code.charAt(0) * 1,
        common: common,
        hardpoints: hardpoints,
        internal: internal
      },
      priorities,
      enabled
    );
  };

  this.toDetailedBuild = function(buildName, ship, code) {
    var standard = ship.common,
        hardpoints = ship.hardpoints,
        internal = ship.internal;

    var data = {
      $schema: 'http://cdn.coriolis.io/schemas/ship-loadout/1.json#',
      name: buildName,
      ship: ship.name,
      references: [{
        name: 'Coriolis.io',
        url: $state.href('outfit', { shipId: ship.id, code: code, bn: buildName }, { absolute: true }),
        code: code,
        shipId: ship.id
      }],
      components: {
        standard: {
          bulkheads: ship.bulkheads.c.name,
          powerPlant: { class: standard[0].c.class, rating: standard[0].c.rating },
          thrusters: { class: standard[1].c.class, rating: standard[1].c.rating },
          frameShiftDrive: { class: standard[2].c.class, rating: standard[2].c.rating },
          lifeSupport: { class: standard[3].c.class, rating: standard[3].c.rating },
          powerDistributor: { class: standard[4].c.class, rating: standard[4].c.rating },
          sensors: { class: standard[5].c.class, rating: standard[5].c.rating },
          fuelTank: { class: standard[6].c.class, rating: standard[6].c.rating }
        },
        hardpoints: _.map(_.filter(hardpoints, function(slot) { return slot.maxClass > 0; }), slotToSchema),
        utility: _.map(_.filter(hardpoints, function(slot) { return slot.maxClass === 0; }), slotToSchema),
        internal: _.map(internal, slotToSchema)
      },
      stats: {}
    };

    for (var stat in ship) {
      if (!isNaN(ship[stat])) {
        data.stats[stat] = Math.round(ship[stat] * 100) / 100;
      }
    }

    return data;
  };

  this.fromDetailedBuild = function(detailedBuild) {
    var shipId = _.findKey(ShipsDB, { properties: { name: detailedBuild.ship } });

    if (!shipId) {
      throw 'No such ship: ' + detailedBuild.ship;
    }

    var comps = detailedBuild.components;
    var shipData = ShipsDB[shipId];
    var ship = new Ship(shipId, shipData.properties, shipData.slots);
    var bulkheads = Components.bulkheadIndex(comps.standard.bulkheads);

    if (bulkheads < 0) {
      throw 'Invalid bulkheads: ' + comps.standard.bulkheads;
    }

    var common = _.map(
      ['powerPlant', 'thrusters', 'frameShiftDrive', 'lifeSupport', 'powerDistributor', 'sensors', 'fuelTank'],
      function(c) {
        if (!comps.standard[c].class || !comps.standard[c].rating) {
          throw 'Invalid value for ' + c;
        }
        return comps.standard[c].class + comps.standard[c].rating;
      }
    );

    var internal = _.map(comps.internal, function(c) { return c ? Components.findInternalId(c.group, c.class, c.rating, c.name) : 0; });

    var hardpoints = _.map(comps.hardpoints, function(c) {
      return c ? Components.findHardpointId(c.group, c.class, c.rating, c.name, MountMap[c.mount], c.missile) : 0;
    });
    hardpoints = hardpoints.concat(_.map(comps.utility, function(c) {
      return c ? Components.findHardpointId(c.group, c.class, c.rating, c.name, MountMap[c.mount]) : 0;
    }));

    ship.buildWith({ bulkheads: bulkheads, common: common, hardpoints: hardpoints, internal: internal });

    return ship;
  };

  this.toDetailedExport = function(builds) {
    var data = [];

    for (var shipId in builds) {
      for (var buildName in builds[shipId]) {
        var code = builds[shipId][buildName];
        var shipData = ShipsDB[shipId];
        var ship = new Ship(shipId, shipData.properties, shipData.slots);
        this.toShip(ship, code);
        data.push(this.toDetailedBuild(buildName, ship, code));
      }
    }
    return data;
  };

  this.fromComparison = function(name, builds, facets, predicate, desc) {
    var shipBuilds = [];

    builds.forEach(function(b) {
      shipBuilds.push({ s: b.id, n: b.buildName, c: this.fromShip(b) });
    }.bind(this));

    return LZString.compressToBase64(angular.toJson({
      n: name,
      b: shipBuilds,
      f: facets,
      p: predicate,
      d: desc ? 1 : 0
    })).replace(/\//g, '-');
  };

  this.toComparison = function(code) {
    return angular.fromJson(LZString.decompressFromBase64(code.replace(/-/g, '/')));
  };

  /**
   * Utility function to retrieve a safe string for selected component for a slot.
   * Used for serialization to code only.
   *
   * @private
   * @param  {object} slot The slot object.
   * @return {string}      The id of the selected component or '-' if none selected
   */
  function mapGroup(slot) {
    this.enabled.push(slot.enabled ? 1 : 0);
    this.priorities.push(slot.priority);

    return slot.id === null ? '-' : slot.id;
  }

  function decodeToArray(code, arr, codePos) {
    for (var i = 0; i < arr.length; i++) {
      if (code.charAt(codePos) == '-') {
        arr[i] = 0;
        codePos++;
      } else {
        arr[i] = code.substring(codePos, codePos + 2);
        codePos += 2;
      }
    }
    return codePos;
  }

  function slotToSchema(slot) {
    if (slot.c) {
      var o = { class: slot.c.class, rating: slot.c.rating, group: GroupMap[slot.c.grp] };
      if (slot.c.name) {
        o.name = slot.c.name;
      }
      if (slot.c.mode) {
        o.mount = MountMap[slot.c.mode];
      }
      if (slot.c.missile) {
        o.missile = slot.c.missile;
      }
      return o;
    }
    return null;
  }


}]);
