angular.module('app').controller('ExportController', ['$scope', 'Persist', function ($scope, Persist) {
  $scope.builds = {
    builds: Persist.builds
    // TODO: add comparisons
  };

}]);