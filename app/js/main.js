/*global angular */
'use strict';

var app = angular.module("app", ["ngRoute","ngResource","leaflet-directive", "xeditable", "angles", "ui.bootstrap"]);

app.run(function(editableOptions) {
  editableOptions.theme = 'bs3';
});

app.config(function($routeProvider) {
    $routeProvider
      .when('/',
        {
          templateUrl: "views/explore.html",
          controller: "ExploreCtrl"
        })
        .when('/explore', {
          templateUrl: "views/explore.html",
          controller: "ExploreCtrl"
        })
        // .when('/explore/:state', {
        //   templateUrl: "views/explore.html",
        //   controller: "ExploreCtrl"
        // })
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
        });
});

app.factory('OpenSenseBoxes', function($resource){
    return $resource('http://opensensemap.org:8000/boxes', {});
});

app.factory('OpenSenseBoxesSensors', function($resource){
    return $resource('http://opensensemap.org:8000/boxes/:boxId/sensors', {});
});

app.run(function ($rootScope) {
  $rootScope.$on('$viewContentLoaded', function() {
    // $(document).foundation();
  });
});

app.controller("AppCtrl", function($scope) {
    
});

app.controller("ExploreCtrl", [ '$scope', '$timeout', 'OpenSenseBoxes', 'OpenSenseBoxesSensors', 'leafletEvents', function($scope, $timeout, OpenSenseBoxes, OpenSenseBoxesSensors, leafletEvents) {
    
    $scope.mapView = true;
    $scope.listView = false;
    $scope.splitView = false;

    $scope.selectedMarker = "";
    $scope.selectedMarkerData = {};

    $scope.markers = [];
    $scope.pagedMarkers = [];
    
    $scope.prom;
    $scope.delay = 60000;

    $scope.center = {
      // autoDiscover: true,
      lat: 40.095,
      lng: -3.823,
      zoom: 4
    };

    $scope.defaults = {
      tileLayer: "http://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
      tileLayerOptions: {
          opacity: 0.9,
          detectRetina: true,
          reuseTiles: true,
      },
      scrollWheelZoom: false
    };

    $scope.itemsPerPage = 8;
    $scope.totalItems = $scope.markers.length;
    $scope.bigCurrentPage = 1;
    $scope.maxSize = 5;

    $scope.from = 0;
    $scope.to = 8;
    
    $scope.setPage = function (pageNo) {
      $scope.currentPage = pageNo;
      if (pageNo != 1) {
        $scope.to = 8 * pageNo;
        $scope.from = $scope.to-8;
      } else {
        $scope.from = 0;
        $scope.to = 8;
      }
      $scope.pagedMarkers = $scope.markers.slice($scope.from,$scope.to);
    };

    $scope.changeView = function(view) {
      if (view == "list") {
        $scope.mapView = false;
        $scope.listView = true;
        $scope.totalItems = $scope.markers.length;
        if ($scope.pagedMarkers) {
          $scope.pagedMarkers = $scope.markers.slice($scope.from,$scope.to);
        }
        $scope.stopit();
        $scope.splitView = false;
      }
      if (view == "map") {
        $scope.mapView = true;
        $scope.listView = false;
      }
    };

    $scope.$on('leafletDirectiveMarker.click', function(e, args) {
      // Args will contain the marker name and other relevant information
      $scope.splitView = true;
      $scope.selectedMarker = args.leafletEvent.target.options.title;
      $scope.getMeasurements();
      $scope.center.lat = args.leafletEvent.target._latlng.lat;
      $scope.center.lng = args.leafletEvent.target._latlng.lng;
      $scope.center.zoom = 15;
    });

    OpenSenseBoxes.query(function(response){
      for (var i = response.length - 1; i >= 0; i--) {
        var tempMarker = {};
        tempMarker.lng = response[i].loc[0].geometry.coordinates[0];
        tempMarker.lat = response[i].loc[0].geometry.coordinates[1];
        tempMarker.title = response[i]._id;
        tempMarker.name = response[i].name;
        $scope.markers.push(tempMarker);
      }
    });

    $scope.stopit = function() {
        $timeout.cancel($scope.prom);  
    };

    $scope.clickcounter = 0;
    $scope.getMeasurements = function() {
      console.log("I am watching");
      $scope.prom = $timeout($scope.getMeasurements, $scope.delay);
      OpenSenseBoxesSensors.query({boxId:$scope.selectedMarker}, function(response) {
        $scope.selectedMarkerData = response;
      });
    };
}]);

app.controller('UploadCtrl', function ($scope) {
  $scope.csvHeader = [];
  $scope.csvData = [];

  $scope.parseCSV = function(text){
    $scope.csvData = CSV.parse(text);
    $scope.csvHeader = $scope.csvData[0];
    console.log($scope.csvHeader);
  };
});

app.controller('AboutCtrl', function ($scope) {
	
});

app.controller('RegisterCtrl', ['$scope','$filter','$http','leafletData','leafletEvents', function($scope, $filter, $http, leafletData, leafletEvents){
  $scope.newIsCollapsed = true;
  $scope.editIsCollapsed = true;
  $scope.codeIsCollapsed = true;
  $scope.showMap = false;
  $scope.boxId = "";
  $scope.tempId = "";
  $scope.humId = "";
  $scope.code = "";

  $scope.phenomenoms = [
    {value: 1, text: 'Temperatur', unit:'°C', type:'BMP085'},
    {value: 2, text: 'Luftfeuchtigkeit', unit:'%', type:'DHT11'},
    {value: 3, text: 'Luftdruck', unit:'Pa', type:'BMP085'},
    {value: 4, text: 'Schall', unit:'Pegel', type:'LM386'},
    {value: 5, text: 'Helligkeit', unit:'Pegel', type:'GL5528'}
  ];

  //new sensebox object
  $scope.newSenseBox = {
    name: "",
    boxType: "",
    sensors: [],
    orderID: "",
    loc: [{
      "type":"feature",
      "geometry":{
        "type":"Point",
        "coordinates":[]
      }
    }]
  };

  $scope.citzenBox = {
    boxType: "Stationär",
    sensors: [
      { 
        id: 1,
        title: 1,
        unit: "°C",
        sensorType: "BMP085"
      },
      { 
        id: 2,
        title: 2,
        unit: "%",
        sensorType: "DHT11"
      },
      { 
        id: 3,
        title: 3,
        unit: "Pa",
        sensorType: "BMP085"
      },
      { 
        id: 4,
        title: 4,
        unit: "Pegel",
        sensorType: "LM386"
      },
      { 
        id: 5,
        title: 5,
        unit: "Pegel",
        sensorType: "GL5528"
      }
    ],
    loc: [{
      "type":"feature",
      "geometry":{
        "type":"Point",
        "coordinates":[]
      }
    }]
  };

  $scope.collapseNewForm = function(type){
    if (type) {
      $scope.sensors = $scope.citzenBox.sensors;
    } else {
      $scope.sensors = [];
    }
    
    $scope.editIsCollapsed = true;
    $scope.newIsCollapsed = false;
    $scope.showMap = true;
  };

  $scope.collapseEditForm = function(test){
    $scope.newIsCollapsed = true;
    $scope.editIsCollapsed = false;
  };

  $scope.$watch("showMap", function(value) {
    if (value === true) {
      leafletData.getMap().then(function(map) {
          map.invalidateSize();
      });
    }
  });

  $scope.$on('leafletDirectiveMap.click', function(e, args) {
    $scope.markers.box.lat = args.leafletEvent.latlng.lat;
    $scope.markers.box.lng = args.leafletEvent.latlng.lng;
  });

  $scope.sensors = []; 

  $scope.phenomenoms = [
    {value: 1, text: 'Temperatur', unit:'°C', type:'BMP085'},
    {value: 2, text: 'Luftfeuchtigkeit', unit:'%', type:'DHT11'},
    {value: 3, text: 'Luftdruck', unit:'Pa', type:'BMP085'},
    {value: 4, text: 'Schall', unit:'Pegel', type:'LM386'},
    {value: 5, text: 'Helligkeit', unit:'Pegel', type:'GL5528'}
  ];

  $scope.center = {
    lat: 52,
    lng: 7,
    zoom: 10
  };

  $scope.markers = {
    box: {
        lat: 52,
        lng: 7,
        focus: true,
        draggable: true
    }
  };

  $scope.showPhenomenom = function(sensor) {
    var selected = [];
    if(sensor.title) {
      selected = $filter('filter')($scope.phenomenoms, {value: sensor.title});
    }
    
    return selected.length ? selected[0].text : 'Not set';
  };

  // $scope.saveUser = function(data, id) {
  //   //$scope.user not updated yet
  //   angular.extend(data, {id: id});
  //   return $http.post('/saveUser', data);
  // };

  // remove sensor
  $scope.removeSensor = function(index) {
    $scope.sensors.splice(index, 1);
  };

  $scope.change = function(test) {
    console.log($scope.tempPhenomenom);
  }

  // add sensor
  $scope.addSensor = function() {
    $scope.inserted = {
      id: $scope.sensors.length+1,
      title: '',
      unit: null,
      sensorType: null 
    };
    $scope.sensors.push($scope.inserted);
  };

  $scope.download = "";

  //build json object for api
  $scope.saveToDB = function() {

    $scope.newSenseBox.sensors = $scope.sensors;
    $scope.newSenseBox.loc[0].geometry.coordinates.push($scope.markers.box.lng);
    $scope.newSenseBox.loc[0].geometry.coordinates.push($scope.markers.box.lat);

    for (var i = 0; i < $scope.sensors.length; i++) {
      $scope.sensors[i].title = $scope.phenomenoms[$scope.sensors[i].title-1].text;
    }

    $http.post("http://opensensemap.org:8000/boxes",$scope.newSenseBox)
      .success(function(data) {
        $scope.newIsCollapsed = true;
        $scope.codeIsCollapsed = false;
        $scope.boxId = data._id;
        $scope.download = $scope.boxId + ".ino";
        for (var i = data.sensors.length - 1; i >= 0; i--) {
          if (data.sensors[i].title == "Temperatur") {$scope.temperatureSensorId= data.sensors[i]._id;}
          if (data.sensors[i].title == "Luftfeuchtigkeit") {$scope.humiditySensorId = data.sensors[i]._id;}
          if (data.sensors[i].title == "Helligkeit") {$scope.lightSensorId = data.sensors[i]._id;}
          if (data.sensors[i].title == "Luftdruck") {$scope.pressureSensorId = data.sensors[i]._id;}
          if (data.sensors[i].title == "Schall") {$scope.noiseSensorId = data.sensors[i]._id;}
        }
      })
      .error(function(data) {
        console.log("error");
        console.log(data);
      });
  };  
}]);