angular.module('app')
.controller('ErrorController', ['$rootScope','$scope','$stateParams', '$location', function ($rootScope, $scope, $p, $location) {
  $rootScope.title = 'Error';
  $scope.path = $location.path();
  $scope.type = $p.type || 'unknown';

  switch ($scope.type) {
    case 404:
        $scope.msgPre = 'Page';
        $scope.msgHighlight = $scope.path;
        $scope.msgPost = 'Not Found';
        $scope.image = 'deep-space';
      break;
    case 'no-ship':
        $scope.msgPre = 'Ship';
        $scope.msgHighlight = $p.message;
        $scope.msgPost = 'does not exist';
        $scope.image = 'thargoid';
      break;
    case 'build-fail':
        $scope.msgPre = 'Build Failure!';
        $scope.image = 'ship-explode';
      break;
    default:
      $scope.msgPre = "Uh, this is bad..";
      $scope.image = 'thargoid';
  }

}]);