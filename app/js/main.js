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
    // $(document).foundation();
  });
});

app.controller("AppCtrl", function($scope) {
    
});

// app.controller("ExploreCtrl", function($scope, OpenSenseBoxes, $http) {

//   $scope.chart = {
//     labels : ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
//     datasets : [
//         {
//             fillColor : "rgba(151,187,205,0)",
//             strokeColor : "#e67e22",
//             pointColor : "rgba(151,187,205,0)",
//             pointStrokeColor : "#e67e22",
//             data : [45, 32, 51, 44, 63]
//         },
//         {
//             fillColor : "rgba(151,187,205,0)",
//             strokeColor : "#f1c40f",
//             pointColor : "rgba(151,187,205,0)",
//             pointStrokeColor : "#f1c40f",
//             data : [17.4, 19.8, 20.1, 15.3, 14.5]
//         }
//     ], 
//   };

//   $scope.options = {
    
//   }

//   $scope.data = {};
//   $scope.accordion = {};
//   $scope.accordion.active = "";
//   $scope.selected = {};

//   OpenSenseBoxes.query(function(response) {
//     // Assign the response INSIDE the callback
//     $scope.data.boxes = response;
//   });

//   $scope.show = function (boxId){
//     var elem = "#"+boxId;
//     if (boxId != "") {
//       $http.get("http://opensensemap.org:8000/boxes/"+boxId+"/sensors").success(function(data,status,headers,config){
//         $scope.selected = data;
//       });  
//     };

//     if ($scope.accordion.active == elem) {
//       angular.element($scope.accordion.active).removeClass("active");
//       $scope.accordion.active = "";
//     } else {
//       if ($scope.accordion.active != ""){
//         angular.element($scope.accordion.active).removeClass("active");
//       } 
      
//       angular.element(elem).addClass("active");
//       $scope.accordion.active = elem;
//     };
//   }
// });

app.controller("ExploreCtrl", [ '$scope', 'OpenSenseBoxes', 'leafletEvents', function($scope, OpenSenseBoxes, leafletEvents, leafletData) {
    $scope.areDetailsCollapsed = true;
    $scope.isMapCollapsed = false;
    $scope.isListCollapsed = true;

    $scope.markers = [];

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

    $scope.collapseMap = function() {
      if ($scope.isMapCollapsed) {
        $scope.isMapCollapsed = !$scope.isMapCollapsed; 
        $scope.isListCollapsed = true; 
      }
    };

    $scope.collapseList = function() {
      if ($scope.isListCollapsed) {
        $scope.isListCollapsed = !$scope.isListCollapsed;
        $scope.isMapCollapsed = true;  
      }
    };

    $scope.$on('leafletDirectiveMarker.click', function(e, args) {
      // Args will contain the marker name and other relevant information
      $scope.areDetailsCollapsed = !$scope.areDetailsCollapsed;
    });

    OpenSenseBoxes.query(function(response){
      for (var i = response.length - 1; i >= 0; i--) {
        var tempMarker = {};
        tempMarker.lng = response[i].loc[0].geometry.coordinates[0];
        tempMarker.lat = response[i].loc[0].geometry.coordinates[1];
        tempMarker.id = response[i]._id;
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

app.controller('RegisterCtrl', function($scope, $filter, $http, leafletData) {
  
  $scope.newIsCollapsed = true;
  $scope.editIsCollapsed = true;
  $scope.showMap = false;

  $scope.collapseNewForm = function(test){
    $scope.editIsCollapsed = true;
    $scope.newIsCollapsed = false;
    $scope.showMap = true;
  };

  $scope.collapseEditForm = function(test){
    console.log("edit form");
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

  //new sensebox object
  $scope.newSenseBox = {
    name: "",
    boxType: "",
    sensors: [],
    loc: [{
      "type":"feature",
      "geometry":{
        "type":"Point",
        "coordinates":[]
      }
    }]
  };

  $scope.sensors = []; 

  $scope.phenomenoms = [
    {value: 1, text: 'Temperature'},
    {value: 2, text: 'Humidity'},
    {value: 3, text: 'Wind speed'},
    {value: 4, text: 'Wind direction'}
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

  // remove user
  $scope.removeSensor = function(index) {
    $scope.sensors.splice(index, 1);
  };

  // add user
  $scope.addSensor = function() {
    $scope.inserted = {
      id: $scope.sensors.length+1,
      title: '',
      unit: null,
      sensorType: null 
    };
    $scope.sensors.push($scope.inserted);
  };

  //build json object for api
  $scope.saveToDB = function() {

    $scope.newSenseBox.sensors = $scope.sensors;
    $scope.newSenseBox.loc[0].geometry.coordinates.push($scope.markers.box.lng);
    $scope.newSenseBox.loc[0].geometry.coordinates.push($scope.markers.box.lat);

    for (var i = 0; i < $scope.sensors.length; i++) {
      $scope.sensors[i].title = $scope.phenomenoms[$scope.sensors[i].title-1].text;
    };
    $http.post("http://localhost:8000/boxes",$scope.newSenseBox)
      .success(function(data) {
        console.log("success");
        console.log(data);
      })
      .error(function(data) {
        console.log("error");
        console.log(data);
      });
  };
});