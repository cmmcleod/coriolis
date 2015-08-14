angular.module('app').controller('ImportController', ['lodash', '$rootScope', '$scope', '$stateParams', 'ShipsDB', 'Ship', 'Components', 'GroupMap', 'Persist', 'Serializer', function(_, $rootScope, $scope, $stateParams, Ships, Ship, Components, GroupMap, Persist, Serializer) {
  $scope.importValid = false;
  $scope.importString = null;
  $scope.errorMsg = null;
  $scope.canEdit = true;
  $scope.builds = $stateParams.obj || null;
  $scope.ships = Ships;

  var textBuildRegex = new RegExp('^\\[([\\w \\-]+)\\]\n');
  var lineRegex = new RegExp('^([\\dA-Z]{1,2}): (\\d)([A-I])[/]?([FGT])?([SD])? ([\\w\\- ]+)');
  var mountMap = { 'H': 4, 'L': 3, 'M': 2, 'S': 1, 'U': 0 };
  var commonMap = { 'RB': 0, 'TM': 1, 'FH': 2, 'EC': 3, 'PC': 4, 'SS': 5, 'FS': 6 };
  var bhMap = { 'lightweight alloy': 0, 'reinforced alloy': 1, 'military grade composite': 2, 'mirrored surface composite': 3, 'reactive surface composite': 4 };

  function isEmptySlot(slot) {
    return slot.maxClass == this && slot.c === null;
  }

  function equalsIgnoreCase(str) {
    return str.toLowerCase() == this.toLowerCase();
  }

  function validateBuild(shipId, code, name) {
    var shipData = Ships[shipId];

    if (!shipData) {
      throw '"' + shipId + '" is not a valid Ship Id!';
    }
    if (typeof name != 'string' || name.length < 3) {
      throw shipData.properties.name + ' build "' + name + '" must be a string at least 3 characters long!';
    }
    if (typeof code != 'string' || code.length < 10) {
      throw shipData.properties.name + ' build "' + name + '" is not valid!';
    }
    try {
      Serializer.toShip(new Ship(shipId, shipData.properties, shipData.slots), code);
    } catch (e) {
      throw shipData.properties.name + ' build "' + name + '" is not valid!';
    }
  }

  function detailedJsonToBuild(detailedBuild) {
    var ship;
    if (!detailedBuild.name) {
      throw 'Build Name missing!';
    }

    try {
      ship = Serializer.fromDetailedBuild(detailedBuild);
    } catch (e) {
      throw detailedBuild.ship + ' Build "' + detailedBuild.name + '": Invalid data';
    }

    return { shipId: ship.id, name: detailedBuild.name, code: Serializer.fromShip(ship) };
  }

  function importBackup(importData) {
    if (importData.builds && typeof importData.builds == 'object') {
      for (var shipId in importData.builds) {
        for (var buildName in importData.builds[shipId]) {
          validateBuild(shipId, importData.builds[shipId][buildName], buildName);
        }
      }
      $scope.builds = importData.builds;
    } else {
      throw 'builds must be an object!';
    }
    if (importData.comparisons) {
      for (var compName in importData.comparisons) {
        var comparison = importData.comparisons[compName];
        for (var i = 0, l = comparison.builds.length; i < l; i++) {
          var build = comparison.builds[i];
          if (!importData.builds[build.shipId] || !importData.builds[build.shipId][build.buildName]) {
            throw build.shipId + ' build "' + build.buildName + '" data is missing!';
          }
        }
      }
      $scope.comparisons = importData.comparisons;
    }
    if (importData.discounts instanceof Array && importData.discounts.length == 2) {
      $scope.discounts = importData.discounts;
    }
    if (typeof importData.insurance == 'string' && importData.insurance.length > 3) {
      $scope.insurance = importData.insurance;
    }
  }

  function importDetailedArray(importArr) {
    var builds = {};
    for (var i = 0, l = importArr.length; i < l; i++) {
      var build = detailedJsonToBuild(importArr[i]);
      if (!builds[build.shipId]) {
        builds[build.shipId] = {};
      }
      builds[build.shipId][build.name] = build.code;
    }
    $scope.builds = builds;
  }

  function importTextBuild(buildStr) {
    var buildName = textBuildRegex.exec(buildStr)[1].trim();
    var shipName = buildName.toLowerCase();
    var shipId = null;

    for (var sId in Ships) {
      if (Ships[sId].properties.name.toLowerCase() == shipName) {
        shipId = sId;
        break;
      }
    }

    if (!shipId) { throw 'No such ship found: "' + buildName + '"'; }

    var lines = buildStr.split('\n');
    var ship = new Ship(shipId, Ships[shipId].properties, Ships[shipId].slots);
    ship.buildWith(null);

    for (var i = 1; i < lines.length; i++) {
      var line = lines[i].trim();

      if (!line) { continue; }
      if (line.substring(0, 3) == '---') { break; }

      var parts = lineRegex.exec(line);

      if (!parts) { throw 'Error parsing: "' + line + '"'; }

      var typeSize = parts[1];
      var cl = parts[2];
      var rating = parts[3];
      var mount = parts[4];
      var missile = parts[5];
      var name = parts[6].trim();
      var slot, group;

      if (isNaN(typeSize)) {  // Common or Hardpoint
        if (typeSize.length == 1) { // Hardpoint
          var slotClass = mountMap[typeSize];

          if (cl > slotClass) { throw cl + rating + ' ' + name + ' exceeds slot size: "' + line + '"'; }

          slot = _.find(ship.hardpoints, isEmptySlot, slotClass);

          if (!slot) { throw 'No hardpoint slot available for: "' + line + '"'; }

          group = _.find(GroupMap, equalsIgnoreCase, name);

          var hpid = Components.findHardpointId(group, cl, rating, group ? null : name, mount, missile);

          if (!hpid) { throw 'Unknown component: "' + line + '"'; }

          ship.use(slot, hpid, Components.hardpoints(hpid), true);

        } else if (typeSize == 'BH') {
          var bhId = bhMap[name.toLowerCase()];

          if (bhId === undefined) { throw 'Unknown bulkhead: "' + line + '"'; }

          ship.useBulkhead(bhId, true);

        } else if (commonMap[typeSize] != undefined) {
          var commonIndex = commonMap[typeSize];

          if (ship.common[commonIndex].maxClass < cl) { throw name + ' exceeds max class for the ' + ship.name; }

          ship.use(ship.common[commonIndex], cl + rating, Components.common(commonIndex, cl + rating), true);

        } else {
          throw 'Unknown component: "' + line + '"';
        }
      } else {
        if (cl > typeSize) { throw cl + rating + ' ' + name + ' exceeds slot size: "' + line + '"'; }

        slot = _.find(ship.internal, isEmptySlot, typeSize);

        if (!slot) { throw 'No internal slot available for: "' + line + '"'; }

        group = _.find(GroupMap, equalsIgnoreCase, name);

        var intId = Components.findInternalId(group, cl, rating, group ? null : name);

        if (!intId) { throw 'Unknown component: "' + line + '"'; }

        ship.use(slot, intId, Components.internal(intId));
      }
    }

    var builds = {};
    builds[shipId] = {};
    builds[shipId]['Imported ' + buildName] = Serializer.fromShip(ship);
    $scope.builds = builds;
  }

  $scope.validateImport = function() {
    var importData = null;
    var importString = $scope.importString.trim();
    $scope.importValid = false;
    $scope.errorMsg = null;
    $scope.builds = $scope.discounts = $scope.comparisons = $scope.insurance = null;

    if (!importString) { return; }


    try {
      if (textBuildRegex.test(importString)) {  // E:D Shipyard build text
        importTextBuild(importString);
      } else {                                  // JSON Build data
        importData = angular.fromJson($scope.importString);

        if (!importData || typeof importData != 'object') {
          throw 'Must be an object or array!';
        }

        if (importData instanceof Array) {   // Must be detailed export json
          importDetailedArray(importData);
        } else if (importData.ship && importData.name) { // Using JSON from a single ship build export
          importDetailedArray([importData]); // Convert to array with singleobject
        } else { // Using Backup JSON
          importBackup(importData);
        }
      }
    } catch (e) {
      $scope.errorMsg = (typeof e == 'string') ? e : 'Cannot Parse the data!';
      return;
    }

    $scope.importValid = true;
  };

  $scope.hasBuild = function(shipId, name) {
    return Persist.getBuild(shipId, name) !== null;
  };

  $scope.hasComparison = function(name) {
    return Persist.getComparison(name) !== null;
  };

  $scope.process = function() {
    if ($scope.builds) {
      var builds = $scope.builds;
      for (var shipId in builds) {
        for (var buildName in builds[shipId]) {
          var code = builds[shipId][buildName];
          // Update builds object such that orginal name retained, but can be renamed
          builds[shipId][buildName] = {
            code: code,
            useName: buildName
          };
        }
      }
    }

    if ($scope.comparisons) {
      var comparisons = $scope.comparisons;
      for (var name in comparisons) {
        comparisons[name].useName = name;
      }
    }

    $scope.processed = true;
  };

  $scope.import = function() {

    if ($scope.builds) {
      var builds = $scope.builds;
      for (var shipId in builds) {
        for (var buildName in builds[shipId]) {
          var build = builds[shipId][buildName];
          var name = build.useName.trim();
          if (name) {
            Persist.saveBuild(shipId, name, build.code);
          }
        }
      }
    }

    if ($scope.comparisons) {
      var comparisons = $scope.comparisons;
      for (var comp in comparisons) {
        var comparison = comparisons[comp];
        var useName = comparison.useName.trim();
        if (useName) {
          Persist.saveComparison(useName, comparison.builds, comparison.facets);
        }
      }
    }

    if ($scope.discounts) {
      $rootScope.discounts.ship = $scope.discounts[0];
      $rootScope.discounts.components = $scope.discounts[1];
      $rootScope.$broadcast('discountChange');
      Persist.setDiscount($scope.discounts);
    }

    if ($scope.insurance) {
      $rootScope.insurance.current = $scope.insurance;
      Persist.setInsurance($scope.insurance);
    }

    $scope.$parent.dismiss();
  };

  /* Initialization */

  if ($scope.builds) {  // If import is passed an build object
    $scope.canEdit = false;
    $scope.process();
  }


}]);
