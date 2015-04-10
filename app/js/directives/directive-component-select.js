angular.module('app').directive('componentSelect', [ function() {
  return {
    restrict: 'A',
    scope:{
      opts: '=',
      c: '=',
      ship: '='
    },
    templateUrl: 'views/component_select.html',
    link: function (scope) {
      scope.use = function(id, componentData) {
        scope.ship.use(scope.c, id, componentData);
        // hide this shit;
      };
    }
  };
}]);