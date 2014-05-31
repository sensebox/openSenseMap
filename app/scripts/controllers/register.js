'use strict';

angular.module('openSenseMapApp')
	.controller('RegisterCtrl', ['$scope','$filter','$http','leafletData','leafletEvents', function($scope, $filter, $http, leafletData, leafletEvents){
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
    		boxType: "fixed",
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
    		boxType: "fixed",
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
