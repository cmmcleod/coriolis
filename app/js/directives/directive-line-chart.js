angular.module('app').directive('lineChart', ['$window', function($window) {
  return {
    restrict: 'A',
    scope: {
      config: '=',
      series: '='
    },
    link: function(scope, element) {
      var seriesConfig = scope.series,
          series = seriesConfig.series,
          color = d3.scale.ordinal().range([ '#ff8c0d', '#1fb0ff', '#a05d56', '#d0743c']),
          config = scope.config,
          labels = config.labels,
          margin = { top: 15, right: 15, bottom: 35, left: 60 },
          fmt = d3.format('.3r'),
          fmtLong = d3.format('.2f'),
          func = seriesConfig.func,
          drag = d3.behavior.drag(),
          dragging = false,
          // Define Scales
          x = d3.scale.linear(),
          y = d3.scale.linear(),
          // Define Axes
          xAxis = d3.svg.axis().scale(x).outerTickSize(0).orient('bottom').tickFormat(d3.format('.2r')),
          yAxis = d3.svg.axis().scale(y).ticks(6).outerTickSize(0).orient('left').tickFormat(fmt),
          data = [];

      // Create chart
      var svg = d3.select(element[0]).append('svg');
      var vis = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
      var lines = vis.append('g');

      // Define Area
      var line = d3.svg.line().y(function(d) { return y(d[1]); });

      // Create Y Axis SVG Elements
      var yTxt = vis.append('g').attr('class', 'y axis')
        .append('text')
          .attr('transform', 'rotate(-90)')
          .attr('y', -50)
          .attr('dy', '.1em')
          .style('text-anchor', 'middle')
          .text(labels.yAxis.title + ' (' + labels.yAxis.unit + ')');
      // Create X Axis SVG Elements
      var xLbl = vis.append('g').attr('class', 'x axis');
      var xTxt = xLbl.append('text')
          .attr('y', 30)
          .attr('dy', '.1em')
          .style('text-anchor', 'middle')
          .text(labels.xAxis.title + ' (' + labels.xAxis.unit + ')');

      // Create and Add tooltip
      var tipWidth = (Math.max(labels.yAxis.unit.length, labels.xAxis.unit.length) * 1.25) + 2;
      var tips = vis.append('g').style('display', 'none');

      var background = vis.append('rect') // Background to capture hover/drag
        .attr('fill-opacity', 0)
        .on('mouseover', showTip)
        .on('mouseout', hideTip)
        .on('mousemove', moveTip)
        .call(drag);

      drag
        .on('dragstart', function() {
          dragging = true;
          moveTip.call(this);
          showTip();
        })
        .on('dragend', function() {
          dragging = false;
          hideTip();
        })
        .on('drag', moveTip);

      /**
       * Watch for changes in the series data (mass changes, etc)
       */
      scope.$watchCollection('series', render);
      angular.element($window).bind('orientationchange resize render', render);

      function render() {
        var width = element[0].parentElement.offsetWidth,
            height = width * 0.5,
            xMax = seriesConfig.xMax,
            xMin = seriesConfig.xMin,
            yMax = seriesConfig.yMax,
            yMin = seriesConfig.yMin,
            w = width - margin.left - margin.right,
            h = height - margin.top - margin.bottom,
            s, val, yVal, delta;

        data.length = 0;  // Reset Data array

        if (seriesConfig.xMax == seriesConfig.xMin) {
          line.x(function(d, i) { return i * w; });
        } else {
          line.x(function(d) { return x(d[0]); });
        }

        if (series) {
          for (s = 0; s < series.length; s++) {
            data.push([]);
          }

          if (xMax == xMin) {
            yVal = func(xMin);
            for (s = 0; s < series.length; s++) {
              data[s].push( [ xMin, yVal[ series[s] ] ], [ 1, yVal[ series[s] ] ]);
            }
          } else {
            delta = (xMax - xMin) / 30;  // Only render 30 points on the graph
            for (val = xMin; val <= xMax; val += delta) {
              yVal = func(val);
              for (s = 0; s < series.length; s++) {
                data[s].push([ val, yVal[ series[s] ] ]);
              }
            }
          }

        } else {
          var seriesData = [];
          if (xMax == xMin) {
            yVal = func(xMin);
            seriesData.push([ xMin, yVal ], [ 1, yVal ]);
          } else {
            delta = (xMax - xMin) / 30;  // Only render 30 points on the graph
            for (val = xMin; val <= xMax; val += delta) {
              seriesData.push([val, func(val) ]);
            }
          }

          data.push(seriesData);
        }

        // Update Chart Size
        svg.attr('width', width).attr('height', height);
        background.attr('height', h).attr('width', w);

        // Update domain and scale for axes
        x.range([0, w]).domain([xMin, xMax]).clamp(true);
        xLbl.attr('transform', 'translate(0,' + h + ')');
        xTxt.attr('x', w / 2);
        y.range([h, 0]).domain([yMin, yMax]);
        yTxt.attr('x', -h / 2);
        vis.selectAll('.y.axis').call(yAxis);
        vis.selectAll('.x.axis').call(xAxis);

        lines.selectAll('path.line')
          .data(data)
            .attr('d', line)    // Update existing series
          .enter()              // Add new series
            .append('path')
            .attr('class', 'line')
            .attr('stroke', function(d, i) { return color(i); })
            .attr('stroke-width', 2)
            .attr('d', line);

        var tip = tips.selectAll('g.tooltip').data(data).enter().append('g').attr('class', 'tooltip');
        tip.append('rect').attr('width', tipWidth + 'em').attr('height', '2em').attr('x', '0.5em').attr('y', '-1em').attr('class', 'tip');
        tip.append('circle').attr('class', 'marker').attr('r', 4);
        tip.append('text').attr('class', 'label x').attr('y', '-0.25em');
        tip.append('text').attr('class', 'label y').attr('y', '0.85em');
      }

      function showTip() {
       tips.style('display', null);
      }

      function hideTip() {
        if (!dragging) {
          tips.style('display', 'none');
        }
      }

      function moveTip() {
        var xPos = d3.mouse(this)[0], x0 = x.invert(xPos), y0 = func(x0), flip = (x0 / x.domain()[1] > 0.65);
        var tip = tips.selectAll('g.tooltip').attr('transform', function(d, i) { return 'translate(' + x(x0) + ',' + y(series ? y0[series[i]] : y0) + ')'; });
        tip.selectAll('rect').attr('x', flip ? (-tipWidth - 0.5) + 'em' : '0.5em').style('text-anchor', flip ? 'end' : 'start');
        tip.selectAll('text.label').attr('x', flip ? '-1em' : '1em').style('text-anchor', flip ? 'end' : 'start');
        tip.selectAll('text.label.x').text(fmtLong(x0) + ' ' + labels.xAxis.unit);
        tips.selectAll('text.label.y').text(function(d, i) { return fmtLong(series ? y0[series[i]] : y0) + ' ' + labels.yAxis.unit; });
      }

      scope.$on('$destroy', function() {
        angular.element($window).unbind('orientationchange resize render', render);
      });

    }
  };
}]);
