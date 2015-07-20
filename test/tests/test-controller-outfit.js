describe("Outfit Controller", function() {
  beforeEach(module('app'));

  var outfitController, $rootScope, $stateParams, scope;

  var eventStub = {
      preventDefault: function(){ },
      stopPropagation: function(){ }
  };

  beforeEach(inject(function(_$rootScope_, $controller) {
      $rootScope = _$rootScope_;
      $rootScope.discounts = { ship: 1, components: 1};
      $stateParams = { shipId: 'anaconda'};
      scope = $rootScope.$new();
      outfitController = $controller('OutfitController', { $rootScope: $rootScope, $scope: scope, $stateParams: $stateParams });
  }));

  describe("Retrofitting Costs", function() {

    it("are empty by default", function() {
      expect(scope.retrofitTotal).toEqual(0);
      expect(scope.retrofitList.length).toEqual(0);
    });

    it("updates on bulkheads change", function() {
      scope.select('b', scope.ship.bulkheads, eventStub, "1"); // Use Reinforced Alloy Bulkheads
      expect(scope.retrofitTotal).toEqual(58787780);
      expect(scope.retrofitList.length).toEqual(1);
      scope.select('b', scope.ship.bulkheads, eventStub, "0"); // Use Reinforced Alloy Bulkheads
      expect(scope.retrofitTotal).toEqual(0);
      expect(scope.retrofitList.length).toEqual(0);
    });

    it("updates on component change", function() {
      scope.select('h', scope.ship.hardpoints[0], eventStub, "0u"); // 3C/F Beam Laser
      expect(scope.retrofitTotal).toEqual(1177600);
      expect(scope.retrofitList.length).toEqual(1);
      scope.select('h', scope.ship.hardpoints[6], eventStub, "empty"); // Remove default pulse laser
      scope.select('h', scope.ship.hardpoints[7], eventStub, "empty"); // Remove default pulse laser
      expect(scope.retrofitTotal).toEqual(1173200);
      expect(scope.retrofitList.length).toEqual(3);
      scope.select('i', scope.ship.internal[3], eventStub, "11"); // Use 6A Auto field maintenance unit
      expect(scope.retrofitTotal).toEqual(16478701);
      expect(scope.retrofitList.length).toEqual(4);
    });

  });

});
