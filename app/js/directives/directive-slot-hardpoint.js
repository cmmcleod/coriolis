angular.module('app').directive('slotHardpoint', ['$rootScope', function($r) {
  return {
    restrict: 'A',
    scope: {
      hp: '=',
      size: '='
    },
    templateUrl: 'views/_slot-hardpoint.html',
    link: function(scope) {
      scope.$r = $r;
    }
 };
}]);
