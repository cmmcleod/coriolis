angular.module('app').directive('shipyardHeader', ['$rootScope', 'Persist', function ($rootScope, Persist) {

  return {
    restrict: 'E',
    templateUrl: 'views/_header.html',
    scope: true,
    link: function (scope) {
      scope.openedMenu = null;
      scope.ships = DB.ships;
      scope.allBuilds = Persist.builds;
      scope.bs = Persist.state;
      console.log(scope);

      $rootScope.$on('$stateChangeStart',function(){
        scope.openedMenu = null;
      });

      $rootScope.$on('close', function (e, keyEvent) {
        scope.openedMenu = null;
      });

      scope.openMenu = function (menu) {
        if(menu == scope.openedMenu) {
          scope.openedMenu = null;
          return;
        }

        if (menu == 'b' && !scope.bs.hasBuilds) {
          scope.openedMenu = null;
          return;
        }
        scope.openedMenu = menu;
      };

    }
  };
}]);