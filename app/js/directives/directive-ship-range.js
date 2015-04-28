angular.module('app').directive('shipRange', ['$rootScope','CalcJumpRange', function ($r, calcJumpRange) {

  return {
    restrict: 'A',
    scope:{
      ship: '='
    },
    templateUrl: 'views/ship-range.html',
    link: function(scope, element) {
      scope.$r = $r;
      scope.expanded = false;
      var fsd = scope.ship.common[2].c;

      scope.toggleExpand = function() {
        scope.expanded = !scope.expanded;
      }

      function ranges(fsd, unladenMass, ladenMass) {
        var ranges = [];
        for(var m = unladenMass; m <= ladenMass; m++) {
          ranges.push({x:m, y: calcJumpRange(m, fsd)});
        }
        return ranges;
      }

      //var fDist = d3.format(',.2f');

      //scope.data = ranges(fsd, scope.ship.unladenMass, scope.ship.ladenMass);
      /*scope.options = {
        axes: {
          x: {key: 'x', type: 'linear', ticks: 10},
          y: {type: 'linear', ticks: 5, }
        },
        series: [
          {y: 'y', color: '#FF8C0D', thickness: '2px', type: 'area', striped: false, label: 'Range'}
        ],
        lineMode: 'basis',
        tension: 0.7,
        tooltip: {
          mode: 'scrubber',

          formatter: function(x, y, series) {
            return fDist(y) + ' Light Years';
          }
        },
        drawLegend: false,
        drawDots: false,
        columnsHGap: 5
      };*/
    }
 };
}]);
