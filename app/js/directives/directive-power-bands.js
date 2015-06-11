angular.module('app').directive('powerBands', ['$window', function ($window) {
  return {
    restrict: 'A',
    scope:{
      bands: '=',
      available: '='
    },
    link: function(scope, element) {
      var margin = {top: 20, right: 130, bottom: 20, left: 40},
          barHeight = 20,
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
          deployed = vis.append('g'),
          retracted = vis.append('g');

      // Create Y Axis SVG Elements
      vis.append('g').attr('class', 'watt axis');
      vis.append('g').attr('class', 'pct axis');
      vis.append("text").attr('x', -35).attr('y', 15).attr('class','primary').text('RET');
      vis.append("text").attr('x', -35).attr('y', barHeight + 17).attr('class','primary').text('DEP');

      var retLbl = vis.append("text").attr('y', 15);
      var depLbl = vis.append("text").attr('y', barHeight + 17);

      // Watch for changes to data and events
      scope.$watchCollection('available', render);
      angular.element($window).bind('orientationchange resize pwrchange', render);

      function render() {
        var bands = scope.bands,
            available = scope.available,
            width = element[0].offsetWidth,
            w = width - margin.left - margin.right,
            maxBand = bands[bands.length - 1],
            maxPwr = Math.max(available, maxBand.deployedSum);

        // Update chart size
        svg.attr('width', width).attr('height', height);

        // Remove existing elements
        retracted.selectAll('rect').remove();
        retracted.selectAll('text').remove();
        deployed.selectAll('rect').remove();
        deployed.selectAll('text').remove();

        // Update X & Y Axis
        wattScale.range([0, w]).domain([0, maxPwr]);
        pctScale.range([0, w]).domain([0, maxPwr / available]);

        vis.selectAll('.watt.axis').call(wattAxis);
        vis.selectAll('.pct.axis').attr('transform', 'translate(0,' + innerHeight + ')').call(pctAxis);

        retLbl
          .attr('x', wattScale(maxBand.retractedSum) + 5 )
          .attr('class',maxBand.retractedSum > available? 'warning': 'primary')
          .text(wattFmt(maxBand.retractedSum) + ' (' + pctFmt(maxBand.retractedSum / available) + ')');
        depLbl
          .attr('x', wattScale(maxBand.deployedSum) + 5 )
          .attr('class',maxBand.deployedSum > available? 'warning': 'primary')
          .text(wattFmt(maxBand.deployedSum) + ' (' + pctFmt(maxBand.deployedSum / available) + ')');

        retracted.selectAll("rect").data(bands).enter().append("rect")
          .attr("height", barHeight)
          .attr("width", function(d) { return d.retracted? (wattScale(d.retracted) - 1) : 0; })
          .attr("x", function(d) { return wattScale(d.retractedSum) - wattScale(d.retracted); })
          .attr('y', 1)
          .attr('class',function(d){ return (d.retractedSum > available)? 'warning' :'primary'; });

        retracted.selectAll("text").data(bands).enter().append("text")
          .attr('x', function(d) { return wattScale(d.retractedSum) - (wattScale(d.retracted) / 2); })
          .attr('y', 15)
          .style('text-anchor', 'middle')
          .attr('class','primary-bg')
          .text(function(d,i) { return bandText(d.retracted, i); });

        deployed.selectAll("rect").data(bands).enter().append("rect")
          .attr("height", barHeight)
          .attr("width", function(d) { return (d.deployed || d.retracted)? (wattScale(d.deployed + d.retracted) - 1) : 0; })
          .attr("x", function(d) { return wattScale(d.deployedSum) - wattScale(d.retracted) - wattScale(d.deployed); })
          .attr('y', barHeight + 2)
          .attr('class',function(d){ return (d.deployedSum > available)? 'warning' :'primary'; });

        deployed.selectAll("text").data(bands).enter().append("text")
          .attr('x', function(d) { return wattScale(d.deployedSum) - ((wattScale(d.retracted) + wattScale(d.deployed)) / 2); })
          .attr('y', barHeight + 17)
          .style('text-anchor', 'middle')
          .attr('class','primary-bg')
          .text(function(d,i) { return bandText(d.deployed + d.retracted, i); });

      }

      function bandText(val, index) {
        if (val > 0) {
          if( wattScale(val) > 100) {
            return (index + 1) + ' (' + wattFmt(val) + ' MW)';
          }
          if( wattScale(val) > 10) {
            return index + 1;
          }
        }
        return '';
      }

      scope.$on('$destroy', function() {
        angular.element($window).unbind('orientationchange resize pwrchange', render);
      });
    }
  };
}]);