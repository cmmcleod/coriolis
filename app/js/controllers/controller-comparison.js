angular.module('app').controller('ComparisonController', ['lodash', '$rootScope', '$filter', '$scope', '$state', '$stateParams', '$translate', 'Utils', 'ShipFacets', 'ShipsDB', 'Ship', 'Persist', 'Serializer', function(_, $rootScope, $filter, $scope, $state, $stateParams, $translate, Utils, ShipFacets, Ships, Ship, Persist, Serializer) {
  $rootScope.title = 'Coriolis - Compare';
  $scope.predicate = 'name'; // Sort by ship name as default
  $scope.desc = false;
  $scope.facetSortOpts = { containment: '#facet-container', orderChanged: function() { $scope.saved = false; } };
  $scope.builds = [];
  $scope.unusedBuilds = [];
  $scope.name = $stateParams.name;
  $scope.compareMode = !$stateParams.code;
  $scope.importObj = {}; // Used for importing comparison builds (from permalinked comparison)
  var defaultFacets = [9, 6, 4, 1, 3, 2]; // Reverse order of Armour, Shields, Speed, Jump Range, Cargo Capacity, Cost
  var facets = $scope.facets = angular.copy(ShipFacets);
  var shipId, buildName, comparisonData;

  /**
   * Add an existing build to the comparison. The build must be saved locally.
   * @param  {string} id    The unique ship key/id
   * @param  {string} name  The build name
   */
  $scope.addBuild = function(id, name, code) {
    var data = Ships[id];   // Get ship properties
    code = code ? code : Persist.builds[id][name]; // Retrieve build code if not passed

    if (!code) {  // No build found
      return;
    }

    var b = new Ship(id, data.properties, data.slots); // Create a new Ship instance
    Serializer.toShip(b, code);  // Populate components from code
    // Extend ship instance and add properties below
    b.buildName = name;
    b.code = code;
    b.pctRetracted = b.powerRetracted / b.powerAvailable;
    b.pctDeployed = b.powerDeployed / b.powerAvailable;
    $scope.builds.push(b); // Add ship build to comparison
    $scope.builds = $filter('orderBy')($scope.builds, $scope.predicate, $scope.desc);  // Resort
    _.remove($scope.unusedBuilds, function(o) {  // Remove from unused builds
      return o.id == id && o.buildName == name;
    });
    $scope.saved = false;
  };

  /**
   * Removes a build from the comparison
   * @param  {string} id   The unique ship key/id
   * @param  {string} name The build name
   */
  $scope.removeBuild = function(id, name) {
    _.remove($scope.builds, function(s) {
      if (s.id == id && s.buildName == name) {
        $scope.unusedBuilds.push({ id: id, buildName: name, name: s.name }); // Add build back to unused builds
        return true;
      }
      return false;
    });
    $scope.saved = false;
  };

  /**
   * Toggles the selected the set of facets used in the comparison
   * @param  {number} i The index of the facet in facets
   */
  $scope.toggleFacet = function(i) {
    facets[i].active = !facets[i].active;
    $scope.tblUpdate = !$scope.tblUpdate; // Simple switch to trigger the table to update
    $scope.saved = false;
  };

  /**
   * Click handler for sorting by facets in the table
   * @param  {object} e Event object
   */
  $scope.handleClick = function(e) {
    var elem = angular.element(e.target);
    if (elem.attr('prop')) {     // Get component ID
      $scope.sort(elem.attr('prop'));

    } else if (elem.attr('del')) {  // Delete index
      $scope.removeBuild(elem.attr('del'));
    }
  };

  /**
   * Sort the comparison array based on the selected facet / ship property
   * @param  {string} key Ship property
   */
  $scope.sort = function(key) {
    $scope.desc = $scope.predicate == key ? !$scope.desc : $scope.desc;
    $scope.predicate = key;
    $scope.builds = $filter('orderBy')($scope.builds, $scope.predicate, $scope.desc);
  };

  /**
   * Saves the current comparison's selected facets and builds
   */
  $scope.save = function() {
    $scope.name = $scope.name.trim();
    if ($scope.name == 'all') {
      return;
    }
    var selectedFacets = [];
    facets.forEach(function(f) {
      if (f.active) {
        selectedFacets.unshift(f.index);
      }
    });
    Persist.saveComparison($scope.name, $scope.builds, selectedFacets);
    $state.go('compare', { name: $scope.name }, { location: 'replace', notify: false });
    $scope.saved = true;
  };

  /**
   * Permantently delete the current comparison
   */
  $scope.delete = function() {
    Persist.deleteComparison($scope.name);
    $state.go('compare', { name: null }, { location: 'replace', reload: true });
  };

  /**
   * Set saved to false when the name of the comparison is changed.
   */
  $scope.nameChange = function() {
    $scope.saved = false;
  };

  /**
   * Hide/Show the select builds menu
   * @param  {boolean} s  Show true/false
   * @param  {Event}   e  Event Object
   */
  $scope.selectBuilds = function(s, e) {
    e.stopPropagation();
    $scope.showBuilds = s;
  };

  /**
   * Show the permalink modal
   * @param  {Event} e  Event object
   */
  $scope.permalink = function(e) {
    e.stopPropagation();
    $state.go('modal.link', { url: genPermalink() });
  };

  /**
   * Generate the forum embed code for the comparison
   * and show the export modal.
   *
   * @param  {Event} e  Event object
   */
  $scope.embed = function(e) {
    e.stopPropagation();
    // Make a request to goo.gl to shorten the URL, returns a promise
    var promise = Utils.shortenUrl( genPermalink()).then(
      function(shortUrl) {
        return Utils.comparisonBBCode(facets, $scope.builds, shortUrl);
      },
      function(err) {
        return 'Error - ' + err.statusText;
      }
    );
    $state.go('modal.export', { promise: promise, title: $translate.instant('FORUM') + ' BBCode' });
  };

  /**
   * Generates the long permalink URL
   * @return {string} The long permalink URL
   */
  function genPermalink() {
    var selectedFacets = [];
    facets.forEach(function(f) {
      if (f.active) {
        selectedFacets.unshift(f.index);
      }
    });
    var code = Serializer.fromComparison(
      $scope.name,
      $scope.builds,
      selectedFacets,
      $scope.predicate,
      $scope.desc
    );
    return $state.href('comparison', { code: code }, { absolute: true });
  }

  /* Event listeners */
  $scope.$on('close', function() {
    $scope.showBuilds = false;
  });

  $scope.$on('languageChanged', function() {
    $scope.tblUpdate = !$scope.tblUpdate; // Simple switch to trigger the table to update
  });

  /* Initialization */
  if ($scope.compareMode) {
    if ($scope.name == 'all') {
      for (shipId in Persist.builds) {
        for (buildName in Persist.builds[shipId]) {
          $scope.addBuild(shipId, buildName);
        }
      }
    } else {
      for (shipId in Persist.builds) {
        for (buildName in Persist.builds[shipId]) {
          $scope.unusedBuilds.push({ id: shipId, buildName: buildName, name: Ships[shipId].properties.name });
        }
      }
      comparisonData = Persist.getComparison($scope.name);
      if (comparisonData) {
        defaultFacets = comparisonData.facets;
        comparisonData.builds.forEach(function(b) {
          $scope.addBuild(b.shipId, b.buildName);
        });
        $scope.saved = true;
      }
    }
  } else {
    try {
      comparisonData = Serializer.toComparison($stateParams.code);
      defaultFacets = comparisonData.f;
      $scope.name = comparisonData.n;
      $scope.predicate = comparisonData.p;
      $scope.desc = comparisonData.d;
      comparisonData.b.forEach(function(build) {
        $scope.addBuild(build.s, build.n, build.c);
        if (!$scope.importObj[build.s]) {
          $scope.importObj[build.s] = {};
        }
        $scope.importObj[build.s][build.n] = build.c;
      });
    } catch (e) {
      throw { type: 'bad-comparison', message: e.message, details: e };
    }
  }
  // Replace fmt with actual format function as defined in rootScope and retain original index
  facets.forEach(function(f, i) { f.index = i; });
  // Remove default facets, mark as active, and add them back in selected order
  _.pullAt(facets, defaultFacets).forEach(function(f) { f.active = true; facets.unshift(f); });
  $scope.builds = $filter('orderBy')($scope.builds, $scope.predicate, $scope.desc);

}]);
