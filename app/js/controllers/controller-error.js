angular.module('app')
.controller('ErrorController', ['$rootScope','$scope','$stateParams', '$location', function ($rootScope, $scope, $p, $location) {
  $rootScope.title = 'Error';

  if ($p.path) {  // If path is specified, 404
    $scope.type = 404;        // Deep Space Image...
    $scope.message = ""
    $scope.path = $p.path;
  } else {
    $scope.type = $p.type || 'unknown';
    $scope.message = $p.message || "Uh, this is bad..";
    $scope.path = $location.path();
  }

}]);