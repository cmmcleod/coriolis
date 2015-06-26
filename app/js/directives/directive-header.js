angular.module('app').directive('shipyardHeader', ['lodash', '$rootScope', 'Persist', 'ShipsDB', function(_, $rootScope, Persist, ships) {

  return {
    restrict: 'E',
    templateUrl: 'views/_header.html',
    scope: true,
    link: function(scope) {
      scope.openedMenu = null;
      scope.ships = ships;
      scope.allBuilds = Persist.builds;
      scope.buildsList = Object.keys(scope.allBuilds).sort();
      scope.allComparisons = Persist.comparisons;
      scope.bs = Persist.state;

      var insIndex = _.findIndex($rootScope.insurance.opts, 'name', Persist.getInsurance());
      var savedDiscounts = Persist.getDiscount() || [1, 1];
      $rootScope.insurance.current = $rootScope.insurance.opts[insIndex != -1 ? insIndex : 0];
      $rootScope.discounts.ship = savedDiscounts[0];
      $rootScope.discounts.components = savedDiscounts[1];

      // Close menus if a navigation change event occurs
      $rootScope.$on('$stateChangeStart', function() {
        scope.openedMenu = null;
      });

      // Listen to close event to close opened menus or modals
      $rootScope.$on('close', function() {
        scope.openedMenu = null;
        $rootScope.showAbout = false;
      });

      /**
       * Save selected insurance option
       */
      scope.updateInsurance = function() {
        Persist.setInsurance($rootScope.insurance.current.name);
      };

      /**
       * Save selected discount option
       */
      scope.updateDiscount = function() {
        Persist.setDiscount([$rootScope.discounts.ship, $rootScope.discounts.components]);
        $rootScope.$broadcast('discountChange');
      };

      scope.openMenu = function(e, menu) {
        e.stopPropagation();
        if (menu == scope.openedMenu) {
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

      $rootScope.hideAbout = function() {
        $rootScope.showAbout = false;
      };

      scope.$watchCollection('allBuilds', function() {
        scope.buildsList = Object.keys(scope.allBuilds).sort();
      });
    }
  };
}]);
