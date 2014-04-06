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
        });
});

app.factory('OpenSenseBoxes', function($resource){
    // return $resource('http://opensensemap.org:8000/boxes', {});
    return $resource('http://localhost:8000/boxes', {});
});

app.run(function ($rootScope) {
  $rootScope.$on('$viewContentLoaded', function() {
    // $(document).foundation();
  });
});

app.controller("AppCtrl", function($scope) {
    
});

app.controller("ExploreCtrl", [ '$scope', 'OpenSenseBoxes', 'leafletEvents', function($scope, OpenSenseBoxes, leafletEvents) {
    $scope.areDetailsCollapsed = true;
    $scope.isMapCollapsed = false;
    $scope.isListCollapsed = true;

    $scope.markers = [];
    $scope.pagedMarkers = [];

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

    $scope.collapseMap = function() {
      if ($scope.isMapCollapsed) {
        $scope.isMapCollapsed = !$scope.isMapCollapsed; 
        $scope.isListCollapsed = true;
        $scope.areDetailsCollapsed = true;
      }
    };

    $scope.collapseList = function() {
      if ($scope.isListCollapsed) {
        $scope.isListCollapsed = !$scope.isListCollapsed;
        $scope.isMapCollapsed = true;
        $scope.totalItems = $scope.markers.length;
        if ($scope.pagedMarkers) {
          $scope.pagedMarkers = $scope.markers.slice($scope.from,$scope.to);
        }
      }
    };

    $scope.$on('leafletDirectiveMarker.click', function(e, args) {
      // Args will contain the marker name and other relevant information
      $scope.areDetailsCollapsed = !$scope.areDetailsCollapsed;
      $scope.isMapCollapsed = true;
    });

    OpenSenseBoxes.query(function(response){
      // $scope.totalItems = response.length;
      for (var i = response.length - 1; i >= 0; i--) {
        var tempMarker = {};
        tempMarker.lng = response[i].loc[0].geometry.coordinates[0];
        tempMarker.lat = response[i].loc[0].geometry.coordinates[1];
        tempMarker.id = response[i]._id;
        tempMarker.name = response[i].name;
        $scope.markers.push(tempMarker);
      }
    });
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

  $scope.collapseNewForm = function(test){
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
    }

    $http.post("http://localhost:8000/boxes",$scope.newSenseBox)
      .success(function(data) {
        $scope.newIsCollapsed = true;
        $scope.codeIsCollapsed = false;
        $scope.boxId = data._id;
        for (var i = data.sensors.length - 1; i >= 0; i--) {
          if (data.sensors[i].title == "Temperature") {$scope.tempId= data.sensors[i]._id;}
          if (data.sensors[i].title == "Humidity") {$scope.humId = data.sensors[i]._id;}
        }
        $scope.code = '/*Jan Wirwahn, Institute for Geoinformatics, Feb. 2014 ' +
                      'Arduino Web-Client for pushing temperature and humidity \n' +
                      'measurements (SHT15) to the OpenSenseMap server. \n' +
                      'Note that MAC-adress and IP has to be changed according to \n'+ 
                      'your setup!! \n\n' +
                      'All comments in Serial monitor are disabled. Uncomment \n' +
                      'all Serial-functions for feedback in Serial monitor.\n' +
                      'Disable them for better performance on your stand-alone \n'+
                      'sensor setup.\n' +
                      '*/\n' +
                      '#include <SHT1x.h>'+
                      '#include <SPI.h>'+
                      '#include <Ethernet.h>'+
                      '#define dataPin  5'+
                      '#define clockPin 4'+
                      'SHT1x sht15(dataPin, clockPin);'+
                      '//INDIVIDUAL SETUP'+
                      '//Change MAC-adress here:'+
                      'byte mac[] = { 0x__, 0x__, 0x__, 0x__, 0x__, 0x__ }; //__-__-__-__-__-__'+
                      '//Specify an IP according to your network settings:'+
                      'IPAddress ip(xxx,xxx,xxx,xxx);'+
                      '//The following IDs were generated by the OSM-server. Change them to your IDs:'+
                      'String arduinoId = "'+$scope.boxId+'";'+
                      'String tempSensorId = "'+$scope.tempId+'";'+
                      'String humiSensorId = "'+$scope.humId+'";'+
                      'char server[] = "opensensemap.org";'+ 
                      'EthernetClient client;'+
                      'float temperature = 0;'+
                      'float humidity = 0;'+
                      'int postInterval = 600000; //post sample each 10 minutes'+
                      'long timeOld = 0;'+
                      'long timeNew = 0;'+
                      'void setup(){'+
                      '//Serial.begin(9600);'+
                      '  //Try DHCP first'+
                      '  if (Ethernet.begin(mac) == 0) {'+
                      '//Serial.println("Failed to configure Ethernet using DHCP");'+
                      '    Ethernet.begin(mac, ip);'+
                      '  }'+
                      '  delay(1000);'+
                      '}'+
                      'void loop(){'+
                      '  timeNew = millis();'+
                      '  if (timeNew - timeOld > postInterval){'+
                      '    float temp = sht15.readTemperatureC();'+
                      '    postObservation(temp, tempSensorId, arduinoId);'+
                      '    delay(2000);'+
                      '    float humi = sht15.readHumidity();'+
                      '    postObservation(humi, humiSensorId, arduinoId);'+        
                      '    timeOld = millis();'+
                      '  }'+
                      '}'+
                      'void postObservation(float measurement, String sensorId, String boxId){'+
                      '  char obs[10];'+
                      '  dtostrf(measurement, 5, 2, obs);'+
                      '//Serial.println(obs);'+  
                      '  //json must look like: {"value":"12.5"} '+
                      '  //post observation to: http://opensensemap.org:8000/boxes/boxId/sensorId'+
                      '//Serial.println("connecting...");'+
                      '  String value = "{\"value\":\"";'+
                      '  value += obs;'+
                      '  value += "\"}";'+
                      '  // if you get a connection, report back via serial:'+
                      '  boxId += "/";'+
                       ' if (client.connect(server, 8000)) {'+
                      '//Serial.println("connected");'+
                      '    // Make a HTTP Post request:'+
                      '    client.print("POST /boxes/");'+
                      '    client.print(boxId);'+
                      '    client.print(sensorId);'+
                      '    client.println(" HTTP/1.1");'+
                      '    // Send the required header parameters'+
                      '    client.println("Host:opensensemap.org");'+
                      '    client.println("Content-Type: application/json");'+
                      '    client.println("Connection: close");'+
                      '    client.print("Content-Length: ");'+
                      '    client.println(value.length());'+
                      '    client.println();'+
                      '    client.print(value);'+
                      '    client.println();'+
                      '  }'+
                      '  waitForResponse();'+
                      '}'+
                      'void waitForResponse(){'+
                      '  // if there are incoming bytes available '+
                      '  // from the server, read them and print them:'+
                      '  boolean repeat = true;'+
                      '  do{'+
                      '    if (client.available()) {'+
                      '      char c = client.read();'+
                      '//Serial.print(c);'+
                      '    }'+
                      '    // if the servers disconnected, stop the client:'+
                      '    if (!client.connected()) {'+
                      '//Serial.println();'+
                      '//Serial.println("disconnecting.");'+
                      '      client.stop();'+
                      '      repeat = false;'+
                      '    }'+
                      '  }while (repeat);'+
                      '}';
      })
      .error(function(data) {
        console.log("error");
        console.log(data);
      });
  };  
}]);