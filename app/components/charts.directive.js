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
        data: '='
      }
    };
    return directive;

    function link(scope, element, attrs, chartCtrl) {
      var svg = d3.select(element[0]).select('svg'),
          margin = {top: 20, right: 20, bottom: 30, left: 50},
          width = +svg.attr("width") - margin.left - margin.right,
          height = +svg.attr("height") - margin.top - margin.bottom,
          g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      chartCtrl._chartSVG = g;

      var n = 21;

      // 5. X scale will use the index of our data
      var xScale = d3.scaleLinear()
          .domain([0, n-1]) // input
          .range([0, width]); // output

      // 6. Y scale will use the randomly generate number
      var yScale = d3.scaleLinear()
          .domain([0, 1]) // input
          .range([height, 0]); // output

      // 7. d3's line generator
      var line = d3.line()
          .x(function(d, i) { return xScale(i); }) // set the x values for the line generator
          .y(function(d) { return yScale(d.y); }) // set the y values for the line generator
          .curve(d3.curveMonotoneX) // apply smoothing to the line

      // 8. An array of objects of length N. Each object has key -> value pair, the key being "y" and the value is a random number
      var dataset = d3.range(n).map(function(d) { return {"y": d3.randomUniform(1)() } })

      // 3. Call the x axis in a group tag
      g.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(xScale)); // Create an axis component with d3.axisBottom

      // 4. Call the y axis in a group tag
      g.append("g")
          .attr("class", "y axis")
          .call(d3.axisLeft(yScale)); // Create an axis component with d3.axisLeft

      // 9. Append the path, bind the data, and call the line generator
      g.append("path")
          .datum(dataset) // 10. Binds data to the line
          .attr("class", "line") // Assign a class for styling
          .attr("d", line); // 11. Calls the line generator

      // 12. Appends a circle for each datapoint
      g.selectAll(".dot")
          .data(dataset)
        .enter().append("circle") // Uses the enter().append() method
          .attr("class", "dot") // Assign a class for styling
          .attr("cx", function(d, i) { return xScale(i) })
          .attr("cy", function(d) { return yScale(d.y) })
          .attr("r", 5)
          .on('mouseover', chartCtrl.mouseover)
          .on('mouseout', function (d) { console.log('mouseout', d)})

      // Trick to wait for all rendering of the DOM to be finished.
      $timeout(function () {
        chartCtrl.showGraph();
      });

      // var parseTime = d3.timeParse("%d-%b-%y");

      // var x = d3.scaleTime()
      //     .rangeRound([0, width]);

      // var y = d3.scaleLinear()
      //     .rangeRound([height, 0]);

      // var line = d3.line()
      //     .x(function(d,i) { return x(i); })
      //     .y(function(d) { return y(d); });

      // // create a simple data array that we'll plot with a line (this array represents only the Y values, X will just be the index location)
      // var data = [3, 6, 2, 7, 5, 2, 0, 3, 8, 9, 2, 5, 9, 3, 6, 3, 6, 2, 7, 5, 2, 1, 3, 8, 9, 2, 5, 9, 2, 7];

      // scope.$watch('data', function (oldVal, newVal) {
      //   console.log('oldVal', oldVal);
      //   console.log('newVal', newVal);

      //   if (angular.isUndefined(newVal)) {
      //     return;
      //   }

      //   x.domain(d3.extent(data, function(d,i) { return i; }));
      //   y.domain(d3.extent(data, function(d) { return d; }));

      //   g.append("g")
      //     .attr("transform", "translate(0," + height + ")")
      //     .call(d3.axisBottom(x));

      //   g.append("g")
      //     .call(d3.axisLeft(y))
      //   .append("text")
      //     .attr("fill", "#000")
      //     .attr("transform", "rotate(-90)")
      //     .attr("y", 6)
      //     .attr("dy", "0.71em")
      //     .attr("text-anchor", "end")
      //     .text("Price ($)");

      //   g.append("path")
      //     .attr("fill", "none")
      //     .attr("stroke", "steelblue")
      //     .attr("stroke-linejoin", "round")
      //     .attr("stroke-linecap", "round")
      //     .attr("stroke-width", 1.5)
      //     .attr("d", line);
      // });

      // scope.$watchCollection('data', function () {
      //   console.log('watch');
      // });
    }
  }

  ChartController.$inject = ['$scope', '$q'];

  function ChartController ($scope, $q) {
    var vm = this;
    vm.y = "Test";

    vm.showGraph = showGraph;
    vm._chartSVG;
    vm.mouseover = mouseover;

    vm.$onInit = onInit;

    ////

    function showGraph () {
      console.log('Render Graph');

      console.log(vm._chartSVG);
      // The number of datapoints
      // var n = 21;

      // // 5. X scale will use the index of our data
      // var xScale = d3.scaleLinear()
      //     .domain([0, n-1]) // input
      //     .range([0, width]); // output

      // // 6. Y scale will use the randomly generate number
      // var yScale = d3.scaleLinear()
      //     .domain([0, 1]) // input
      //     .range([height, 0]); // output

      // // 7. d3's line generator
      // var line = d3.line()
      //     .x(function(d, i) { return xScale(i); }) // set the x values for the line generator
      //     .y(function(d) { return yScale(d.y); }) // set the y values for the line generator
      //     .curve(d3.curveMonotoneX) // apply smoothing to the line

      // // 8. An array of objects of length N. Each object has key -> value pair, the key being "y" and the value is a random number
      // var dataset = d3.range(n).map(function(d) { return {"y": d3.randomUniform(1)() } })

      // // 3. Call the x axis in a group tag
      // svg.append("g")
      //     .attr("class", "x axis")
      //     .attr("transform", "translate(0," + height + ")")
      //     .call(d3.axisBottom(xScale)); // Create an axis component with d3.axisBottom

      // // 4. Call the y axis in a group tag
      // svg.append("g")
      //     .attr("class", "y axis")
      //     .call(d3.axisLeft(yScale)); // Create an axis component with d3.axisLeft

      // // 9. Append the path, bind the data, and call the line generator
      // svg.append("path")
      //     .datum(dataset) // 10. Binds data to the line
      //     .attr("class", "line") // Assign a class for styling
      //     .attr("d", line); // 11. Calls the line generator

      // // 12. Appends a circle for each datapoint
      // svg.selectAll(".dot")
      //     .data(dataset)
      //   .enter().append("circle") // Uses the enter().append() method
      //     .attr("class", "dot") // Assign a class for styling
      //     .attr("cx", function(d, i) { return xScale(i) })
      //     .attr("cy", function(d) { return yScale(d.y) })
      //     .attr("r", 5)

      if ($scope.chart.data) {
        $scope.$watchCollection('chart.data', function () {
          console.log('Watch data');
          // loadChartData();
        });
      }
    }

    function mouseover (d) {
      console.log('mouseover', d)
      vm.y = d.y;
      $scope.$apply();
    }

    function loadChartData () {

    }

    function onInit () {
      console.log('CTRL: vm.data = $s', vm.data);
    }
  }
})();
