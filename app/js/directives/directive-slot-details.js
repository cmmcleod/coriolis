angular.module('app').directive('slotDetails', function () {
  return {
    restrict: 'A',
    scope:{
      c: '=',
      lbl: '=',
      opts: '='
    },
    templateUrl: 'views/slot.html'
 };
});