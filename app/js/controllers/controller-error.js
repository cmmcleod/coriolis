angular.module('app')
.controller('ErrorController', ['$window','$rootScope','$scope','$stateParams', '$location', function ($window, $rootScope, $scope, $p, $location) {
  $rootScope.title = 'Error';
  $scope.path = $location.path();
  $scope.type = $p.type || 'unknown';
  $scope.browser = $window.navigator.appVersion;

  switch ($scope.type) {
    case 404:
        $scope.msgPre = 'Page';
        $scope.msgHighlight = $scope.path;
        $scope.msgPost = 'Not Found';
        $rootScope.bodyClass = 'deep-space';
      break;
    case 'no-ship':
        $scope.msgPre = 'Ship';
        $scope.msgHighlight = $p.message;
        $scope.msgPost = 'does not exist';
        $rootScope.bodyClass = 'docking-bay';
      break;
    case 'build-fail':
        $scope.msgPre = 'Build Failure!';
        $scope.image = 'ship-explode';
        $rootScope.bodyClass = 'docking-bay';
      break;
    default:
      $scope.msgPre = "Uh, this is bad..";
      $scope.image = 'thargoid';
      $rootScope.bodyClass = null;
  }

}]);