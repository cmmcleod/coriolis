angular.module('app').directive('shipyardHeader', ['lodash','$window','$rootScope', 'Persist', 'ShipsDB', function (_, $window, $rootScope, Persist, ships) {

  return {
    restrict: 'E',
    templateUrl: 'views/_header.html',
    scope: true,
    link: function (scope) {
      scope.openedMenu = null;
      scope.ships = ships;
      scope.allBuilds = Persist.builds;
      scope.allComparisons = Persist.comparisons;
      scope.bs = Persist.state;

      // Insurance options and management here for now.
      $rootScope.insurance = {
        opts: [
          { name:'Standard', pct: 0.05 },
          { name:'Alpha', pct: 0.025 },
          { name:'Beta', pct: 0.035 }
        ]
      };

      var insIndex = _.findIndex($rootScope.insurance.opts, 'name', $window.localStorage.getItem('insurance'));
      $rootScope.insurance.current = $rootScope.insurance.opts[insIndex != -1? insIndex : 0];

      // Close menus if a navigation change event occurs
      $rootScope.$on('$stateChangeStart',function(){
        scope.openedMenu = null;
      });

      $rootScope.$on('close', function () {
        scope.openedMenu = null;
        $rootScope.showAbout = false;
      });

      scope.updateInsurance = function(){
        $window.localStorage.setItem('insurance', $rootScope.insurance.current.name);
      };

      scope.openMenu = function (e, menu) {
        e.stopPropagation();
        if(menu == scope.openedMenu) {
          scope.openedMenu = null;
          return;
        }

        if ((menu == 'comp' || menu == 'b') && !scope.bs.hasBuilds) {
          scope.openedMenu = null;
          return;
        }
        scope.openedMenu = menu;
      };

      scope.about = function(e) {
        e.preventDefault();
        e.stopPropagation();
        scope.openedMenu = null;
        $rootScope.showAbout = true;
      };

      $rootScope.hideAbout = function (){
        $rootScope.showAbout = false;
      };
    }
  };
}]);