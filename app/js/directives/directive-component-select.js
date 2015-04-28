angular.module('app').directive('componentSelect', [ function() {
  return {
    restrict: 'A',
    scope:{
      opts: '=',                  // Component Options object
      slot: '=',                  // Slot Object
      selectComponent: '&sc'      // Select Component function
    },
    templateUrl: 'views/component_select.html',
    link: function (scope) {
      scope.use = function(id, component) {
        scope.selectComponent({s: scope.slot, id: id, c: component});
      };
    }
  };
}]);