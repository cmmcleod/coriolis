angular.module('app').directive('slotDetails', ['$rootScope', function ($r) {
  return {
    restrict: 'A',
    scope:{
      c: '=',
      lbl: '=',
      opts: '='
    },
    templateUrl: 'views/slot.html',
    link: function(scope) {
      scope.$r = $r;
    }
 };
}]);