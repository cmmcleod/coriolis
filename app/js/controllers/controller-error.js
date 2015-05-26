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
      break;
    case 'no-ship':
        $scope.msgPre = 'Ship';
        $scope.msgHighlight = $p.message;
        $scope.msgPost = 'does not exist';
      break;
    case 'build-fail':
        $scope.msgPre = 'Build Failure!';
        $scope.details = $p.details;
      break;
    default:
      $scope.msgPre = "Uh, Jameson, we have a problem..";
      $scope.errorMessage = $p.message;
      $scope.details = $p.details;
  }

}]);