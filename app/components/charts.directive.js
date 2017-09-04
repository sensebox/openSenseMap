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
        yAxisTitle: '=',
        tooltipPlaceholder: '@'
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
          return vm.tooltipPlaceholder
        }
        return this.date + ': ' + this.value + ' ' + this.unit;
      }
    };

    vm.zoomIn = zoomIn;
    vm.zoomOut = zoomOut;
    vm.resetZoom = resetZoom;

    ////

    var zoom;

    function showGraph () {
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

      vm.xAxis = d3.axisBottom().ticks(4);
      vm.yAxis = d3.axisLeft();

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
      vm.xAxisGroup = g.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + config.height + ")");

      // 4. Call the y axis in a group tag
      vm.yAxisGroup = g.append("g")
          .attr("class", "y axis");

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

      vm.dots = g.append('g')
          .attr('class', 'dots')
          .attr('clip-path', 'url(#clipper)');

      if ($scope.chart.chartData) {

        // Inital chart creation
        loadChartData();

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
    }

    function mouseover (d) {
      vm.datapoint.index = d.index;
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
      console.log(vm.chartData);
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

      // Update yAxis
      vm.yAxis.scale(vm.yScale);
      vm.yAxisGroup.call(vm.yAxis);

      // Update xAxis
      vm.xAxis.scale(vm.xScale);
      vm.xAxisGroup.call(vm.xAxis);

      var circle = vm.dots.selectAll('circle').data(vm.chartData)

      // Remove old data
      circle.exit().remove();

      // Append new and ...
      circle.enter().append('circle')
          .attr('class', 'dot')
          .attr('r', 0)
        .merge(circle) // ... with existing data
          .on('mouseover', mouseover)
          .on('mouseout', mouseout)
          .attr('cy', function (d) {
            return vm.yScale(d.value);
          })
          .attr('cx', function (d) {
            return vm.xScale(d.date);
          })
          .transition()
          .duration(750)
          .ease(d3.easeLinear, 2)
            .attr('r', 2.5);

      // Format ticks
      g.selectAll('.x.axis .tick text')
        .text(customTickFormat);
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
  }
})();
