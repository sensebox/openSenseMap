(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .directive('osemCharts', osemCharts);

  osemCharts.$inject = ['$timeout'];

  /* @ngInject */
  function osemCharts ($timeout) {
    var rmax = 30;
    var directive = {
      templateUrl: 'components/charts.directive.html',
      link: link,
      restrict: 'EA',
      transclude: true,
      controller: ChartController,
      controllerAs: 'chart',
      bindToController: true, // because the scope is isolated
      scope: {
        chartData: '='
      }
    };
    return directive;

    function link(scope, element, attrs, chartCtrl) {
      var svg = d3.select(element[0]).select('svg'),
          margin = {top: 20, right: 20, bottom: 30, left: 50},
          width = +svg.attr("width") - margin.left - margin.right,
          height = +svg.attr("height") - margin.top - margin.bottom,
          g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      var config = {
        svg: svg,
        margin: margin,
        width: width,
        height: height,
        g: g
      }

      chartCtrl._chartSVG = config;

      // Trick to wait for all rendering of the DOM to be finished.
      $timeout(function () {
        chartCtrl.showGraph();
      });
    }
  }

  ChartController.$inject = ['$scope', 'moment'];

  function ChartController ($scope, moment) {
    var vm = this;

    vm.showGraph = showGraph;
    vm._chartSVG = {};
    vm.dataset = [];
    vm.datapoint = {
      showPlaceholder: true,
      date: moment().format('LLLL'),
      value: 0.00,
      unit: '',
      tooltip: function () {
        if (this.showPlaceholder) {
          return 'Wähle einen Messpunkt.'
        }

        return this.date + ': ' + this.value + ' ' + this.unit;
      }
    };

    vm.$onInit = onInit;
    vm.$onDestroy = onDestroy;

    ////

    function showGraph () {
      console.log('Render Graph');

      var g = vm._chartSVG.g
          .attr('class', 'focus');

      vm.xScale = d3.scaleTime()
          .rangeRound([0, vm._chartSVG.width]);

      vm.yScale = d3.scaleLinear()
          .rangeRound([vm._chartSVG.height, 0]);

      var zoom = d3.zoom()
          .scaleExtent([1 / 4, 8])
          .translateExtent([[-vm._chartSVG.width, -Infinity], [2 * vm._chartSVG.width, Infinity]])
          .on("zoom", zoomed);

      var zoomRect = g.append("rect")
          .attr("width", vm._chartSVG.width)
          .attr("height", vm._chartSVG.height)
          .attr("fill", "none")
          .attr("pointer-events", "all")
          .call(zoom);

      g.append("clipPath")
          .attr("id", "clip")
        .append("rect")
          .attr("width", vm._chartSVG.width)
          .attr("height", vm._chartSVG.height);

      vm.line = d3.line()
        .x(function (d) { return vm.xScale(d.date)})
        .y(function (d) { return vm.yScale(d.value)});

      //TODO set domain depending on amount of datapoints
      if (vm.chartData.length == 1) {
        vm.xScale.domain([moment(vm.chartData[0][0]).subtract(1,'days'), moment(vm.chartData[0][0]).add(1,'days')]);
        vm.yScale.domain([vm.chartData[0][1]+vm.chartData[0][1], vm.chartData[0][1]-vm.chartData[0][1]]);
      } else {
        var xExtent = d3.extent(vm.chartData, function (d) { return d.date; });
        zoom.translateExtent([[vm.xScale(xExtent[0]), -Infinity], [vm.xScale(xExtent[1]), Infinity]]);
        vm.xScale.domain(d3.extent(vm.chartData, function(d) { return d.date; }));
        vm.yScale.domain(d3.extent(vm.chartData, function(d) { return d.value; }));
      }

      vm.xAxis = d3.axisBottom(vm.xScale)
      vm.yAxis = d3.axisLeft(vm.yScale);

      // .ticks(d3.utcHour.every(12)).tickFormat(function (d) {
      //   if (moment.utc(d).get('hour') > 0 ) {
      //     return moment.utc(d).format('HH:mm');
      //   } else {
      //     return moment.utc(d).format('L');
      //   }
      // });

      // 3. Call the x axis in a group tag
      vm.xGroup = g.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + vm._chartSVG.height + ")")
          .call(vm.xAxis); // Create an axis component with d3.axisBottom

      // 4. Call the y axis in a group tag
      g.append("g")
          .attr("class", "y axis")
          .call(vm.yAxis); // Create an axis component with d3.axisLeft

      // text label for the y axis
      g.append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 0 - vm._chartSVG.margin.left)
          .attr("x",0 - (vm._chartSVG.height / 2))
          .attr("dy", "1em")
          .style("text-anchor", "middle")
          .text("Value");

      // var temperatur = g.append('g')
      //     .attr('class', 'temperature')
      // temperatur.append('path').attr('clip-path', 'url(#clipper)').attr('class', 'line');
      // temperatur.select('path').transition().duration(500).attr('d', vm.line(vm.chartData));

      // 9. Append the path, bind the data, and call the line generator
      vm.linePath = g.append("path")
          .attr("class", "line") // Assign a class for styling
          .attr('clipPath', 'url(#clip)')
          .attr("d", vm.line(vm.chartData)); // 11. Calls the line generator

      zoomRect.call(zoom.transform, d3.zoomIdentity);
      // 12. Appends a circle for each datapoint
      // focus.append('g')
      //     .attr('class', 'dots')
      //     .selectAll("dot")
      //     .data(vm.chartData)
      //   .enter().append("circle") // Uses the enter().append() method
      //     .attr("class", "dot") // Assign a class for styling
      //     .attr("cx", function(d) { return vm.xScale(d.date) })
      //     .attr("cy", function(d) { return vm.yScale(d.value) })
      //     .attr("r", 2.5)
      //     .on('mouseover', mouseover)
      //     .on('mouseout', mouseout);

      // vm._chartSVG.svg.call(zoom);

      if ($scope.chart.chartData) {
        $scope.$watchCollection('chart.chartData', function (newValue, oldValue) {
          if (!angular.equals(newValue, oldValue)) {
            // loadChartData();
          }
        }, true);
      }
    }

    function zoomed() {
      console.log('zoom');

      var xz = d3.event.transform.rescaleX(vm.xScale);
      vm.xGroup.call(vm.xAxis.scale(xz));

      vm.line = d3.line()
        .x(function (d) { return xz(d.date)})
        .y(function (d) { return vm.yScale(d.value)});

      vm.linePath.attr("d", vm.line(vm.chartData));
      // var t = d3.event.transform, xt = t.rescaleX(vm.x);

      // re-scale y axis during zoom; ref [2]
      // vm.gX.transition().duration(50).call(vm.xAxis.scale(d3.event.transform.rescaleX(vm.x)));

      // re-draw circles using new y-axis scale; ref [3]
      // var new_x = d3.event.transform.rescaleX(vm.x);
      // vm.dots.attr("cy", function(d) { return new_x(d.value); });

      // var t = d3.event.transform, xt = t.rescaleX(vm.x);
      // vm._chartSVG.g.select(".line").attr("d", vm.line.x(function(d) { return xt(d.date); }));
      // vm._chartSVG.g.select(".x axis").call(vm.xAxis.scale(xt));

      // vm._chartSVG.svg.selectAll(".line")
      //   .attr("transform", d3.event.transform);
      // vm._chartSVG.svg.selectAll(".dot")
      //   .attr("transform", d3.event.transform);
      // d3.selectAll('.line').style("stroke-width", 2/d3.event.transform.k);
      // d3.selectAll('.dot').style("r", 2/d3.event.transform.k);
      // vm.gX.call(vm.xAxis.scale(d3.event.transform.rescaleX(vm.x)));
      // vm.gY.call(vm.yAxis.scale(d3.event.transform.rescaleY(vm.y)));

      // var xz = d3.event.transform.rescaleX(x);
      // xGroup.call(xAxis.scale(xz));
      // areaPath.attr("d", area.x(function(d) { return xz(d.date); }));
    }

    function mouseover (d) {
      vm.datapoint.date = moment(d.date).format('LLLL');
      vm.datapoint.value = d.value;
      vm.datapoint.unit = d.unit;
      vm.datapoint.showPlaceholder = !vm.datapoint.showPlaceholder;
      $scope.$apply();
    }

    function mouseout () {
      vm.datapoint.showPlaceholder = !vm.datapoint.showPlaceholder;
      $scope.$apply();
    }

    function loadChartData () {
      // Select the section we want to apply our changes to
      var svg = vm._chartSVG.svg.transition();
      var g = vm._chartSVG.g;

      //TODO set domain depending on amount of datapoints
      if (vm.chartData.length == 1) {
        vm.x.domain([moment(vm.chartData[0][0]).subtract(1,'days'), moment(vm.chartData[0][0]).add(1,'days')]);
        vm.y.domain([vm.chartData[0][1]+vm.chartData[0][1], vm.chartData[0][1]-vm.chartData[0][1]]);
      } else {
        vm.x.domain(d3.extent(vm.chartData, function(d) {
          return d.date;
        }));
        vm.y.domain(d3.extent(vm.chartData, function(d) {
          return d.value;
        }));
      }

      // Make the changes
      svg.select(".line")   // change the line
        .duration(750)
        .attr("d", vm.line(vm.chartData));
      svg.select(".x.axis") // change the x axis
          .duration(750)
          .call(d3.axisBottom(vm.x));
      svg.select(".y.axis") // change the y axis
          .duration(750)
          .call(d3.axisLeft(vm.y));
      g.selectAll("circle") // change the y axis
          .data(vm.chartData)
          .transition()
          .duration(750)
          .attr("cx", function(d) {
            return vm.x(d.date);
          })
          .attr("cy", function(d) {
            return vm.y(d.value);
          })
          .attr("r", 3.5)
      g.selectAll(".dot")
          .data(vm.chartData)
        .enter().append("circle") // Uses the enter().append() method
          .attr("class", "dot") // Assign a class for styling
          .attr("cx", function(d) { return vm.x(d.date) })
          .attr("cy", function(d) { return vm.y(d.value) })
          .attr("r", 2.5)
    }

    function onInit () {
    }

    function onDestroy () {
      console.log('destroy graph');
    }
  }
})();
