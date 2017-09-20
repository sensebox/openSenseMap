(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .directive('osemCharts', osemCharts);

  osemCharts.$inject = ['$timeout', '$location'];

  /* @ngInject */
  function osemCharts ($timeout, $location) {
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
        selectedMeasurement: '=',
        tooltipPlaceholder: '@'
      }
    };
    return directive;

    function link(scope, element, attrs, chartCtrl) {
      var svg = d3.select(element[0]).select('svg'),
          margin = {top: 20, right: 5, bottom: 30, left: 50, yAxis: 10},
          width = +element.parent()[0].offsetWidth - margin.right,
          height = +svg.attr("height") - margin.top - margin.bottom,
          g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      //Set width of parent element for SVG
      svg.attr("width", width);

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

  ChartController.$inject = ['$scope', '$location', 'moment'];

  function ChartController ($scope, $location, moment) {
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
    vm.exportChart = exportChart;

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

      svg.append('clipPath')
          .attr('id', 'clip')
        .append('rect')
          .attr('width', config.width - 60)
          .attr('height', config.height);

      // 3. Call the x axis in a group tag
      vm.xAxisGroup = g.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(" + config.margin.yAxis + "," + config.height + ")");

      // 4. Call the y axis in a group tag
      vm.yAxisGroup = g.append("g")
          .attr("class", "y axis")
          .attr("transform", "translate(" + config.margin.yAxis + ", 0)");

      // text label for the y axis
      if (vm.yAxisTitle !== '') {
        g.append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 0 - config.margin.left)
          .attr("x",0 - (config.height / 2))
          .attr("dy", "1em")
          .style("font-size","12px")
          .style("text-anchor", "middle")
          .text(vm.yAxisTitle);
      }

      vm.dots = g.append('g')
          .attr('class', 'dots')
          .attr('clip-path', 'url('+$location.path()+'#clip)')
          .attr("transform", "translate(" + config.margin.yAxis + ", 0)");

      if ($scope.chart.chartData) {

        // Inital chart creation
        loadChartData();

        $scope.$watch('chart.selectedMeasurement', function (newValue, oldValue) {
          if (angular.isDefined(newValue)) {
            selectDatapoint(newValue);
          } else {
            deselectDatapoint();
          }
        });

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

    function selectDatapoint(d) {
      d3.select(this).attr('r', 5.5);
      vm.datapoint.id = d.id;
      vm.datapoint.date = moment(d.date).format('LLLL');
      vm.datapoint.value = d.value;
      vm.datapoint.unit = d.unit;
      vm.datapoint.showPlaceholder = false;
    }

    function deselectDatapoint () {
      d3.select(this).attr('r', 2.5);
      vm.datapoint.showPlaceholder = true;
    }

    function mouseover (d) {
      selectDatapoint(d);
      var eventName = 'osemChartsMouseOver';
      $scope.$emit(eventName, vm.datapoint);
      $scope.$apply();
    }

    function mouseout () {
      deselectDatapoint();
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
      vm.yAxisGroup.call(vm.yAxis.tickFormat(d3.format(".1f")));

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

    function exportChart() {
      var svgString = getSVGString(vm._chartSVG.svg.node());
      svgString2Image( svgString, 2*vm._chartSVG.width, 2*vm._chartSVG.height, 'png' ); // passes Blob and filesize String to the callback
    }

    // Below are the functions that handle actual exporting:
    // getSVGString ( svgNode ) and svgString2Image( svgString, width, height, format, callback )
    function getSVGString( svgNode ) {
      svgNode.setAttribute('xlink', 'http://www.w3.org/1999/xlink');
      var cssStyleText = getCSSStyles( svgNode );
      appendCSS( cssStyleText, svgNode );

      var serializer = new XMLSerializer();
      var svgString = serializer.serializeToString(svgNode);
      svgString = svgString.replace(/(\w+)?:?xlink=/g, 'xmlns:xlink='); // Fix root xlink without namespace
      svgString = svgString.replace(/NS\d+:href/g, 'xlink:href'); // Safari NS namespace fix

      return svgString;

      function getCSSStyles( parentElement ) {
        var selectorTextArr = [];

        // Add Parent element Id and Classes to the list
        selectorTextArr.push( '#'+parentElement.id );
        for (var c = 0; c < parentElement.classList.length; c++)
            if ( !contains('.'+parentElement.classList[c], selectorTextArr) )
              selectorTextArr.push( '.'+parentElement.classList[c] );

        // Add Children element Ids and Classes to the list
        var nodes = parentElement.getElementsByTagName("*");
        for (var i = 0; i < nodes.length; i++) {
          var id = nodes[i].id;
          if ( !contains('#'+id, selectorTextArr) )
            selectorTextArr.push( '#'+id );

          var classes = nodes[i].classList;
          for (var c = 0; c < classes.length; c++)
            if ( !contains('.'+classes[c], selectorTextArr) )
              selectorTextArr.push( '.'+classes[c] );
        }

        // Extract CSS Rules
        var extractedCSSText = "";
        for (var i = 0; i < document.styleSheets.length; i++) {
          var s = document.styleSheets[i];

          try {
            if(!s.cssRules) continue;
          } catch( e ) {
            if(e.name !== 'SecurityError') throw e; // for Firefox
            continue;
          }

          var cssRules = s.cssRules;
          for (var r = 0; r < cssRules.length; r++) {
            if ( contains( cssRules[r].selectorText, selectorTextArr ) )
              extractedCSSText += cssRules[r].cssText;
          }
        }

        return extractedCSSText;

        function contains(str,arr) {
          return arr.indexOf( str ) === -1 ? false : true;
        }
      }
      function appendCSS( cssText, element ) {
        var styleElement = document.createElement("style");
        styleElement.setAttribute("type","text/css");
        styleElement.innerHTML = cssText;
        var refNode = element.hasChildNodes() ? element.children[0] : null;
        element.insertBefore( styleElement, refNode );
      }
    }

    function svgString2Image( svgString, width, height, format ) {
      var format = format ? format : 'png';

      var imgsrc = 'data:image/svg+xml;base64,'+ btoa( unescape( encodeURIComponent( svgString ) ) ); // Convert SVG string to data URL

      var canvas = document.createElement("canvas");
      var context = canvas.getContext("2d");

      canvas.width = width;
      canvas.height = height;

      var image = new Image();
      image.src = imgsrc;
      image.onload = function() {
        context.clearRect ( 0, 0, width, height );
        context.drawImage(image, 0, 0, width, height);

        var a = document.createElement("a");
        a.addEventListener('click', function(ev) {
          a.href = canvas.toDataURL("image/png");
          a.download = "chart.png";
        }, false);
        document.body.appendChild(a);
        a.click();
      };
    }
  }
})();
