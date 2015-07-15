angular.module('app').controller('ImportController', ['$scope', '$stateParams', 'ShipsDB', 'Ship', 'Persist', 'Serializer', function($scope, $stateParams, Ships, Ship, Persist, Serializer) {
  $scope.jsonValid = false;
  $scope.importData = null;
  $scope.errorMsg = null;
  $scope.canEdit = true;
  $scope.builds = $stateParams.obj || null;
  $scope.ships = Ships;

  $scope.validateJson = function() {
    var importObj = null, shipData = null;
    $scope.jsonValid = false;
    $scope.errorMsg = null;
    $scope.builds = null;

    if (!$scope.importData) { return; }

    try {
      importObj = angular.fromJson($scope.importData);
    } catch (e) {
      $scope.errorMsg = 'Cannot Parse JSON!';
      return;
    }

    if (typeof importObj != 'object') {
      $scope.errorMsg = 'Must be an object or array!';
      return;
    }

    // Using JSON from a simple/shortform/standard export
    if (importObj.builds && Object.keys(importObj.builds).length) {
      for (var shipId in importObj.builds) {
        shipData = Ships[shipId];
        if (shipData) {
          for (var buildName in importObj.builds[shipId]) {
            if (typeof importObj.builds[shipId][buildName] != 'string') {
              $scope.errorMsg = shipData.properties.name + ' build "' + buildName + '" must be a string!';
              return;
            }
            try {
              // Actually build the ship with the code to ensure it's valid
              Serializer.toShip(new Ship(shipId, shipData.properties, shipData.slots), importObj.builds[shipId][buildName]);
            } catch (e) {
              $scope.errorMsg = shipData.properties.name + ' build "' + buildName + '" is not valid!';
              return;
            }
          }
        } else {
          $scope.errorMsg = '"' + shipId + '"" is not a valid Ship Id!';
          return;
        }
        $scope.builds = importObj.builds;
      }

    // Using JSON from a detailed export
    } else if (importObj.length && importObj[0].references && importObj[0].references.length) {
      var builds = {};
      for (var i = 0, l = importObj.length; i < l; i++) {
        if (typeof importObj[i].name != 'string' || typeof importObj[i].ship != 'string') {
          $scope.errorMsg = 'Build [' + i + '] must have a ship and build name!';
          return;
        }
        for (var r = 0, rl = importObj[i].references.length; r < rl; r++) {
          var ref = importObj[i].references[r];
          if (ref.name == 'Coriolis.io' && ref.code && ref.shipId) {
            if (!builds[ref.shipId]) {
              builds[ref.shipId] = {};
            }
            try {
              // Actually build the ship with the code to ensure it's valid
              shipData = Ships[ref.shipId];
              Serializer.toShip(new Ship(ref.shipId, shipData.properties, shipData.slots), ref.code);
            } catch (e) {
              $scope.errorMsg = importObj[i].ship + ' build "' + importObj[i].name + '" is not valid!';
              return;
            }
            builds[ref.shipId][importObj[i].name] = ref.code;
          } else {
            $scope.errorMsg = importObj[i].ship + ' build "' + importObj[i].name + '" has an invalid Coriolis reference!';
            return;
          }
        }
      }
      $scope.builds = builds;
    } else {
      $scope.errorMsg = 'No builds in data';
      return;
    }

    $scope.jsonValid = true;
  };

  $scope.hasBuild = function(shipId, name) {
    return Persist.getBuild(shipId, name) !== null;
  };

  $scope.process = function() {
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
    $scope.processed = true;
  };

  $scope.import = function() {
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
    $scope.$parent.dismiss();
  };

  /* Initialization */

  if ($scope.builds) {  // If import is passed an build object
    $scope.canEdit = false;
    $scope.process();
  }


}]);
