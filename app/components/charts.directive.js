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

    // The number of datapoints
    vm.n = 21;

    vm.showGraph = showGraph;
    vm._chartSVG = {};
    vm.mouseover = mouseover;
    vm.dataset = [];

    vm.$onInit = onInit;
    vm.$onDestroy = onDestroy;

    ////

    function showGraph () {
      console.log('Render Graph');

      vm.x = d3.scaleTime()
          .rangeRound([0, vm._chartSVG.width]);

      vm.y = d3.scaleLinear()
          .rangeRound([vm._chartSVG.height, 0]);

      vm.line = d3.line()
        .x(function (d) { return vm.x(d.date)})
        .y(function (d) { return vm.y(d.value)});

      //TODO set domain depending on amount of datapoints
      if (vm.chartData.length == 1) {
        vm.x.domain([moment(vm.chartData[0][0]).subtract(1,'days'), moment(vm.chartData[0][0]).add(1,'days')]);
        vm.y.domain([vm.chartData[0][1]+vm.chartData[0][1], vm.chartData[0][1]-vm.chartData[0][1]]);
      } else {
        vm.x.domain(d3.extent(vm.chartData, function(d) { return d.date; }));
        vm.y.domain(d3.extent(vm.chartData, function(d) { return d.value; }));
      }

      // 3. Call the x axis in a group tag
      vm._chartSVG.g.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + vm._chartSVG.height + ")")
          .call(d3.axisBottom(vm.x)); // Create an axis component with d3.axisBottom

      // 4. Call the y axis in a group tag
      vm._chartSVG.g.append("g")
          .attr("class", "y axis")
          .call(d3.axisLeft(vm.y)) // Create an axis component with d3.axisLeft

      // text label for the y axis
      vm._chartSVG.g.append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 0 - vm._chartSVG.margin.left)
          .attr("x",0 - (vm._chartSVG.height / 2))
          .attr("dy", "1em")
          .style("text-anchor", "middle")
          .text("Value");

      // 9. Append the path, bind the data, and call the line generator
      vm._chartSVG.g.append("path")
          .attr("class", "line") // Assign a class for styling
          .attr("d", vm.line(vm.chartData)); // 11. Calls the line generator

      // 12. Appends a circle for each datapoint
      vm._chartSVG.g.selectAll(".dot")
          .data(vm.chartData)
        .enter().append("circle") // Uses the enter().append() method
          .attr("class", "dot") // Assign a class for styling
          .attr("cx", function(d) { return vm.x(d.date) })
          .attr("cy", function(d) { return vm.y(d.value) })
          .attr("r", 3.5)

      if ($scope.chart.chartData) {
        $scope.$watchCollection('chart.chartData', function (newValue, oldValue) {
          if (!angular.equals(newValue, oldValue)) {
            loadChartData();
          }
        }, true);
      }
    }

    function mouseover (d) {
      console.log('mouseover', d)
      // vm.y = d.y;
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
          .attr("r", 3.5)
    }

    function onInit () {
    }

    function onDestroy () {
      console.log('destroy graph');
    }
  }
})();
