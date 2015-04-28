angular.module('app')
  .directive('powerList', ['$rootScope', function ($r) {
    return {
      restrict: 'A',
      scope: {
        ship: '=ship'
      },
      templateUrl: 'views/power.html',
      link: function (scope) {
        scope.expanded = false;
        scope.$r = $r;

        scope.toggleExpand = function() {
          scope.expanded = !scope.expanded;
        }

        scope.toggle = function(slot) {
          slot.enabled = !slot.enabled;
          scope.ship.updateTotals();
        };
      }
    };
  }]);