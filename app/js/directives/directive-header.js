angular.module('app').directive('shipyardHeader', ['lodash', '$window', '$rootScope', '$state', 'Persist', 'Serializer', 'ShipsDB', function(_, $window, $rootScope, $state, Persist, Serializer, ships) {


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

      var win = angular.element($window);   // Angularized window object for event triggering
      var insIndex = _.findIndex($rootScope.insurance.opts, 'name', Persist.getInsurance());
      var savedDiscounts = Persist.getDiscount() || [1, 1];
      $rootScope.insurance.current = $rootScope.insurance.opts[insIndex != -1 ? insIndex : 0];
      $rootScope.discounts.ship = savedDiscounts[0];
      $rootScope.discounts.components = savedDiscounts[1];

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

      scope.backup = function(e) {
        e.preventDefault();
        e.stopPropagation();
        scope.openedMenu = null;
        $state.go('modal.export', {
          title: 'backup',
          data: Persist.getAll(),
          description: 'PHRASE_BACKUP_DESC'
        });
      };

      scope.detailedExport = function(e) {
        e.preventDefault();
        e.stopPropagation();
        scope.openedMenu = null;
        $state.go('modal.export', {
          title: 'detailed export',
          data: Serializer.toDetailedExport(scope.allBuilds),
          description: 'PHRASE_EXPORT_DESC'
        });
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

      // Close menus if a navigation change event occurs
      $rootScope.$on('$stateChangeStart', function() {
        scope.openedMenu = null;
      });

      // Listen to close event to close opened menus or modals
      $rootScope.$on('close', function() {
        scope.openedMenu = null;
      });

      scope.textSizeChange = function(size) {
        $rootScope.sizeRatio = size;
        document.getElementById('main').style.fontSize = size + 'em';
        Persist.setSizeRatio(size);
        win.triggerHandler('resize');
      };

      scope.$watchCollection('allBuilds', function() {
        scope.buildsList = Object.keys(scope.allBuilds).sort();
      });
    }
  };
}]);
