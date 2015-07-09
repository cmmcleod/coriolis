angular.module('app').directive('slider', ['$window', function($window) {

  return {
    restrict: 'A',
    scope: {
      min: '=',
      def: '=',
      max: '=',
      unit: '=',
      change: '&onChange'
    },
    link: function(scope, element) {
      var unit = scope.unit,
          margin = unit ? { top: -10, right: 145, left: 50 } : { top: 0, right: 10, left: 10 },
          height = unit ? 40 : 20,    // Height is fixed
          h = height - margin.top,
          fmt = d3.format('.2f'),
          pct = d3.format('.1%'),
          val = scope.def !== undefined ? scope.def : scope.max,
          svg = d3.select(element[0]).append('svg'),
          vis = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')'),
          xAxisContainer = vis.append('g').attr('class', 'x slider-axis').attr('transform', 'translate(0,' + h / 2 + ')'),
          x = d3.scale.linear(),
          xAxis = d3.svg.axis().scale(x).orient('bottom').tickFormat(function(d) { return d + unit; }).tickSize(0).tickPadding(12);
          slider = vis.append('g').attr('class', 'slider'),
          filled = slider.append('path').attr('class', 'filled').attr('transform', 'translate(0,' + h / 2 + ')'),
          brush = d3.svg.brush().x(x).extent([scope.max, scope.max]).on('brush', brushed),
          handle = slider.append('circle').attr('class', 'handle').attr('r', '0.6em'),
          lbl = unit ? slider.append('g').append('text').attr('y', h / 2) : null;

      slider.call(brush);
      slider.select('.background').attr('height', h);
      handle.attr('transform', 'translate(0,' + h / 2 + ')');

      /**
       * Watch for changes in the max, window size
       */
      scope.$watch('max', function(newMax, oldMax) {
        val = newMax * (val / oldMax); // Retain percentage filled
        render();
      });

      //angular.element($window).bind('orientationchange resize', render);

      function render() {
        var width = element[0].offsetWidth, w = width - margin.left - margin.right;
        svg.attr('width', width).attr('height', height);
        x.domain([scope.min || 0, scope.max]).range([0, w]).clamp(true);
        handle.attr('cx', x(val));
        if (unit) {
          xAxisContainer.call(xAxis.tickValues([0, scope.max / 4, scope.max / 2, (3 * scope.max) / 4, scope.max]));
          lbl.attr('x', w + 20);
        }
        slider.call(brush.extent([val, val])).call(brush.event);
        slider.selectAll('.extent,.resize').remove();
      }

      function brushed() {
        val = brush.extent()[0];
        if (d3.event.sourceEvent) { // not a programmatic event
          val = x.invert(d3.mouse(this)[0]);
          brush.extent([val, val]);
        }
        if (unit) {
          lbl.text(fmt(val) + ' ' + unit + ' ' + pct(val / scope.max));
        }
        scope.change({ val: val });
        handle.attr('cx', x(val));
        filled.attr('d', 'M0,0V0H' + x(val) + 'V0');
      }

      scope.$on('$destroy', function() {
        angular.element($window).unbind('orientationchange resize render', render);
      });

    }
  };
}]);
