angular.module('app').controller('ImportController', ['$scope', '$stateParams', 'ShipsDB', 'Ship', 'Persist', 'Serializer', function ($scope, $stateParams, Ships, Ship, Persist, Serializer) {
  $scope.jsonValid = false;
  $scope.importData = null;
  $scope.errorMsg = null;
  $scope.canEdit = true;
  $scope.builds = $stateParams.obj || null;
  $scope.ships = Ships;

  $scope.validateJson = function() {
    var importObj = null;
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

    if(typeof importObj != 'object') {
      $scope.errorMsg = 'Must be an object!';
      return;
    }

    if ((!importObj.builds || !Object.keys(importObj.builds).length)) {
      $scope.errorMsg = 'No builds in data';
      return;
    }

    for (var shipId in importObj.builds) {
      var shipData = Ships[shipId];
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
        $scope.errorMsg = '"' + shipId + '" is not a valid Ship Id!';
        return;
      }
      $scope.builds = importObj.builds;
    }

    $scope.jsonValid = true;
  };

  $scope.hasBuild = function (shipId, name) {
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