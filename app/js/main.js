/*global angular */
'use strict';

var app = angular.module("app", ["ngRoute","ngResource","leaflet-directive", "xeditable", "angularCharts"])

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

  $scope.data = {};
  $scope.accordion = {};
  $scope.accordion.active = "";
  $scope.selected = {};

  $scope.data1 = {
    series: ['Sales', 'Income', 'Expense', 'Laptops', 'Keyboards'],
    data : [{
      x : "Sales",
      y: [100,500, 0],
      tooltip:"this is tooltip"
    },
    {
      x : "Not Sales",
      y: [300, 100, 100]
    },
    {
      x : "Tax",
      y: [351]
    },
    {
      x : "Not Tax",
      y: [54, 0, 879]
    }]     
  }

  $scope.chartType = 'bar';

  $scope.config = {
    labels: false,
    title : "Not Products",
    legend : {
      display:true,
      position:'left'
    }
  }

  $scope.config1 = {
    labels: false,
    title : "Products",
    legend : {
      display:true,
      position:'right'
    }
  }

  OpenSenseBoxes.query(function(response) {
    // Assign the response INSIDE the callback
    $scope.data.boxes = response;
  });

  // $scope.productId = $routeParams.state;
  // $scope.templates =
  //   [ { name: 'Geräte', url: 'views/devices.html'}
  //   , { name: 'Sensoren', url: 'template.html'} ];
  // $scope.template = $scope.templates[0];

  $scope.show = function (boxId){
    var elem = "#"+boxId;
    if (boxId != "") {
      $http.get("http://opensensemap.org:8000/boxes/"+boxId+"/sensors").success(function(data,status,headers,config){
        // console.log(data);
        $scope.selected = data;
        console.log($scope.selected);
        // for (var i = $scope.data.boxes.length - 1; i >= 0; i--) {
        //   console.log($scope.data.boxes[i]._id);
        //   for (var j = data.length - 1; j >= 0; j--) {
        //     if ($scope.data.boxes[i]._id == data[j].boxes_id) {};
        //       $scope.data.boxes[i].sensors = data;
        //   };
        //   break;
        // };
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