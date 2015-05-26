angular.module('app').controller('LinkController', ['$scope', 'Utils', '$stateParams', function ($scope, Utils, $stateParams) {
  $scope.url = $stateParams.url;
  $scope.shortenedUrl = 'Shortening...';

  $scope.onTextClick = function ($event) {
    $event.target.select();
  };

  Utils.shortenUrl($scope.url)
    .then(function(url) {
      $scope.shortenedUrl = url;
    },function(e) {
      $scope.shortenedUrl = 'Error - ' + e.statusText;
    });

}]);