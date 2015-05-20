angular.module('app').directive('barChart', ['$rootScope', function ($rootScope) {

  function bName (build) {
    return build.buildName + '\n' + build.name;
  }

  var insertLinebreaks = function (d) {
    var el = d3.select(this);
    var words = d.split('\n');
    el.text('').attr('y', -5);
    for (var i = 0; i < words.length; i++) {
      var tspan = el.append('tspan').text(words[i]);
      if (i > 0) {
        tspan.attr('x', -9).attr('dy', 10);
      }
    }
  };

  return {
    restrict: 'A',
    scope:{
      data: '=',
      facet: '=',
      height: '=',
      width: '='
    },
    link: function(scope, element) {
      var color = d3.scale.ordinal().range([ '#7b6888', '#6b486b', '#3182bd', '#a05d56', '#d0743c']),
          width = scope.width,
          labels = scope.facet.lbls,
          fmt = scope.facet.fmt,
          properties = scope.facet.props,
          unit = scope.facet.unit,
          margin = {top: 10, right: 20, bottom: 35, left: 150},
          w = width - margin.left - margin.right;

      // Create chart
      var svg = d3.select(element[0]).append('svg').attr('width', width);
      var vis = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      // Create and Add tooltip
      var tip = d3.tip()
        .attr('class', 'd3-tip')
        .html(function(property, propertyIndex) {
          return (labels? (labels[propertyIndex] + ': ') : '') + fmt(property.value) + ' ' + unit;
        });
      vis.call(tip);

      // Create Y Axis SVG Elements
      vis.append('g').attr('class', 'y axis');
      vis.selectAll('g.y.axis g text').each(insertLinebreaks);
      // Create X Axis SVG Elements
      vis.append('g')
          .attr('class', 'x axis')
        .append('text')
          .attr('y', 30)
          .attr('x', w/2)
          .attr('dy', '.1em')
          .style('text-anchor', 'middle')
          .text(scope.facet.title + (unit? (' (' + unit + ')') : ''));


      /**
       * Watch for changes in the comparison array (ships added/removed, sorting)
       */
      scope.$watchCollection('data', function() {
        var data = scope.data,
            height = 45 + (25 * data.length),
            h = height - margin.top - margin.bottom,
            maxVal = d3.max(data, function(d) { return d3.max(properties, function(p) {return d[p]; }); }),
            y0 = d3.scale.ordinal().domain(data.map(bName)).rangeRoundBands([0, h],0.3),
            y1 = d3.scale.ordinal().domain(properties).rangeRoundBands([0, y0.rangeBand()]),
            x = d3.scale.linear().range([0, w]).domain([0, maxVal]),
            yAxis = d3.svg.axis().scale(y0).outerTickSize(0).orient('left'),
            xAxis = d3.svg.axis().scale(x).outerTickSize(0).orient('bottom').tickFormat(d3.format('.2s'));

        // Update chart size
        svg.attr('height', height);

        // Remove existing elements
        vis.selectAll('.ship').remove();
        vis.selectAll('rect').remove();

        // Update X & Y Axis
        vis.selectAll('.y.axis').call(yAxis);
        vis.selectAll('.x.axis').attr('transform', 'translate(0,' + h + ')').call(xAxis);
        // Update Y-Axis labels
        vis.selectAll('g.y.axis g text').each(insertLinebreaks);

        var group = vis.selectAll('.ship')
          .data(scope.data, bName)
          .enter().append('g')
            .attr('class', 'g')
            .attr('transform', function(build) { return 'translate(0,' + y0(bName(build)) + ')'; });

        group.selectAll('rect')
          .data(function(build) {
            var o = [];
            for (var i = 0; i < properties.length; i++) {
              o.push({name: properties[i], value:build[properties[i]]});
            }
            return o;
          })
        .enter().append('rect')
          .attr('height', y1.rangeBand())
          .attr('x',0)
          .attr('y', function(d) {return y1(d.name); })
          .attr('width', function(d) { return x(d.value); })
          .on('mouseover', tip.show)
          .on('mouseout', tip.hide)
          .style('fill', function(d) { return color(d.name); });

      });

      scope.$on('$destroy', function() {
        tip.destroy(); // Remove the tooltip from the DOM
      });

    }
  };
}]);