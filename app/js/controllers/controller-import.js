angular.module('app').controller('ImportController', ['lodash', '$rootScope', '$scope', '$stateParams', 'ShipsDB', 'Ship', 'Persist', 'Serializer', function(_, $rootScope, $scope, $stateParams, Ships, Ship, Persist, Serializer) {
  $scope.jsonValid = false;
  $scope.importJSON = null;
  $scope.errorMsg = null;
  $scope.canEdit = true;
  $scope.builds = $stateParams.obj || null;
  $scope.ships = Ships;

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

  $scope.validateJson = function() {
    var importData = null;
    $scope.jsonValid = false;
    $scope.errorMsg = null;
    $scope.builds = $scope.discounts = $scope.comparisons = $scope.insurance = null;

    if (!$scope.importJSON) { return; }

    try {
      importData = angular.fromJson($scope.importJSON);
    } catch (e) {
      $scope.errorMsg = 'Cannot Parse JSON!';
      return;
    }

    if (!importData || typeof importData != 'object') {
      $scope.errorMsg = 'Must be an object or array!';
      return;
    }

    try {
      if (importData instanceof Array) {   // Must be detailed export json
        importDetailedArray(importData);
      } else if (importData.ship && importData.name) { // Using JSON from a single ship build export
        importDetailedArray([importData]); // Convert to array with singleobject
      } else { // Using Backup JSON
        importBackup(importData);
      }
    } catch (e) {
      $scope.errorMsg = e;
      return;
    }

    $scope.jsonValid = true;
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
