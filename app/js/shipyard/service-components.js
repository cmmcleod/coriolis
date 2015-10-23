angular.module('shipyard').service('Components', ['lodash', 'ComponentsDB', 'ShipsDB', 'ComponentSet', 'GroupMap', function(_, C, Ships, ComponentSet, GroupMap) {

  var GrpNameToCodeMap = {};

  for (var grp in GroupMap) {
    GrpNameToCodeMap[GroupMap[grp]] = grp;
  }

  this.cargoHatch = function() {
    return { name: 'Cargo Hatch', class: 1, rating: 'H', power: 0.6 };
  };

  this.standard = function(typeIndex, componentId) {
    return C.standard[typeIndex][componentId];
  };

  this.hardpoints = function(id) {
    for (var n in C.hardpoints) {
      var group = C.hardpoints[n];
      for (var i = 0; i < group.length; i++) {
        if (group[i].id == id) {
          return group[i];
        }
      }
    }
    return null;
  };

  this.internal = function(id) {
    for (var n in C.internal) {
      var group = C.internal[n];
      for (var i = 0; i < group.length; i++) {
        if (group[i].id == id) {
          return group[i];
        }
      }
    }
    return null;
  };

  /**
   * Finds an internal Component based on Class, Rating, Group and/or name.
   * At least one ofGroup name or unique component name must be provided
   *
   * @param  {string} groupName [Optional] Full name or abbreviated name for component group
   * @param  {integer} clss     Component Class
   * @param  {string} rating    Component Rating
   * @param  {string} name      [Optional] Long/unique name for component -e.g. 'Advanced Discover Scanner'
   * @return {String}           The id of the component if found, null if not found
   */
  this.findInternal = function(groupName, clss, rating, name) {
    var groups = {};

    if (groupName) {
      if (C.internal[groupName]) {
        groups[groupName] = C.internal[groupName];
      } else {
        var grpCode = GrpNameToCodeMap[groupName];
        if (grpCode && C.internal[grpCode]) {
          groups[grpCode] = C.internal[grpCode];
        }
      }
    } else if (name) {
      groups = C.internal;
    }

    for (var g in groups) {
      var group = groups[g];
      for (var i = 0, l = group.length; i < l; i++) {
        if (group[i].class == clss && group[i].rating == rating && ((!name && !group[i].name) || group[i].name == name)) {
          return group[i];
        }
      }
    }

    return null;
  };

  /**
   * Finds an internal Component ID based on Class, Rating, Group and/or name.
   * At least one ofGroup name or unique component name must be provided
   *
   * @param  {string} groupName [Optional] Full name or abbreviated name for component group
   * @param  {integer} clss     Component Class
   * @param  {string} rating    Component Rating
   * @param  {string} name      [Optional] Long/unique name for component -e.g. 'Advanced Discover Scanner'
   * @return {String}           The id of the component if found, null if not found
   */
  this.findInternalId = function(groupName, clss, rating, name) {
    var i = this.findInternal(groupName, clss, rating, name);
    return i ? i.id : 0;
  };

  /**
   * Finds a hardpoint Component based on Class, Rating, Group and/or name.
   * At least one ofGroup name or unique component name must be provided
   *
   * @param  {string} groupName [Optional] Full name or abbreviated name for component group
   * @param  {integer} clss     Component Class
   * @param  {string} rating    [Optional] Component Rating
   * @param  {string} name      [Optional] Long/unique name for component -e.g. 'Heat Sink Launcher'
   * @param  {string} mode      Mount mode/type - [F]ixed, [G]imballed, [T]urret
   * @param  {string} missile   [Optional] Missile type - [D]umbfire, [S]eeker
   * @return {String}           The id of the component if found, null if not found
   */
  this.findHardpoint = function(groupName, clss, rating, name, mode, missile) {
    var groups = {};

    if (groupName) {
      if (C.hardpoints[groupName]) {
        groups[groupName] = C.hardpoints[groupName];
      } else {
        var grpCode = GrpNameToCodeMap[groupName];
        if (grpCode && C.hardpoints[grpCode]) {
          groups[grpCode] = C.hardpoints[grpCode];
        }
      }
    } else if (name) {
      groups = C.hardpoints;
    }

    for (var g in groups) {
      var group = groups[g];
      for (var i = 0, l = group.length; i < l; i++) {
        if (group[i].class == clss && (!rating || group[i].rating == rating) && group[i].mode == mode
            && ((!name && !group[i].name) || group[i].name == name)
            && ((!missile && !group[i].missile) || group[i].missile == missile)
            ) {
          return group[i];
        }
      }
    }

    return null;
  };

  /**
   * Finds a hardpoint Component ID based on Class, Rating, Group and/or name.
   * At least one of Group name or unique component name must be provided
   *
   * @param  {string} groupName [Optional] Full name or abbreviated name for component group
   * @param  {integer} clss     Component Class
   * @param  {string} rating    Component Rating
   * @param  {string} name      [Optional] Long/unique name for component -e.g. 'Heat Sink Launcher'
   * @param  {string} mode      Mount mode/type - [F]ixed, [G]imballed, [T]urret
   * @param  {string} missile   [Optional] Missile type - [D]umbfire, [S]eeker
   * @return {String}           The id of the component if found, null if not found
   */
  this.findHardpointId = function(groupName, clss, rating, name, mode, missile) {
    var h = this.findHardpoint(groupName, clss, rating, name, mode, missile);
    return h ? h.id : 0;
  };

  /**
   * Looks up the bulkhead component for a specific ship and bulkhead
   * @param  {string} shipId       Unique ship Id/Key
   * @param  {number} bulkheadsId  Id/Index for the specified bulkhead
   * @return {object}             The bulkhead component object
   */
  this.bulkheads = function(shipId, bulkheadsId) {
    return C.bulkheads[shipId][bulkheadsId];
  };

  this.bulkheadIndex = function(bulkheadName) {
    return ['Lightweight Alloy', 'Reinforced Alloy', 'Military Grade Composite', 'Mirrored Surface Composite', 'Reactive Surface Composite'].indexOf(bulkheadName);
  };

  /**
   * Creates a new ComponentSet that contains all available components
   * that the specified ship is eligible to use.
   *
   * @param  {string} shipId    Unique ship Id/Key
   * @return {ComponentSet}     The set of components the ship can install
   */
  this.forShip = function(shipId) {
    var ship = Ships[shipId];
    var maxInternal = isNaN(ship.slots.internal[0]) ? ship.slots.internal[0].class : ship.slots.internal[0];
    return new ComponentSet(C, ship.minMassFilter || ship.properties.hullMass + 5, ship.slots.standard, maxInternal, ship.slots.hardpoints[0]);
  };

}]);
