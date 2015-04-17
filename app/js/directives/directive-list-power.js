angular.module('app')
  .directive('powerList', ['$rootScope', 'lodash', function ($r, _) {
    return {
      restrict: 'A',
      scope: {
        ship: '=ship'
      },
      templateUrl: 'views/power.html',
      link: function (scope, element, attributes) {
        scope.$r = $r;

        scope.toggle = function(slot) {
          slot.enabled = !slot.enabled;
          scope.ship.updateTotals();
        }
      }
    };
  }]);