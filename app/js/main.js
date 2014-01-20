/*global angular */
'use strict';

var app = angular.module("app", ["ngRoute","ngResource","leaflet-directive"]);

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

app.controller("ExploreCtrl", ["$scope","OpenSenseBoxes", function($scope, OpenSenseBoxes) {
  $scope.data = {};

  OpenSenseBoxes.query(function(response) {
    // Assign the response INSIDE the callback
    $scope.data.boxes = response;
  });

  // $scope.productId = $routeParams.state;
  $scope.templates =
    [ { name: 'Geräte', url: 'views/devices.html'}
    , { name: 'Sensoren', url: 'template.html'} ];
  $scope.template = $scope.templates[0];
}]);

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