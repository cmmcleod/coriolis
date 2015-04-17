angular.module('app')
  .directive('powerList', ['$rootScope', function ($r) {
    return {
      restrict: 'A',
      scope: {
        ship: '=ship'
      },
      templateUrl: 'views/power.html',
      link: function (scope) {
        scope.$r = $r;

        scope.toggle = function(slot) {
          slot.enabled = !slot.enabled;
          scope.ship.updateTotals();
        };
      }
    };
  }]);