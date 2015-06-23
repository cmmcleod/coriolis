angular.module('app').directive('powerBands', ['$window', function($window) {
  return {
    restrict: 'A',
    scope: {
      bands: '=',
      available: '='
    },
    link: function(scope, element) {
      var margin = { top: 20, right: 130, bottom: 20, left: 40 },
          barHeight = 20,
          bands = null,
          innerHeight = (barHeight * 2) + 3,
          height = innerHeight + margin.top + margin.bottom + 1,
          wattScale = d3.scale.linear(),
          pctScale = d3.scale.linear().domain([0, 1]),
          wattFmt = d3.format('.2f'),
          pctFmt = d3.format('.1%'),
          wattAxis = d3.svg.axis().scale(wattScale).outerTickSize(0).orient('top').tickFormat(d3.format('.2r')),
          pctAxis = d3.svg.axis().scale(pctScale).outerTickSize(0).orient('bottom').tickFormat(d3.format('%')),
          // Create chart
          svg = d3.select(element[0]).append('svg'),
          vis = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')'),
          deployed = vis.append('g').attr('class', 'power-band'),
          retracted = vis.append('g').attr('class', 'power-band');

      svg.on('contextmenu', function() {
          d3.event.preventDefault();
          for (var i = 0, l = bands.length; i < l; i++) {
            bands[i].retSelected = false;
            bands[i].depSelected = false;
          }
          render();
        });

      // Create Y Axis SVG Elements
      vis.append('g').attr('class', 'watt axis');
      vis.append('g').attr('class', 'pct axis');
      vis.append('text').attr('x', -35).attr('y', 16).attr('class', 'primary').text('RET');
      vis.append('text').attr('x', -35).attr('y', barHeight + 18).attr('class', 'primary').text('DEP');

      var retLbl = vis.append('text').attr('y', 16);
      var depLbl = vis.append('text').attr('y', barHeight + 18);

      // Watch for changes to data and events
      scope.$watchCollection('available', render);
      angular.element($window).bind('orientationchange resize pwrchange', render);

      function render() {
        bands = scope.bands;

        var available = scope.available,
            width = element[0].offsetWidth,
            w = width - margin.left - margin.right,
            maxBand = bands[bands.length - 1],
            deployedSum = 0,
            retractedSum = 0,
            retBandsSelected = false,
            depBandsSelected = false,
            maxPwr = Math.max(available, maxBand.retractedSum, maxBand.deployedSum);

        // Update chart size
        svg.attr('width', width).attr('height', height);

        // Remove existing elements
        retracted.selectAll('rect').remove();
        retracted.selectAll('text').remove();
        deployed.selectAll('rect').remove();
        deployed.selectAll('text').remove();

        // Update X & Y Axis
        wattScale.range([0, w]).domain([0, maxPwr]).clamp(true);
        pctScale.range([0, w]).domain([0, maxPwr / available]).clamp(true);
        vis.selectAll('.watt.axis').call(wattAxis);
        vis.selectAll('.pct.axis').attr('transform', 'translate(0,' + innerHeight + ')').call(pctAxis);

        for (var b = 0, l = bands.length; b < l; b++) {
          if (bands[b].retSelected) {
            retractedSum += bands[b].retracted + bands[b].retOnly;
            retBandsSelected = true;
          }
          if (bands[b].depSelected) {
            deployedSum += bands[b].deployed + bands[b].retracted;
            depBandsSelected = true;
          }
        }

        updateLabel(retLbl, w, retBandsSelected, retBandsSelected ? retractedSum : maxBand.retractedSum, available);
        updateLabel(depLbl, w, depBandsSelected, depBandsSelected ? deployedSum : maxBand.deployedSum, available);

        retracted.selectAll('rect').data(bands).enter().append('rect')
          .attr('height', barHeight)
          .attr('width', function(d) { return Math.max(wattScale(d.retracted + d.retOnly) - 1, 0); })
          .attr('x', function(d) { return wattScale(d.retractedSum) - wattScale(d.retracted + d.retOnly); })
          .attr('y', 1)
          .on('click', function(d) {
            d.retSelected = !d.retSelected;
            render();
          })
          .attr('class', function(d) { return getClass(d.retSelected, d.retractedSum, available); });

        retracted.selectAll('text').data(bands).enter().append('text')
          .attr('x', function(d) { return wattScale(d.retractedSum) - (wattScale(d.retracted + d.retOnly) / 2); })
          .attr('y', 15)
          .style('text-anchor', 'middle')
          .attr('class', 'primary-bg')
          .on('click', function(d) {
            d.retSelected = !d.retSelected;
            render();
          })
          .text(function(d, i) { return bandText(d.retracted + d.retOnly, i); });

        deployed.selectAll('rect').data(bands).enter().append('rect')
          .attr('height', barHeight)
          .attr('width', function(d) { return Math.max(wattScale(d.deployed + d.retracted) - 1, 0); })
          .attr('x', function(d) { return wattScale(d.deployedSum) - wattScale(d.retracted) - wattScale(d.deployed); })
          .attr('y', barHeight + 2)
          .on('click', function(d) {
            d.depSelected = !d.depSelected;
            render();
          })
          .attr('class', function(d) { return getClass(d.depSelected, d.deployedSum, available); });

        deployed.selectAll('text').data(bands).enter().append('text')
          .attr('x', function(d) { return wattScale(d.deployedSum) - ((wattScale(d.retracted) + wattScale(d.deployed)) / 2); })
          .attr('y', barHeight + 17)
          .style('text-anchor', 'middle')
          .attr('class', 'primary-bg')
          .on('click', function(d) {
            d.depSelected = !d.depSelected;
            render();
          })
          .text(function(d, i) { return bandText(d.deployed + d.retracted, i); });

      }

      function updateLabel(lbl, width, selected, sum, available) {
        lbl
          .attr('x', width + 5 )
          .attr('class', getClass(selected, sum, available))
          .text(wattFmt(Math.max(0, sum)) + ' (' + pctFmt(Math.max(0, sum / available)) + ')');
      }

      function getClass(selected, sum, available) {
        return selected ? 'secondary' : (sum > available) ? 'warning' : 'primary';
      }

      function bandText(val, index) {
        if (val > 0 && wattScale(val) > 13) {
          return index + 1;
        }
        return '';
      }

      scope.$on('$destroy', function() {
        angular.element($window).unbind('orientationchange resize pwrchange', render);
      });
    }
  };
}]);
