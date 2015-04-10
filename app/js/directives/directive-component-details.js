angular.module('app').directive('componentDetails', [function () {
  return {
    restrict: 'E',
    scope:{
      c: '=',
      lbl: '=',
      opts: '='
    },
    templateUrl: 'views/component.html'
 };
}]);