describe('Import Controller', function() {
  beforeEach(module('app'));

  var importController, $rootScope, $stateParams, scope;

  var eventStub = {
      preventDefault: function(){ },
      stopPropagation: function(){ }
  };

  beforeEach(inject(function(_$rootScope_, $controller) {
      $rootScope = _$rootScope_;
      $rootScope.discounts = {
        ship: 1,
        components: 1
      };
      $stateParams = { };
      scope = $rootScope.$new();
      scope.$parent.dismiss = function() {};

      var store = {};

      spyOn(localStorage, 'getItem').and.callFake(function (key) {
        return store[key];
      });
      spyOn(localStorage, 'setItem').and.callFake(function (key, value) {
        return store[key] = value + '';
      });
      spyOn(localStorage, 'clear').and.callFake(function () {
          store = {};
      });

      importController = $controller('ImportController', { $rootScope: $rootScope, $scope: scope, $stateParams: $stateParams });
  }));

  describe('Import Backup', function() {

    it('imports a valid backup', function() {
      var importData = __json__['fixtures/valid-backup'];
      scope.importJSON = angular.toJson(importData);
      scope.validateJson();
      expect(scope.jsonValid).toBeTruthy();
      expect(scope.errorMsg).toEqual(null);
      scope.process();
      expect(scope.processed).toBeTruthy();
      scope.import();
      expect(angular.fromJson(localStorage.getItem('builds'))).toEqual(importData.builds);
      expect(angular.fromJson(localStorage.getItem('comparisons'))).toEqual(importData.comparisons);
      expect(localStorage.getItem('insurance')).toEqual(importData.insurance);
      expect(angular.fromJson(localStorage.getItem('discounts'))).toEqual(importData.discounts);
    });

    it('imports an old valid backup', function() {
      var importData = __json__['fixtures/old-valid-export'];
      scope.importJSON = angular.toJson(importData);
      scope.validateJson();
      expect(scope.jsonValid).toBeTruthy();
      expect(scope.errorMsg).toEqual(null);
      scope.process();
      expect(scope.processed).toBeTruthy();
      scope.import();
      expect(angular.fromJson(localStorage.getItem('builds'))).toEqual(importData.builds);
    });

    it('catches an invalid backup', function() {
      var importData = __json__['fixtures/valid-backup'];

      scope.importJSON = 'null';
      scope.validateJson();
      expect(scope.jsonValid).toBeFalsy();
      expect(scope.errorMsg).toEqual('Must be an object or array!');

      scope.importJSON = '{ "builds": "Should not be a string" }';
      scope.validateJson();
      expect(scope.jsonValid).toBeFalsy();
      expect(scope.errorMsg).toEqual('builds must be an object!');

      scope.importJSON = angular.toJson(importData).replace('anaconda', 'invalid_ship');
      scope.validateJson();
      expect(scope.jsonValid).toBeFalsy();
      expect(scope.errorMsg).toEqual('"invalid_ship" is not a valid Ship Id!');

      scope.importJSON = angular.toJson(importData).replace('Dream', '');
      scope.validateJson();
      expect(scope.jsonValid).toBeFalsy();
      expect(scope.errorMsg).toEqual('Imperial Clipper build "" must be a string at least 3 characters long!');

      invalidImportData = angular.copy(importData);
      invalidImportData.builds.asp = null;   // Remove Asp Miner build used in comparison
      scope.importJSON = angular.toJson(invalidImportData);
      scope.validateJson();
      expect(scope.jsonValid).toBeFalsy();
      expect(scope.errorMsg).toEqual('asp build "Miner" data is missing!');

    });

  });

  describe('Import Detailed Build', function() {

    it('imports a valid build', function() {
      var importData = __json__['fixtures/anaconda-test-detailed-export'];
      scope.importJSON = angular.toJson(importData);
      scope.validateJson();
      expect(scope.jsonValid).toBeTruthy();
      expect(scope.errorMsg).toEqual(null);
      scope.process();
      expect(scope.processed).toBeTruthy();
      scope.import();
      expect(angular.fromJson(localStorage.getItem('builds'))).toEqual({
        anaconda: { 'Test': '48A6A6A5A8A8A5C2c0o0o0o1m1m0q0q0404-0l0b0100034k5n052d04--0303326b.Iw18ZlA=.Aw18ZlA=' }
      });
    });

    it('catches an invalid build', function() {
      var importData = __json__['fixtures/anaconda-test-detailed-export'];
      scope.importJSON = angular.toJson(importData).replace('components', 'comps');
      scope.validateJson();
      expect(scope.jsonValid).toBeFalsy();
      expect(scope.errorMsg).toEqual('Anaconda Build "Test": Invalid data');
    });

  });

  describe('Import Detaild Builds Array', function() {

    it('imports all builds', function() {
      var importData = __json__['fixtures/valid-detailed-export'];
      var expectedBuilds = __json__['fixtures/expected-builds'];
      scope.importJSON = angular.toJson(importData);
      scope.validateJson();
      expect(scope.jsonValid).toBeTruthy();
      expect(scope.errorMsg).toEqual(null);
      scope.process();
      expect(scope.processed).toBeTruthy();
      scope.import();
      var builds = angular.fromJson(localStorage.getItem('builds'));
      for (var s in builds) {
        for (var b in builds[s]) {
          expect(builds[s][b]).toEqual(expectedBuilds[s][b]);
        }
      }
    });

  });

});
