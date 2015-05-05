angular.module('app', ['ui.router', 'shipyard', 'ngLodash', 'app.templates'])
.run(['$rootScope','$document','$state','commonArray','shipPurpose','shipSize','hardPointClass','internalGroupMap','hardpointsGroupMap', function ($rootScope, $doc, $state, CArr, shipPurpose, sz, hpc, igMap, hgMap) {
  // Redirect any state transition errors to the error controller/state
  $rootScope.$on('$stateChangeError', function(e, toState, toParams, fromState, fromParams, error){
    e.preventDefault();
    $state.go('error', error, {location:false, reload:true});  // Go to error state, reload the controller, keep the current URL
  });

  // Global Reference variables
  $rootScope.CArr = CArr;
  $rootScope.SP = shipPurpose;
  $rootScope.SZ = sz;
  $rootScope.HPC = hpc;
  $rootScope.igMap = igMap;
  $rootScope.hgMap = hgMap;
  $rootScope.title = 'Coriolis';

  // Formatters
  $rootScope.fCrd = d3.format(',.0f');
  $rootScope.fPwr = d3.format(',.2f');
  $rootScope.fRound = function(d) { return d3.round(d, 2) };
  $rootScope.fPct = d3.format('.2%');
  $rootScope.fRPct = d3.format('%');
  $rootScope.fTime = function(d) { return Math.floor(d/60) + ":" + ("00" + (d%60)).substr(-2,2); };

  // Global Event Listeners
  $doc.bind('keyup', function (e) {
    if(e.keyCode == 27) { // Escape Key
      $rootScope.$broadcast('close', e);
      $rootScope.$apply();
    } else {
      $rootScope.$broadcast('keyup', e);
    }
  });

  $rootScope.bgClicked = function (e) {
    $rootScope.$broadcast('close', e);
  }

}]);
