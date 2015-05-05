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
    var data = [
      ship.bulkheads.id,
      _.map(ship.common, idToStr),
      _.map(ship.hardpoints, idToStr),
      _.map(ship.internal, idToStr),
    ];
    console.log('code',_.flatten(data).join(''));
    return _.flatten(data).join('');
  };

  /**
   * Updates an existing ship instance's slots with components determined by the
   * code.
   *
   * @param {Ship}    ship  The ship instance to be updated
   * @param {string}  code  The string to deserialize
   */
  this.toShip = function (ship, code) {
    var commonCount = ship.common.length;
    var hpCount = commonCount + ship.hardpoints.length;
    var comps = {
      bulkheads: code.charAt(0) * 1,
      common: new Array(ship.common.length),
      hardpoints: new Array(ship.hardpoints.length),
      internal: new Array(ship.internal.length)
    };

    // TODO: improve...
    for (var i = 1, c = 0, l = code.length; i < l; i++) {
      var empty = code.charAt(i) == '-';
      if (c < commonCount) {
        comps.common[c] = empty? 0 : code.substring(i, i + 2);
      } else if (c < hpCount) {
        comps.hardpoints[c - commonCount] = empty? 0 : code.substring(i, i + 2);
      } else {
        comps.internal[c - hpCount] = empty? 0 : code.substring(i, i + 2);
      }
      if (!empty) {
        i++;
      }
      c++;
    }
    ship.buildWith(comps);
  };

  /**
   * Utility function to retrieve a safe string for selected component for a slot.
   * Used for serialization to code only.
   *
   * @private
   * @param  {object} slot The slot object.
   * @return {string}      The id of the selected component or '-' if none selected
   */
  function idToStr(slot) {
    return (slot.id === null)? '-' : slot.id;
  }

}]);
