/*global angular */
'use strict';

var app = angular.module("app", ["ngRoute","ngResource","leaflet-directive", "xeditable", "angles"])

app.config(function($routeProvider) {
    $routeProvider
    	.when('/',
      	{
        	templateUrl: "views/app.html",
        	controller: "AppCtrl"
      	})
      	.when('/explore', {
        	templateUrl: "views/explore.html",
        	controller: "ExploreCtrl"
      	})
        .when('/explore/:state', {
          templateUrl: "views/explore.html",
          controller: "ExploreCtrl"
        })
      	.when('/upload', {
        	templateUrl: "views/upload.html",
        	controller: "UploadCtrl"
      	})
      	.when('/about', {
        	templateUrl: "views/about.html",
        	controller: "AboutCtrl"
      	})
        .when('/register', {
          templateUrl: "views/register.html",
          controller: "RegisterCtrl"
        })
        .when('/chart', {
          templateUrl: "views/chart.html",
          controller: "mainCtrl"
        })
      	.otherwise({
        	template: "This doesn't exist!"
      	})
});

app.factory('OpenSenseBoxes', function($resource){
    return $resource('http://opensensemap.org:8000/boxes', {})
});

app.run(function ($rootScope) {
  $rootScope.$on('$viewContentLoaded', function() {
    $(document).foundation();
  });
});

app.controller("AppCtrl", function($scope) {
    
});

app.controller("ExploreCtrl", function($scope, OpenSenseBoxes, $http) {

  $scope.chart = {
    labels : ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    datasets : [
        {
            fillColor : "rgba(151,187,205,0)",
            strokeColor : "#e67e22",
            pointColor : "rgba(151,187,205,0)",
            pointStrokeColor : "#e67e22",
            data : [45, 32, 51, 44, 63]
        },
        {
            fillColor : "rgba(151,187,205,0)",
            strokeColor : "#f1c40f",
            pointColor : "rgba(151,187,205,0)",
            pointStrokeColor : "#f1c40f",
            data : [17.4, 19.8, 20.1, 15.3, 14.5]
        }
    ], 
  };

  $scope.options = {
    
  }

  $scope.data = {};
  $scope.accordion = {};
  $scope.accordion.active = "";
  $scope.selected = {};

  OpenSenseBoxes.query(function(response) {
    // Assign the response INSIDE the callback
    $scope.data.boxes = response;
  });

  $scope.show = function (boxId){
    var elem = "#"+boxId;
    if (boxId != "") {
      $http.get("http://opensensemap.org:8000/boxes/"+boxId+"/sensors").success(function(data,status,headers,config){
        $scope.selected = data;
      });  
    };

    if ($scope.accordion.active == elem) {
      angular.element($scope.accordion.active).removeClass("active");
      $scope.accordion.active = "";
    } else {
      if ($scope.accordion.active != ""){
        angular.element($scope.accordion.active).removeClass("active");
      } 
      
      angular.element(elem).addClass("active");
      $scope.accordion.active = elem;
    };
  }
});

app.controller("GeoJSONController", [ '$scope', 'OpenSenseBoxes', function($scope, OpenSenseBoxes) {
    $scope.markers = [];

    angular.extend($scope, {
        center: {
            // autoDiscover: true,
            lat: 40.095,
            lng: -3.823,
            zoom: 4
        },
        markers: $scope.markers,
        defaults: {
            tileLayer: "http://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
            tileLayerOptions: {
                opacity: 0.9,
                detectRetina: true,
                reuseTiles: true,
            },
            scrollWheelZoom: false
        }
    });

    OpenSenseBoxes.query(function(response){
      for (var i = response.length - 1; i >= 0; i--) {
        var tempMarker = {};
        tempMarker.lng = response[i].loc[0].geometry.coordinates[0];
        tempMarker.lat = response[i].loc[0].geometry.coordinates[1];
        $scope.markers.push(tempMarker);
      };
    });
}]);

app.controller('UploadCtrl', function ($scope) {
  $scope.csvHeader = [];
  $scope.csvData = [];

  $scope.parseCSV = function(text){
    $scope.csvData = CSV.parse(text);
    $scope.csvHeader = $scope.csvData[0];
    console.log($scope.csvHeader);
  }
});

app.controller('AboutCtrl', function ($scope) {
	
});

app.controller('RegisterCtrl', function($scope, $filter, $http) {
 $scope.newSenseBox = {};

 $scope.sensors = [
 ]; 

 angular.extend($scope, {
        center: {
            lat: 52,
            lng: 7,
            zoom: 10
        },
        defaults: {
            scrollWheelZoom: false
        },
        markers: {
            box: {
                lat: 52,
                lng: 7,
                focus: true,
                draggable: true
            },
        }
    });

  $scope.phenomenoms = [
    {value: 1, text: 'Temperature'},
    {value: 2, text: 'Humidity'},
    {value: 3, text: 'Wind direction'},
    {value: 4, text: 'Wind speed'}
  ]; 

  $scope.showStatus = function(sensor) {
    var selected = [];
    if(sensor.phenomenom) {
      selected = $filter('filter')($scope.phenomenoms, {value: sensor.phenomenom});
    }
    return selected.length ? selected[0].text : 'Not set';
  };

  // remove sensor
  $scope.removeSensor = function(index) {
    $scope.sensors.splice(index, 1);
  };

  //build json object fpr api
  $scope.saveToDB = function() {
    $scope.newSenseBox.sensors = $scope.sensors;
    console.log($scope.markers.box.lat+":"+$scope.markers.box.lng);
    console.log($scope.newSenseBox);
  };

  // add sensor
  $scope.addSensor = function() {
    $scope.inserted = {
      id: $scope.sensors.length+1,
      phenomenom: '',
      unit: null,
      type: null 
    };
    $scope.sensors.push($scope.inserted);
  };
});

app.directive('bars', function ($parse) {
  return {
     restrict: 'E',
     replace: true,
     template: '<div id="chart"></div>',
     link: function (scope, element, attrs) {
        var margin = {top: 0, right: 80, bottom: 30, left: 30},
            width = 450 - margin.left - margin.right,
            height = 250 - margin.top - margin.bottom;

        var parseDate = d3.time.format("%Y%m%d").parse;

        var x = d3.time.scale()
            .range([0, width]);

        var y = d3.scale.linear()
            .range([height, 0]);

        var color = d3.scale.category10();

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");

        var line = d3.svg.line()
            .interpolate("basis")
            .x(function(d) { return x(d.date); })
            .y(function(d) { return y(d.temperature); });

        var svg = d3.select("#chart").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        d3.tsv("data.tsv", function(error, data) {
          color.domain(d3.keys(data[0]).filter(function(key) { return key !== "date"; }));

          data.forEach(function(d) {
            d.date = parseDate(d.date);
          });

          var cities = color.domain().map(function(name) {
            return {
              name: name,
              values: data.map(function(d) {
                return {date: d.date, temperature: +d[name]};
              })
            };
          });

          x.domain(d3.extent(data, function(d) { return d.date; }));

          y.domain([
            d3.min(cities, function(c) { return d3.min(c.values, function(v) { return v.temperature; }); }),
            d3.max(cities, function(c) { return d3.max(c.values, function(v) { return v.temperature; }); })
          ]);

          svg.append("g")
              .attr("class", "x axis")
              .attr("transform", "translate(0," + height + ")")
              .call(xAxis);

          svg.append("g")
              .attr("class", "y axis")
              .call(yAxis)
            .append("text")
              .attr("transform", "rotate(-90)")
              .attr("y", 6)
              .attr("dy", ".71em")
              .style("text-anchor", "end")
              .text("Temperature (ºF)");

          var city = svg.selectAll(".city")
              .data(cities)
            .enter().append("g")
              .attr("class", "city");

          city.append("path")
              .attr("class", "line")
              .attr("d", function(d) { return line(d.values); })
              .style("stroke", function(d) { return color(d.name); });

          city.append("text")
              .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
              .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.temperature) + ")"; })
              .attr("x", 3)
              .attr("dy", ".35em")
              .text(function(d) { return d.name; });
        });
     } 
  };
});