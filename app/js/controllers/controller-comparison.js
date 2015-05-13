angular.module('app').controller('ComparisonController', ['$rootScope', '$filter', '$scope', 'ShipFacets', 'ShipsDB', 'Ship', 'Persist', 'Serializer', function ($rootScope, $filter, $scope, ShipFacets, Ships, Ship, Persist, Serializer) {
  $rootScope.title = 'Coriolis - Comparison';
  $rootScope.bodyClass = null;
  $scope.facets = ShipFacets;
  $scope.subFacets = [];

  for (var i = 0, l = $scope.facets.length; i < l; i++) {
    var facet = $scope.facets[i];
    if(facet.prop) {
      $scope.subFacets.push({
          prop: facet.prop,
          fmt: $rootScope[facet.fmt],
          unit: facet.unit
        });
    } else {
      for (var j = 0, pl = facet.props.length; j < pl; j++) {
        $scope.subFacets.push({
          sub: true,
          start: j == 0,
          prop: facet.props[j],
          label: facet.lbls[j],
          fmt: $rootScope[facet.fmt],
          unit: facet.unit
        });
      }
    }
  }

  var comparison = $scope.comparison = [];
  var orderBy = $filter('orderBy');
  var buildCount = 0;

  for (var shipId in Persist.builds) {
    var data = Ships[shipId];
    for (var buildName in Persist.builds[shipId]) {
      var code = Persist.builds[shipId][buildName];
      var b = new Ship(shipId, data.properties, data.slots); // Create a new Ship instance
      Serializer.toShip(b, code);  // Populate components from 'code' URL param
      // Extend ship instance and add properties below
      b.buildName = buildName;
      b.code = code;
      b.pctRetracted = b.powerRetracted / b.powerAvailable;
      b.pctDeployed = b.powerDeployed / b.powerAvailable;
      comparison.push(b); // Add ship build to comparison
    }
  }

  $scope.chartHeight = 45 + (25 * comparison.length);
  $scope.predicate = 'ship.name';
  $scope.desc = true;

  $scope.sortProperty = function (e) {
    var prop = angular.element(e.target).attr('prop');  // Get component ID
    if(prop) {
      $scope.sort(prop);
    }
  };

  $scope.sort = function (key) {
    $scope.desc =  ($scope.predicate == key)? !$scope.desc : $scope.desc;
    $scope.predicate = key;
    $scope.comparison = orderBy($scope.comparison, $scope.predicate, $scope.desc);
  };

  $scope.sort('name');
}]);