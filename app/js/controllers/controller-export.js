angular.module('app').controller('ExportController', ['$scope', '$stateParams', function($scope, $stateParams) {

  $scope.title = $stateParams.title || 'Export';
  $scope.description = $stateParams.description;

  if ($stateParams.promise) {
    $scope.export = 'Generating...';
    $stateParams.promise.then(function(data) {
      $scope.export = (typeof data === 'object') ? angular.toJson(data, true) : data;
    });
  } else {
    $scope.export = angular.toJson($stateParams.data, true);
  }

  $scope.onTextClick = function($event) {
    $event.target.select();
  };

}]);
