angular.module('app').directive('shipyardMenu', ['$rootScope', 'lodash', function ($rootScope, _) {

  return {
    restrict: 'E',
    templateUrl: 'views/menu.html',
    link: function (scope, element, attributes) {

      // TODO: Saved Ships: load, save, save as, delete, export
      // TODO: Links: github, forum, etc

    }
  };
}]);