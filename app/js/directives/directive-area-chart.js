angular.module('app').directive('areaChart', function () {


  return {
    restrict: 'A',
    scope:{
      config: '=',
      series: '=',
      height: '=',
      width: '='
    },
    link: function(scope, element) {
      var width = element[0].parentElement.offsetWidth,
          height = width * 0.6,
          series = scope.series,
          config = scope.config,
          labels = config.labels,
          margin = {top: 15, right: 15, bottom: 35, left: 50},
          w = width - margin.left - margin.right,
          h = height - margin.top - margin.bottom,
          fmt = d3.format('.3r'),
          fmtLong = d3.format('.2f');

      // Create chart
      var svg = d3.select(element[0]).append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // Define Axes
      var x = d3.scale.linear().range([0, w]);
      var y = d3.scale.linear().range([h, 0]);
      var xAxis = d3.svg.axis().outerTickSize(0).orient("bottom").tickFormat(fmt);
      var yAxis = d3.svg.axis().outerTickSize(0).orient("left").tickFormat(fmt);
      // Define Area
      var area = d3.svg.area().x(function(d) { return x(d[0]); }).y0(h).y1(function(d) { return y(d[1]); });

      var gradient = svg.append("defs")
        .append("linearGradient")
        .attr("id", "gradient")
        .attr("x1", "0%").attr("y1", "0%")
        .attr("x2", "100%").attr("y2", "100%")
        .attr("spreadMethod", "pad");
      gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#ff8c0d")
        .attr("stop-opacity", 1);
      gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#ff3b00")
        .attr("stop-opacity", 1);

      // Create Y Axis SVG Elements
      svg.append("g").attr("class", "y axis")
        .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", -40)
          .attr("x", -h/2)
          .attr("dy", ".1em")
          .style("text-anchor", "middle")
          .text(labels.yAxis.title + ' (' + labels.yAxis.unit + ')');
      // Create X Axis SVG Elements
      svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + h + ")")
        .append("text")
          .attr("y", 30)
          .attr("x", w/2)
          .attr("dy", ".1em")
          .style("text-anchor", "middle")
          .text(labels.xAxis.title + ' (' + labels.xAxis.unit + ')');

      // Create and Add tooltip
      var tip = svg.append("g").style("display", "none");
      tip.append("circle")
        .attr("class", "marker")
        .attr("r", 4);
      tip.append("text").attr("class", 'label x').attr("y", -2);
      tip.append("text").attr("class", 'label y').attr("y", '0.7em');



      /**
       * Watch for changes in the series data (mass changes, etc)
       */
      scope.$watchCollection('series', render);
      scope.$watchCollection('config.watch', render);

      function render() {
        var data = [];
        var func = series.func;
        for (var d = series.xMin; d <= series.xMax; d++) {
          data.push([ d, func(d) ]);
        }
        // Update domain and scale for axes;
        x.domain([series.xMin, series.xMax]);
        xAxis.scale(x);
        y.domain([data[data.length - 1][1], data[0][1]]);
        yAxis.scale(y);
        svg.selectAll(".y.axis").call(yAxis);
        svg.selectAll(".x.axis").call(xAxis);

        // Remove existing elements
        svg.selectAll('path.area').remove();

        svg.insert("path",':first-child')   // Area/Path to appear behind everything else
          .datum(data)
          .attr("class", "area")
          .attr('fill', 'url(#gradient)')
          .attr("d", area)
          .on("mouseover", function() { tip.style("display", null); })
          .on("mouseout", function() { tip.style("display", "none"); })
          .on('mousemove', function() {
            var xPos = d3.mouse(this)[0], x0 = x.invert(xPos), y0 = func(x0), flip = (xPos > w * 0.75);
            tip.attr("transform", "translate(" + x(x0) + "," + y(y0) + ")");
            tip.selectAll('text.label').attr("x", flip? -10 : 10).style("text-anchor", flip? 'end' : 'start');
            tip.select('text.label.x').text(fmtLong(x0) + ' ' + labels.xAxis.unit);
            tip.select('text.label.y').text(fmtLong(y0) + ' ' + labels.yAxis.unit);
          });
      }

    }
  };
});