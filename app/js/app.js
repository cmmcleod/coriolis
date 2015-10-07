angular.module('app', ['ui.router', 'ct.ui.router.extras.sticky', 'ui.sortable', 'shipyard', 'ngLodash', 'app.templates', 'pascalprecht.translate'])
.run(['$rootScope', '$location', '$window', '$document', '$state', '$translate', 'localeFormat', 'Persist', 'Discounts', 'Languages', 'SizeMap',
function($rootScope, $location, $window, $doc, $state, $translate, localeFormat, Persist, Discounts, Languages, SizeMap) {
  // App is running as a standalone web app on tablet/mobile
  var isStandAlone;
  // This was causing issues on Windows phones ($window.external was causing Angular js to throw an exception). Backup is to try this and set isStandAlone to false if this fails.
  try {
    isStandAlone = $window.navigator.standalone || ($window.external && $window.external.msIsSiteMode && $window.external.msIsSiteMode());
  } catch (ex) {
    isStandAlone = false;
  }

  // Redirect any state transition errors to the error controller/state
  $rootScope.$on('$stateChangeError', function(e, toState, toParams, fromState, fromParams, error) {
    e.preventDefault();
    $state.go('error', error, { location: false, reload: true });  // Go to error state, reload the controller, keep the current URL
  });

  // Track on Google analytics if available
  $rootScope.$on('$stateChangeSuccess', function(e, to, toParams, from, fromParams) {
    $rootScope.prevState = { name: from.name, params: fromParams };

    if (to.url) { // Only track states that have a URL
      if ($window.ga) {
        ga('send', 'pageview', { page: $location.path() });
      }

      if (isStandAlone) {
        // Persist the current state
        Persist.setState({ name: to.name, params: toParams });
      }
    }
  });

  $rootScope.language = {
    opts: Languages,
    current: Languages[Persist.getLangCode()] ? Persist.getLangCode() : 'en'
  };
  $rootScope.localeFormat = d3.locale(localeFormat.get($rootScope.language.current));
  updateNumberFormat();

  // Global Reference variables
  $rootScope.insurance = { opts: [{ name: 'standard', pct: 0.05 }, { name: 'alpha', pct: 0.025 }, { name: 'beta', pct: 0.0375 }] };
  $rootScope.discounts = { opts: Discounts };
  $rootScope.sizeRatio = Persist.getSizeRatio();
  $rootScope.SZM = SizeMap;
  $rootScope.title = 'Coriolis';

  $rootScope.changeLanguage = function() {
    $translate.use($rootScope.language.current);
    $rootScope.localeFormat = d3.locale(localeFormat.get($rootScope.language.current));
    updateNumberFormat();
    $rootScope.$broadcast('languageChanged', $rootScope.language.current);
  };

  // Formatters
  $rootScope.fRPct = d3.format('%');
  $rootScope.fTime = function(d) { return Math.floor(d / 60) + ':' + ('00' + Math.floor(d % 60)).substr(-2, 2); };

  function updateNumberFormat() {
    var locale = $rootScope.localeFormat;
    var fGen = $rootScope.fGen = locale.numberFormat('n');
    $rootScope.fCrd = locale.numberFormat(',.0f');
    $rootScope.fPwr = locale.numberFormat(',.2f');
    $rootScope.fRound = function(d) { return fGen(d3.round(d, 2)); };
    $rootScope.fPct = locale.numberFormat('.2%');
    $rootScope.f1Pct = locale.numberFormat('.1%');
  }

  /**
   * Returns the name of the component mounted in the specified slot
   * @param  {Object} slot The slot object
   * @return {String}      The component name
   */
  $rootScope.cName = function(slot) {
    return $translate.instant(slot.c ? slot.c.name ? slot.c.name : slot.c.grp : null);
  };

  // Global Event Listeners
  $doc.bind('keyup', function(e) {
    if (e.keyCode == 27) { // Escape Key
      $rootScope.$broadcast('close', e);
      $rootScope.$apply();
    } else {
      $rootScope.$broadcast('keyup', e);
    }
  });

  $rootScope.bgClicked = function(e) {
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

  if (isStandAlone) {
    var state = Persist.getState();
    // If a previous state has been stored, load that state
    if (state && state.name && state.params) {
      $state.go(state.name, state.params, { location: 'replace' });
    } else {
      $state.go('shipyard', null, { location: 'replace' }); // Default to home page
    }
  }

}]);
