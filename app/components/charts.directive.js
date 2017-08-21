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
        chartData: '=',
        yAxisTitle: '='
      }
    };
    return directive;

    function link(scope, element, attrs, chartCtrl) {
      var svg = d3.select(element[0]).select('svg'),
          margin = {top: 20, right: 0, bottom: 30, left: 50},
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
          return 'Für Details fahre mit der Maus über die Messpunkte'
        }
        return this.date + ': ' + this.value + ' ' + this.unit;
      }
    };

    vm.zoomIn = zoomIn;
    vm.zoomOut = zoomOut;
    vm.resetZoom = resetZoom;

    vm.$onInit = onInit;
    vm.$onDestroy = onDestroy;

    ////

    var zoom;

    function showGraph () {
      console.log('Render Graph');
      console.log(vm.chartData);

      var config = vm._chartSVG;

      var g = vm._chartSVG.g
          .attr('class', 'focus');
      var svg = vm._chartSVG.svg;

      //Scales for xAxis and yAxis
      vm.xScale = d3.scaleTime()
          .rangeRound([0, config.width]);

      vm.yScale = d3.scaleLinear()
          .rangeRound([config.height, 0]);

      //Setup zoom behaviour
      zoom = d3.zoom()
          .extent([[0, config.height], [config.width, 0]])
          .scaleExtent([1, 64])
          .translateExtent([[0, config.height], [config.width, 0]])
          .on('zoom', zoomed);

      g.call(zoom);

      //Set domains depending on amount of datapoints
      if (vm.chartData.length == 1) {
        vm.xScale.domain([moment(vm.chartData[0][0]).subtract(1,'days'), moment(vm.chartData[0][0]).add(1,'days')]);
        vm.yScale.domain([vm.chartData[0][1]+vm.chartData[0][1], vm.chartData[0][1]-vm.chartData[0][1]]);
      } else {
        vm.xScale.domain(d3.extent(vm.chartData, function (d) { return d.date; }));
        var yExtent = d3.extent(vm.chartData, function(d) { return d.value; });
        yExtent[0] = yExtent[0] - 1;
        yExtent[1] = yExtent[1] + 1;
        vm.yScale.domain(yExtent);
      }

      //Create Axis and wire up with scale
      vm.xAxis = d3.axisBottom(vm.xScale).ticks(4)
      vm.yAxis = d3.axisLeft(vm.yScale);

      //Line constructor
      vm.line = d3.line()
        .x(function (d) { return vm.xScale(d.date)})
        .y(function (d) { return vm.yScale(d.value)});

      var zoomRect = g.append('rect')
          .attr('class', 'zoom-panel')
          .attr('width', config.width)
          .attr('height', config.height)
          .attr('fill', 'none')
          .attr('pointer-events', 'all');

      g.append('defs').append('clipPath')
          .attr('id', 'clipper')
          .append('rect')
            .attr('width', config.width)
            .attr('height', config.height);

      // 3. Call the x axis in a group tag
      vm.x_Axis = g.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + config.height + ")")
          .call(vm.xAxis); // Create an axis component with d3.axisBottom

      // 4. Call the y axis in a group tag
      g.append("g")
          .attr("class", "y axis")
          .call(vm.yAxis);// Create an axis component with d3.axisLeft

      // text label for the y axis
      if (vm.yAxisTitle !== '') {
        g.append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 0 - config.margin.left)
          .attr("x",0 - (config.height / 2))
          .attr("dy", "1em")
          .style("text-anchor", "middle")
          .text(vm.yAxisTitle);
      }

      // g.append('path')
      //     .datum(vm.chartData)
      //     .attr('class', 'line')
      //     .attr('clip-path','url(#clipper)')
      //     .attr('d', vm.line);

      g.append('g')
          .attr('class', 'dots')
          .attr('clip-path', 'url(#clipper)')
          .selectAll('circle')
          .data(vm.chartData, function (d) {
            return d.value;
          })
          .enter()
          .append('circle')
          .attr('class', 'dot')
          .on('mouseover', mouseover)
          .on('mouseout', mouseout);

      g.selectAll('circle')
          .attr('cy', function (d) {
            return vm.yScale(d.value);
          })
          .attr('cx', function (d) {
            return vm.xScale(d.date);
          })
          .attr('r', 2.5);

      g.selectAll('.x.axis .tick text')
          .text(customTickFormat);

      if ($scope.chart.chartData) {
        $scope.$watchCollection('chart.chartData', function (newValue, oldValue) {
          if (!angular.equals(newValue, oldValue)) {
            loadChartData();
          }
        }, true);
      }
    }

    function customTickFormat (d, i) {
      var domain = vm.xAxis.scale().domain();
      var tick;

      var min = moment(domain[0]);
      var max = moment(domain[1]);
      var diff = max.diff(min, 'hours');

      if (max.diff(min, 'days') >= 1) {
        if (i % 2 === 0) {
          tick = moment(d).format('l');
        } else {
          tick = moment(d).format('LT');
        }
      } else if (max.diff(min, 'hours') >= 12) {
        if (i % 2 === 0) {
          tick = moment(d).format('ll');
        } else {
          tick = moment(d).format('LT');
        }
      } else if (max.diff(min, 'hours') >= 6) {
        tick = moment(d).format('LT');
      } else if (max.diff(min, 'hours') >= 1) {
        tick = moment(d).format('LT');
      } else if (max.diff(min, 'hours') < 1) {
        tick = moment(d).format('LT');
      }
      return tick;
    }

    function zoomed() {
      var transform = d3.event.transform;
      var xNewScale = transform.rescaleX(vm.xScale);
      vm.xAxis.scale(xNewScale);
      var g = vm._chartSVG.g;
      g.select('.x.axis').call(vm.xAxis);
      g.selectAll('.x.axis .tick text').text(customTickFormat);
      g.selectAll('circle').attr('cx', function (d) {
        return xNewScale(d.date);
      });
      g.select('.line').attr('d', vm.line.x(function (d) {
        return xNewScale(d.date);
      }));
    }

    function mouseover (d) {
      vm.datapoint.date = moment(d.date).format('LLLL');
      vm.datapoint.value = d.value;
      vm.datapoint.unit = d.unit;
      vm.datapoint.showPlaceholder = !vm.datapoint.showPlaceholder;
      var eventName = 'osemChartsMouseOver';
      $scope.$emit(eventName, vm.datapoint);
      $scope.$apply();
    }

    function mouseout () {
      vm.datapoint.showPlaceholder = !vm.datapoint.showPlaceholder;
      var eventName = 'osemChartsMouseOut';
      $scope.$emit(eventName, {});
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
        vm.xScale.domain(d3.extent(vm.chartData, function(d) {
          return d.date;
        }));
        var yExtent = d3.extent(vm.chartData, function(d) { return d.value; });
        yExtent[0] = yExtent[0] - 1;
        yExtent[1] = yExtent[1] + 1;
        vm.yScale.domain(yExtent);
      }
      vm.xAxis = d3.axisBottom(vm.xScale).ticks(4);
      // Make the changes
      // svg.select(".line")   // change the line
      //   .duration(750)
      //   .attr("d", vm.line(vm.chartData));
      svg.select(".x.axis")  // change the x axis
          .transition()
          .duration(750)
          .ease(d3.easeLinear, 2)
          .call(vm.xAxis);
      g.selectAll('.x.axis .tick text')
          .text(customTickFormat);
      // svg.selectAll('.x.axis .tick text').text(customTickFormat);
      // svg.select(".y.axis") // change the y axis
      //     .transition()
      //     .duration(750)
      //     .ease(d3.easeLinear, 2)
      //     .call(vm.yAxis);
      // g.selectAll("dots")
      //     .selectAll('circle')
      //     .data(vm.chartData, function (d) {
      //       return d.value;
      //     })
      //     .enter().append("circle") // Uses the enter().append() method
      //     .attr("class", "dot") // Assign a class for styling
      //     .attr("cx", function(d) { return vm.xScale(d.date) })
      //     .attr("cy", function(d) { return vm.yScale(d.value) })
      //     .attr("r", 2.5)
      //     .transition()
      //     .duration(750);

          // .attr("cx", function(d) {
          //   return vm.xScale(d.date);
          // })
          // .attr("cy", function(d) {
          //   return vm.yScale(d.value);
          // })
          // .attr("r", 2.5)
      // g.selectAll(".dot")
      //     .data(vm.chartData)
      //   .enter().append("circle") // Uses the enter().append() method
      //     .attr("class", "dot") // Assign a class for styling
      //     .attr("cx", function(d) { return vm.xScale(d.date) })
      //     .attr("cy", function(d) { return vm.yScale(d.value) })
      //     .attr("r", 2.5)
    }

    function zoomIn () {
      transition(zoom.scaleBy, 1.2);
    }

    function zoomOut () {
      transition(zoom.scaleBy, 0.8);
    }

    function resetZoom () {
      transition(zoom.scaleTo, 1)
    }

    function transition(zoomFunction, zoomLevel) {
      vm._chartSVG.g.transition()
      .delay(100)
      .duration(700)
      .call(zoomFunction, zoomLevel);
}

    function onInit () {
    }

    function onDestroy () {
      console.log('destroy graph');
    }
  }
})();
