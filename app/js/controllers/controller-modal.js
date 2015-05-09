angular.module('app').controller('ModalController', ['$rootScope','$scope', '$state', function ($rootScope, $scope, $state) {
  var dismissListener;
  $scope.dismiss = function() {
    if ($rootScope.prevState) {
      var state = $rootScope.prevState;
      $state.go(state.name, state.params, {location: 'replace', reload: false});
    } else {
      $state.go('shipyard');
    }
  }

  $scope.$on('close', $scope.dismiss);

}]);