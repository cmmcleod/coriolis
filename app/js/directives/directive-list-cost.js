angular.module('app').directive('costList', ['$rootScope', function ($r) {
  return {
    restrict: 'A',
    scope: {
      ship: '='
    },
    templateUrl: 'views/costs.html',
    link: function (scope) {
      scope.$r = $r;
      scope.insuranceOptions = {
        Alpha: 0.975,
        Beta: 0.965,
        Standard: 0.95
      };
      scope.insurance = scope.insuranceOptions.Standard;

      scope.toggle = function(item) {
        item.incCost = !item.incCost;
        scope.ship.updateTotals();
      };
    }
  };
}]);