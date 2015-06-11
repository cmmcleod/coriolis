/**
 * Service managing seralization and deserialization of models for use in URLs and persistene.
 */
angular.module('app').service('Serializer', ['lodash', function (_) {

 /**
   * Serializes the ships selected components for all slots to a URL friendly string.
   * @param {Ship} ship   The ship to be serialized.
   * @return {string}     Encoded string of components
   */
  this.fromShip = function(ship) {
    var power = {
      enabled: [ship.cargoScoop.enabled? 1 : 0],
      priorities: [ship.cargoScoop.priority]
    };

    var data = [
      ship.bulkheads.id,
      _.map(ship.common, mapGroup, power),
      _.map(ship.hardpoints, mapGroup, power),
      _.map(ship.internal, mapGroup, power),
      '.',
      LZString.compressToBase64(power.enabled.join('')).replace(/\//g,'-'),
      '.',
      LZString.compressToBase64(power.priorities.join('')).replace(/\//g,'-')
    ];

    return _.flatten(data).join('');
  };

  /**
   * Updates an existing ship instance's slots with components determined by the
   * code.
   *
   * @param {Ship}    ship  The ship instance to be updated
   * @param {string}  code  The string to deserialize
   */
  this.toShip = function (ship, dataString) {
    var commonCount = ship.common.length,
        hpCount = commonCount + ship.hardpoints.length,
        totalCount = hpCount + ship.internal.length,
        common = new Array(ship.common.length),
        hardpoints = new Array(ship.hardpoints.length),
        internal = new Array(ship.internal.length),
        parts = dataString.split('.'),
        priorities = null,
        enabled = null,
        code = parts[0];

    if(parts[1]) {
      enabled = LZString.decompressFromBase64(parts[1].replace(/-/g,'/')).split('');
    }

    if(parts[2]) {
      priorities = LZString.decompressFromBase64(parts[2].replace(/-/g,'/')).split('');
    }

    decodeToArray(code, internal, decodeToArray(code, hardpoints, decodeToArray(code, common, 1)));

    // get the remaining substring / split into parts for
    // - priorities
    // - enabled/disabled

    ship.buildWith({
      bulkheads: code.charAt(0) * 1,
      common: common,
      hardpoints: hardpoints,
      internal: internal,
    }, priorities, enabled);
  };

  this.fromComparison = function (name, builds, facets, predicate, desc) {
    var shipBuilds = [];

    builds.forEach(function (b) {
      shipBuilds.push({s: b.id, n: b.buildName, c: this.fromShip(b)});
    }.bind(this));

    return LZString.compressToBase64(angular.toJson({
      n: name,
      b: shipBuilds,
      f: facets,
      p: predicate,
      d: desc? 1 : 0
    })).replace(/\//g,'-');
  };

  this.toComparison = function (code) {
    return angular.fromJson(LZString.decompressFromBase64(code.replace(/-/g,'/')));
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
    this.enabled.push(slot.enabled? 1 : 0);
    this.priorities.push(slot.priority);

    return (slot.id === null)? '-' : slot.id;
  }

  function decodeToArray(code, arr, codePos) {
    for (i = 0; i < arr.length; i++) {
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

}]);
