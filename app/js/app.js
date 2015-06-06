angular.module('app', ['ui.router', 'ct.ui.router.extras.sticky', 'ui.sortable', 'shipyard', 'ngLodash', 'app.templates'])
.run(['$rootScope', '$location', '$window', '$document','$state','commonArray','shipPurpose','shipSize','hardPointClass','internalGroupMap','hardpointsGroupMap', 'Persist', '$state', function ($rootScope, $location, $window, $doc, $state, CArr, shipPurpose, sz, hpc, igMap, hgMap, Persist, $state) {
  // App is running as a standalone web app on tablet/mobile
  var isStandAlone = $window.navigator.standalone || ($window.external && $window.external.msIsSiteMode && $window.external.msIsSiteMode());

  // Redirect any state transition errors to the error controller/state
  $rootScope.$on('$stateChangeError', function(e, toState, toParams, fromState, fromParams, error){
    e.preventDefault();
    $state.go('error', error, {location:false, reload:true});  // Go to error state, reload the controller, keep the current URL
  });

  // Track on Google analytics if available
  $rootScope.$on('$stateChangeSuccess', function(e, to, toParams, from, fromParams) {
    $rootScope.prevState = { name: from.name, params: fromParams };

    if (to.url) { // Only track states that have a URL

      if ($window.ga) {
        ga('send', 'pageview', {page: $location.path()});
      }

      if (isStandAlone) {
        // Persist the current state
        Persist.setState({name: to.name, params: toParams});
      }
    }
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
  $rootScope.fRound = function(d) { return d3.round(d, 2); };
  $rootScope.fRound4 = function(d) { return d3.round(d, 4); };
  $rootScope.fPct = d3.format('.2%');
  $rootScope.fRPct = d3.format('%');
  $rootScope.fTime = function(d) { return Math.floor(d/60) + ":" + ("00" + Math.floor(d%60)).substr(-2,2); };

  if (isStandAlone) {
    var state = Persist.getState();
    // If a previous state has been stored, load that state
    if (state && state.name && state.params) {
      $state.go(state.name, state.params, {location:'replace'});
    }
  }

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
  };

  if ($window.applicationCache) {
    // Listen for appcache updated event, present refresh to update view
     $window.applicationCache.addEventListener('updateready', function() {
      if ($window.applicationCache.status == $window.applicationCache.UPDATEREADY) {
        // Browser downloaded a new app cache.
        $rootScope.appCacheUpdate = true;
        $rootScope.$apply();
      }
    }, false);
  }

}]);
