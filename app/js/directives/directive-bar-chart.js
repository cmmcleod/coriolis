angular.module('app').directive('barChart', ['$window', '$translate', '$rootScope', function($window, $translate, $rootScope) {

  function bName(build) {
    return build.buildName + '\n' + build.name;
  }

  function insertLinebreaks(d) {
    var el = d3.select(this);
    var lines = d.split('\n');
    el.text('').attr('y', -6);
    for (var i = 0; i < lines.length; i++) {
      var tspan = el.append('tspan').text(lines[i].length > 18 ? lines[i].substring(0,15) + '...' : lines[i]);
      if (i > 0) {
        tspan.attr('x', -9).attr('dy', '1em');
      } else {
        tspan.attr('class', 'primary');
      }
    }
  }

  return {
    restrict: 'A',
    scope: {
      data: '=',
      facet: '='
    },
    link: function(scope, element) {
      var color = d3.scale.ordinal().range([ '#7b6888', '#6b486b', '#3182bd', '#a05d56', '#d0743c']),
          labels = scope.facet.lbls,
          fmt = null,
          unit = null,
          properties = scope.facet.props,
          margin = { top: 10, right: 20, bottom: 40, left: 150 },
          y0 = d3.scale.ordinal(),
          y1 = d3.scale.ordinal(),
          x = d3.scale.linear(),
          yAxis = d3.svg.axis().scale(y0).outerTickSize(0).orient('left'),
          xAxis = d3.svg.axis().scale(x).ticks(5).outerTickSize(0).orient('bottom');

      // Create chart
      var svg = d3.select(element[0]).append('svg');
      var vis = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      // Create and Add tooltip
      var tip = d3.tip()
        .attr('class', 'd3-tip')
        .html(function(property, propertyIndex) {
          return (labels ? ($translate.instant(labels[propertyIndex]) + ': ') : '') + fmt(property.value) + ' ' + unit;
        });

      vis.call(tip);

      // Create Y Axis SVG Elements
      vis.append('g').attr('class', 'y axis');
      vis.selectAll('g.y.axis g text').each(insertLinebreaks);
      // Create X Axis SVG Elements
      var xAxisLbl = vis.append('g')
          .attr('class', 'x axis cap')
        .append('text')
          .attr('y', 33)
          .attr('dy', '.1em')
          .style('text-anchor', 'middle');

      updateFormats();

      function render() {
        var data = scope.data,
            width = element[0].offsetWidth,
            w = width - margin.left - margin.right,
            height = 50 + (30 * data.length * $rootScope.sizeRatio),
            h = height - margin.top - margin.bottom,
            maxVal = d3.max(data, function(d) { return d3.max(properties, function(p) {return d[p]; }); });

        // Update chart size
        svg.attr('width', width).attr('height', height);

        // Remove existing elements
        vis.selectAll('.ship').remove();
        vis.selectAll('rect').remove();

        // Update X & Y Axis
        x.range([0, w]).domain([0, maxVal]);
        y0.domain(data.map(bName)).rangeRoundBands([0, h], 0.3);
        y1.domain(properties).rangeRoundBands([0, y0.rangeBand()]);
        vis.selectAll('.y.axis').call(yAxis);
        vis.selectAll('.x.axis').attr('transform', 'translate(0,' + h + ')').call(xAxis);
        xAxisLbl.attr('x', w / 2);
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
              o.push({ name: properties[i], value: build[properties[i]] });
            }
            return o;
          })
        .enter().append('rect')
          .attr('height', y1.rangeBand())
          .attr('x', 0)
          .attr('y', function(d) {return y1(d.name); })
          .attr('width', function(d) { return x(d.value); })
          .on('mouseover', tip.show)
          .on('mouseout', tip.hide)
          .style('fill', function(d) { return color(d.name); });

      }

      function updateFormats() {
        fmt = $rootScope[scope.facet.fmt];
        unit = $translate.instant(scope.facet.unit);
        xAxisLbl.text($translate.instant(scope.facet.title) + (unit ? (' (' + $translate.instant(unit) + ')') : ''));
        xAxis.tickFormat($rootScope.localeFormat.numberFormat('.2s'));
        render();
      }

      angular.element($window).bind('orientationchange resize render', render);
      scope.$watchCollection('data', render); // Watch for changes in the comparison array
      scope.$on('languageChanged', updateFormats);
      scope.$on('$destroy', function() {
        angular.element($window).unbind('orientationchange resize render', render);
        tip.destroy(); // Remove the tooltip from the DOM
      });

    }
  };
}]);
