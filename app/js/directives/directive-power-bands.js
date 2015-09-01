angular.module('app').directive('powerBands', ['$window', '$translate', '$rootScope', function($window, $translate, $rootScope) {
  return {
    restrict: 'A',
    scope: {
      bands: '=',
      available: '='
    },
    link: function(scope, element) {
      var bands = null,
          available = 0,
          maxBand,
          maxPwr,
          deployedSum = 0,
          retractedSum = 0,
          retBandsSelected = false,
          depBandsSelected = false,
          wattScale = d3.scale.linear(),
          pctScale = d3.scale.linear().domain([0, 1]),
          wattFmt,
          pctFmt,
          wattAxis = d3.svg.axis().scale(wattScale).outerTickSize(0).orient('top'),
          pctAxis = d3.svg.axis().scale(pctScale).outerTickSize(0).orient('bottom'),
          // Create chart
          svg = d3.select(element[0]).append('svg'),
          vis = svg.append('g'),
          deployed = vis.append('g').attr('class', 'power-band'),
          retracted = vis.append('g').attr('class', 'power-band');

      svg.on('contextmenu', function() {
        if (!d3.event.shiftKey) {
          d3.event.preventDefault();
          for (var i = 0, l = bands.length; i < l; i++) {
            bands[i].retSelected = false;
            bands[i].depSelected = false;
          }
          dataChange();
        }
      });

      // Create Y Axis SVG Elements
      vis.append('g').attr('class', 'watt axis');
      vis.append('g').attr('class', 'pct axis');
      var retText = vis.append('text').attr('x', -3).style('text-anchor', 'end').attr('dy', '0.5em').attr('class', 'primary upp');
      var depText = vis.append('text').attr('x', -3).style('text-anchor', 'end').attr('dy', '0.5em').attr('class', 'primary upp');
      var retLbl = vis.append('text').attr('dy', '0.5em');
      var depLbl = vis.append('text').attr('dy', '0.5em');

      updateFormats(true);

      function dataChange() {
        bands = scope.bands;
        available = scope.available;
        maxBand = bands[bands.length - 1];
        deployedSum = 0;
        retractedSum = 0;
        retBandsSelected = false;
        depBandsSelected = false;
        maxPwr = Math.max(available, maxBand.retractedSum, maxBand.deployedSum);

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

        render();
      }

      function render() {
        var size = $rootScope.sizeRatio,
            mTop = Math.round(25 * size),
            mRight = Math.round(130 * size),
            mBottom = Math.round(25 * size),
            mLeft = Math.round(45 * size),
            barHeight = Math.round(20 * size),
            width = element[0].offsetWidth,
            innerHeight = (barHeight * 2) + 2,
            height = innerHeight + mTop + mBottom,
            w = width - mLeft - mRight,
            repY = (barHeight / 2),
            depY = (barHeight * 1.5) - 1;

        // Update chart size
        svg.attr('width', width).attr('height', height);
        vis.attr('transform', 'translate(' + mLeft + ',' + mTop + ')');

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

        retText.attr('y', repY);
        depText.attr('y', depY);
        updateLabel(retLbl, w, repY, retBandsSelected, retBandsSelected ? retractedSum : maxBand.retractedSum, available);
        updateLabel(depLbl, w, depY, depBandsSelected, depBandsSelected ? deployedSum : maxBand.deployedSum, available);

        retracted.selectAll('rect').data(bands).enter().append('rect')
          .attr('height', barHeight)
          .attr('width', function(d) { return Math.ceil(Math.max(wattScale(d.retracted + d.retOnly), 0)); })
          .attr('x', function(d) { return Math.floor(Math.max(wattScale(d.retractedSum) - wattScale(d.retracted + d.retOnly), 0)); })
          .attr('y', 1)
          .on('click', function(d) {
            d.retSelected = !d.retSelected;
            dataChange();
          })
          .attr('class', function(d) { return getClass(d.retSelected, d.retractedSum, available); });

        retracted.selectAll('text').data(bands).enter().append('text')
          .attr('x', function(d) { return wattScale(d.retractedSum) - (wattScale(d.retracted + d.retOnly) / 2); })
          .attr('y', repY)
          .attr('dy', '0.5em')
          .style('text-anchor', 'middle')
          .attr('class', 'primary-bg')
          .on('click', function(d) {
            d.retSelected = !d.retSelected;
            dataChange();
          })
          .text(function(d, i) { return bandText(d.retracted + d.retOnly, i); });

        deployed.selectAll('rect').data(bands).enter().append('rect')
          .attr('height', barHeight)
          .attr('width', function(d) { return Math.ceil(Math.max(wattScale(d.deployed + d.retracted), 0)); })
          .attr('x', function(d) { return Math.floor(Math.max(wattScale(d.deployedSum) - wattScale(d.retracted) - wattScale(d.deployed), 0)); })
          .attr('y', barHeight + 1)
          .on('click', function(d) {
            d.depSelected = !d.depSelected;
            dataChange();
          })
          .attr('class', function(d) { return getClass(d.depSelected, d.deployedSum, available); });

        deployed.selectAll('text').data(bands).enter().append('text')
          .attr('x', function(d) { return wattScale(d.deployedSum) - ((wattScale(d.retracted) + wattScale(d.deployed)) / 2); })
          .attr('y', depY)
          .attr('dy', '0.5em')
          .style('text-anchor', 'middle')
          .attr('class', 'primary-bg')
          .on('click', function(d) {
            d.depSelected = !d.depSelected;
            dataChange();
          })
          .text(function(d, i) { return bandText(d.deployed + d.retracted, i); });
      }

      function updateLabel(lbl, width, y, selected, sum, avail) {
        lbl
          .attr('x', width + 5 )
          .attr('y', y)
          .attr('class', getClass(selected, sum, avail))
          .text(wattFmt(Math.max(0, sum)) + ' (' + pctFmt(Math.max(0, sum / avail)) + ')');
      }

      function getClass(selected, sum, avail) {
        return selected ? 'secondary' : (sum >= avail) ? 'warning' : 'primary';
      }

      function bandText(val, index) {
        if (val > 0 && wattScale(val) > 13) {
          return index + 1;
        }
        return '';
      }

      function updateFormats(preventRender) {
        retText.text($translate.instant('ret'));
        depText.text($translate.instant('dep'));
        wattFmt = $rootScope.localeFormat.numberFormat('.2f');
        pctFmt = $rootScope.localeFormat.numberFormat('.1%');
        wattAxis.tickFormat($rootScope.localeFormat.numberFormat('.2r'));
        pctAxis.tickFormat($rootScope.localeFormat.numberFormat('%'));
        if (!preventRender) {
          render();
        }
      }

      // Watch for changes to data and events
      angular.element($window).bind('pwrchange', dataChange);
      angular.element($window).bind('orientationchange resize', render);
      scope.$watchCollection('available', dataChange);
      scope.$on('languageChanged', updateFormats);
      scope.$on('$destroy', function() {
        angular.element($window).unbind('orientationchange resize pwrchange', render);
      });
    }
  };
}]);
