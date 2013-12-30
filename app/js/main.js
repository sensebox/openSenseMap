/*global angular */
'use strict';

var app = angular.module("app", ["ngRoute","leaflet-directive"]);

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
      	.otherwise({
        	template: "This doesn't exist!"
      	})
});

app.run(function ($rootScope) {
  $rootScope.$on('$viewContentLoaded', function() {
    $(document).foundation();
  });
});

app.controller("AppCtrl", function($scope) {
    
});

app.controller("ExploreCtrl", function($scope, $routeParams, $location) {
  $scope.productId = $routeParams.state;
  $scope.templates =
    [ { name: 'Geräte', url: 'views/devices.html'}
    , { name: 'Sensoren', url: 'template.html'} ];
  $scope.template = $scope.templates[0];
});

app.controller('MapCtrl', function ($scope,leafletEvents) {
  angular.extend($scope, {
        center: {
            // autoDiscover: true
            lat: 40.095,
            lng: -3.823,
            zoom: 4
        },
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

  $scope.eventDetected = "No events yet...";
  var mapEvents = leafletEvents.getAvailableMapEvents();
  for (var k in mapEvents){
      var eventName = 'leafletDirectiveMap.' + mapEvents[k];
      $scope.$on(eventName, function(event){
          $scope.eventDetected = event.name;
      });
  }
});

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