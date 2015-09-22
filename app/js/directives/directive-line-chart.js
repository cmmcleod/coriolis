angular.module('app').directive('lineChart', ['$window', '$translate', '$rootScope', function($window, $translate, $rootScope) {

  var RENDER_POINTS = 20;   // Only render 20 points on the graph

  return {
    restrict: 'A',
    scope: {
      config: '=',
      series: '='
    },
    link: function(scope, element) {
      var seriesConfig = scope.series,
          series = seriesConfig.series,
          color = d3.scale.ordinal().range(scope.series.colors ? scope.series.colors : ['#ff8c0d']),
          config = scope.config,
          labels = config.labels,
          margin = { top: 15, right: 15, bottom: 35, left: 60 },
          fmtLong = null,
          func = seriesConfig.func,
          drag = d3.behavior.drag(),
          dragging = false,
          // Define Scales
          x = d3.scale.linear(),
          y = d3.scale.linear(),
          // Define Axes
          xAxis = d3.svg.axis().scale(x).outerTickSize(0).orient('bottom'),
          yAxis = d3.svg.axis().scale(y).ticks(6).outerTickSize(0).orient('left'),
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
          .attr('class', 'cap')
          .attr('transform', 'rotate(-90)')
          .attr('y', -50)
          .attr('dy', '.1em')
          .style('text-anchor', 'middle');

      // Create X Axis SVG Elements
      var xLbl = vis.append('g').attr('class', 'x axis');
      var xTxt = xLbl.append('text')
          .attr('class', 'cap')
          .attr('y', 30)
          .attr('dy', '.1em')
          .style('text-anchor', 'middle');

      // xTxt.append('tspan').attr('class', 'metric');
      // yTxt.append('tspan').attr('class', 'metric');

      // Create and Add tooltip
      var tipHeight = 2 + (1.25 * (series ? series.length : 0.75));
      var tips = vis.append('g').style('display', 'none').attr('class', 'tooltip');
      var markers = vis.append('g').style('display', 'none');

      tips.append('rect')
        .attr('height', tipHeight + 'em')
        .attr('y', (-tipHeight / 2) + 'em')
        .attr('class', 'tip');

      tips.append('text')
        .attr('class', 'label x')
        .attr('dy', (-tipHeight / 2) + 'em')
        .attr('y', '1.25em');

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

      updateFormats();

      function render() {
        var width = element[0].parentElement.offsetWidth,
            height = width * 0.5 * $rootScope.sizeRatio,
            xMax = seriesConfig.xMax,
            xMin = seriesConfig.xMin,
            yMax = seriesConfig.yMax,
            yMin = seriesConfig.yMin,
            w = width - margin.left - margin.right,
            h = height - margin.top - margin.bottom,
            c, s, val, yVal, delta;

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
            delta = (xMax - xMin) / RENDER_POINTS;
            val = 0;
            for (c = 0; c <= RENDER_POINTS; c++) {
              yVal = func(val);
              for (s = 0; s < series.length; s++) {
                data[s].push([ val, yVal[ series[s] ] ]);
              }
              val += delta;
            }
          }

        } else {
          var seriesData = [];
          if (xMax == xMin) {
            yVal = func(xMin);
            seriesData.push([ xMin, yVal ], [ 1, yVal ]);
          } else {
            delta = (xMax - xMin) / RENDER_POINTS;
            val = 0;
            for (c = 0; c <= RENDER_POINTS; c++) {
              seriesData.push([val, func(val) ]);
              val += delta;
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

        tips.selectAll('text.label.y').data(data).enter()
          .append('text')
            .attr('class', 'label y')
            .attr('dy', (-tipHeight / 2) + 'em')
            .attr('y', function(d, i) { return 1.25 * (i + 2) + 'em'; });

        markers.selectAll('circle.marker').data(data).enter().append('circle').attr('class', 'marker').attr('r', 4);
      }

      function showTip() {
       tips.style('display', null);
       markers.style('display', null);
      }

      function hideTip() {
        if (!dragging) {
          tips.style('display', 'none');
          markers.style('display', 'none');
        }
      }

      function moveTip() {
        var xPos = d3.mouse(this)[0],
            x0 = x.invert(xPos),
            y0 = func(x0),
            yTotal = 0,
            flip = (x0 / x.domain()[1] > 0.65),
            tipWidth = 0,
            minTransY = (tips.selectAll('rect').node().getBoundingClientRect().height / 2) - margin.top;

        tips.selectAll('text.label.y').text(function(d, i) {
          var yVal = series ? y0[series[i]] : y0;
          yTotal += yVal;
          return (series ?  $translate.instant(series[i]) : '') + ' ' + fmtLong(yVal);
        }).append('tspan').attr('class','metric').text(' ' + $translate.instant(labels.yAxis.unit));

        tips.selectAll('text').each(function() {
          if (this.getBBox().width > tipWidth) {
            tipWidth = Math.ceil(this.getBBox().width);
          }
        });

        tipWidth += 8;
        markers.selectAll('circle.marker').attr('cx', x(x0)).attr('cy', function(d, i) { return y(series ? y0[series[i]] : y0); });
        tips.selectAll('text.label').attr('x', flip ? -12 : 12).style('text-anchor', flip ? 'end' : 'start');
        tips.selectAll('text.label.x').text(fmtLong(x0)).append('tspan').attr('class','metric').text(' ' + $translate.instant(labels.xAxis.unit));
        tips.attr('transform', 'translate(' + x(x0) + ',' + Math.max(minTransY, y(yTotal / (series ? series.length : 1))) + ')');
        tips.selectAll('rect')
          .attr('width', tipWidth + 4)
          .attr('x', flip ? -tipWidth - 12 : 8)
          .style('text-anchor', flip ? 'end' : 'start');

      }

      function updateFormats() {
        xTxt.text($translate.instant(labels.xAxis.title)).append('tspan').attr('class', 'metric').text(' (' + $translate.instant(labels.xAxis.unit) + ')');
        yTxt.text($translate.instant(labels.yAxis.title)).append('tspan').attr('class', 'metric').text(' (' + $translate.instant(labels.yAxis.unit) + ')');
        fmtLong = $rootScope.localeFormat.numberFormat('.2f');
        xAxis.tickFormat($rootScope.localeFormat.numberFormat('.2r'));
        yAxis.tickFormat($rootScope.localeFormat.numberFormat('.3r'));
        render();
      }

      angular.element($window).bind('orientationchange resize render', render);
      scope.$watchCollection('series', render);   // Watch for changes in the series data
      scope.$on('languageChanged', updateFormats);
      scope.$on('$destroy', function() {
        angular.element($window).unbind('orientationchange resize render', render);
      });

    }
  };
}]);
