angular.module('app').directive('hardpoint', ['$rootScope', function ($r) {
  return {
    restrict: 'A',
    scope:{
      hp: '=',
      size: '=',
      opts: '='
    },
    templateUrl: 'views/hardpoint.html',
    link: function (scope) {
      scope.$r = $r;
    }
 };
}]);