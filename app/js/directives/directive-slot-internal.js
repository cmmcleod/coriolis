angular.module('app').directive('slotInternal', ['$rootScope', function ($r) {
  return {
    restrict: 'A',
    scope:{
      c: '=slot',
      lbl: '=',
      opts: '='
    },
    templateUrl: 'views/_slot-internal.html',
    link: function(scope) {
      scope.$r = $r;
    }
 };
}]);