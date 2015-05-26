angular.module('app').controller('DeleteController', ['$scope', 'Persist', function ($scope, Persist) {
  $scope.deleteAll = function () {
    Persist.deleteAll();
    $scope.$parent.dismiss();
  };

}]);