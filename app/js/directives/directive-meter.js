angular.module('app').directive('meter', function () {
  return {
    restrict: 'A',
    scope: {
      labels: '=',
      keys: '=',
      obj: '=',
      max: '='
    },
    link: function (scope, element) {
      var max = scope.max,
          w = 90,
          pLeft = 1,
          pBottom = 2,
          labelWidth = 45,
          bHeight = 16,
          bWidth = ((w - labelWidth) / max) - pLeft,
          h = bHeight * scope.keys.length;

      var data = [];

      for(var i = 0; i < scope.keys.length; i++) {
        data.push({name:scope.labels[i], val: scope.obj[scope.keys[i]]});
      }

      var svg = d3.select(element[0])
        .append('svg')
        .attr('width', w)
        .attr('height', h)
        .attr('viewBox', '0 0 ' + w + ' ' + h)
        .attr('class', 'meter')
        .attr('preserveAspectRatio', 'xMinYMin');

      svg.selectAll("g").data(data)
        .enter()
        .append("g")
        .attr('transform', function(d, i) {
          return 'translate(' + labelWidth + ' ' + (i * bHeight) + ')';
        })
        .each(function(d, k) {
          var g = d3.select(this);
          for (var i = 0; i < max; i++) {
            g.append('rect')
              .attr("x", i * (bWidth + pLeft))
              .attr("y", 0)
              .attr("width", bWidth)
              .attr("height", bHeight - pBottom);
          }
        });

      svg.selectAll("text").data(data)
        .enter()
        .append('text')
        .text(function(d) {
          return d.name;
        })
        .attr("text-anchor", "end")
        .attr("x", labelWidth - 3)
        .attr("y", function(d, i) {
          return (i * bHeight) + (bHeight) / 2;
        });

      function update() {
        for(var i = 0; i < data.length; i++) {
          data[i].val = scope.obj[scope.keys[i]];
        }

        svg.selectAll("g").data(data)
          .selectAll('rect').attr('class', function(d, i) {
            return (i + 1 <= d.val) ? 'active' : '';
          });
      }

      scope.$watch('obj',update);
    }
  };
});