angular.module('app').controller('ComparisonController', ['$rootScope', '$scope', 'ShipsDB', 'Ship', 'Persist', 'Serializer', function ($rootScope, $scope, Ships, Ship, Persist, Serializer) {
  $rootScope.title = 'Coriolis - Comparison';
  $rootScope.bodyClass = 'docking-bay';

  var comparison = $scope.comparison = [];

  for (var shipId in Persist.builds) {
    var data = Ships[shipId];
    for (var buildName in Persist.builds[shipId]) {
      var code = Persist.builds[shipId][buildName];
      var ship = new Ship(shipId, data.properties, data.slots); // Create a new Ship instance
      Serializer.toShip(ship, code);  // Populate components from 'code' URL param

      comparison.push({
        shipId: shipId,
        buildName: buildName,
        ship: ship,
        code: code
      });
    }
  }


}]);