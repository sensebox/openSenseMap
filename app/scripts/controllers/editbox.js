'use strict';

angular.module('openSenseMapApp')
  .controller('EditboxCtrl', ['$scope', 'Validation', '$http', 'OpenSenseBoxAPI', 'SensorIcons', function($scope, Validation, $http, OpenSenseBoxAPI, SensorIcons){

  $scope.osemapi = OpenSenseBoxAPI;
  $scope.icons = SensorIcons;
  $scope.editingMarker = angular.copy($scope.$parent.selectedMarker);
  $scope.mqtt = {
    enabled: false,
    url: '',
    topic: '',
    messageFormat: '',
    decodeOptions: '',
    connectionOptions: ''
  };
  $scope.sensorsEditMode = false;

  $scope.boxPosition = {
    lng: parseFloat($scope.editingMarker.loc[0].geometry.coordinates[0].toFixed(6)),
    lat: parseFloat($scope.editingMarker.loc[0].geometry.coordinates[1].toFixed(6)),
    zoom: 17
  };

  $scope.editMarkerInput =  angular.copy($scope.boxPosition);

  $scope.resetPosition = function () {
    $scope.editMarker = { m1: angular.copy($scope.boxPosition) };
    $scope.editMarkerInput =  angular.copy($scope.boxPosition);
    $scope.editMarker.m1.draggable = true;
    delete $scope.editMarker.m1.zoom;
  };

  $scope.resetPosition();
  $scope.$watchCollection('editMarkerInput', function (newValue) {
    if (newValue && newValue.lat && newValue.lng) {
      $scope.editMarker.m1.lng = newValue.lng;
      $scope.editMarker.m1.lat = newValue.lat;
    }
  });

  $scope.$on('leafletDirectiveMap.editbox_map.click', function (e, args) {
    $scope.editMarker.m1.lng = parseFloat(args.leafletEvent.latlng.lng.toFixed(6));
    $scope.editMarker.m1.lat = parseFloat(args.leafletEvent.latlng.lat.toFixed(6));
    $scope.editMarkerInput.lng = $scope.editMarker.m1.lng;
    $scope.editMarkerInput.lat = $scope.editMarker.m1.lat;
  });

  $scope.$on('leafletDirectiveMarker.editbox_map.dragend', function (e, args) {
    $scope.editMarker.m1.lng = parseFloat(args.model.lng.toFixed(6));
    $scope.editMarker.m1.lat = parseFloat(args.model.lat.toFixed(6));
    $scope.editMarkerInput.lng = $scope.editMarker.m1.lng;
    $scope.editMarkerInput.lat = $scope.editMarker.m1.lat;
  });

  $scope.editMapDefaults = angular.copy($scope.defaults);
  $scope.editMapDefaults.scrollWheelZoom = false;

  $scope.apikey = {};
  $scope.addon = {
    feinstaub: {
      id: '',
      disabled: false
    }
  };
  $scope.enableEditableMode = function () {
    var boxId = $scope.editingMarker._id;

    Validation.checkApiKey(boxId,$scope.apikey.key).then(function(response){
      $scope.apikeyIssue = false;
      if (response.status === 200) {
        $scope.editableMode = true;
        $scope.apikeyIssue = false;
        $scope.mqtt = response.data.mqtt;
        if (response.data.model.includes('Feinstaub')) {
          $scope.addon.feinstaub.id = 'Feinstaub';
          $scope.addon.feinstaub.disabled = true;
        }
      } else {
        $scope.apikeyIssue = true;
        $scope.editableMode = false;
      }
    });
  };

  $scope.setSensorIcon = function(sensor,newIcon) {
    sensor.icon = newIcon.name;
  };

  $scope.cancelChange = function () {
    $scope.editableMode = false;
    delete $scope.editingMarker;
    $scope.closeThisDialog();
  };

  $scope.saveChange = function () {
    $scope.savedSuccessfully = false;
    $scope.savedError = false;

    var boxid = $scope.editingMarker._id;
    var imgsrc = angular.element(document.getElementById('flowUploadImage')).attr('src');
    var newBoxData = {
      _id: $scope.editingMarker._id,
      name: $scope.editingMarker.name,
      description: $scope.editingMarker.description,
      weblink: $scope.editingMarker.weblink,
      grouptag: $scope.editingMarker.grouptag,
      exposure: $scope.editingMarker.exposure,
      loc: $scope.editMarker.m1,
      image: imgsrc,
      mqtt: $scope.mqtt
    };

    if ($scope.addon.feinstaub.id !== '' && $scope.addon.feinstaub.disabled === false) {
      newBoxData.addons = {
        add: $scope.addon.feinstaub.id
      };
    } else {
      newBoxData.sensors = $scope.editingMarker.sensors
    }

    $http.put($scope.osemapi.url+'/boxes/'+boxid, newBoxData, { headers: { 'X-ApiKey': $scope.apikey.key } })
      .success(function(data){
        console.log(data);
        $scope.savedSuccessfully = true;
        $scope.savedError = false;
        if (data.data.image !== '') {
          $scope.image = data.data.image;
        }
        $scope.editingMarker = angular.copy(data.data);
        $scope.$parent.selectedMarker = angular.copy(data.data);
      }).error(function(){
        $scope.savedError = true;
    });
  };

  $scope.flowFileAdded = function(file) {
    if ((file.getExtension().toLowerCase() === 'jpg' || file.getExtension().toLowerCase() === 'png' || file.getExtension().toLowerCase() === 'jpeg') && file.size < 512000) {
      return true;
    } else {
      return false;
    }
  };

  var setSensorsEditMode = function () {
    for (var i = $scope.editingMarker.sensors.length - 1; i >= 0; i--) {
      if ($scope.editingMarker.sensors[i].editing) {
        $scope.sensorsEditMode = true;
        return;
      }
    }
    $scope.sensorsEditMode = false;
  };

  $scope.addSensor = function() {
    $scope.editingMarker.sensors.push({
      icon: '',
      sensorType: '',
      title: '',
      unit: '',
      editing: true,
      new: true
    });

    setSensorsEditMode();
  };

  $scope.editSensor = function(sensor) {
    sensor.restore = angular.copy(sensor);
    sensor.editing = true;

    setSensorsEditMode();
  };

  $scope.saveSensor = function(sensor) {
    if(sensor.icon === '' || sensor.name === '' || sensor.sensorType === '' || sensor.unit === '') {
      sensor.incomplete = true;
      return false;
    } else {
      sensor.editing = false;
      sensor.incomplete = false;
      sensor.edited = true;
    }

    setSensorsEditMode();
  };

  $scope.deleteSensor = function(sensor) {
    if(sensor.new){
      var index = $scope.editingMarker.sensors.indexOf(sensor);
      if(index !== -1) {
        $scope.editingMarker.sensors.splice(index, 1);
      }
    } else {
      sensor.deleted = true;
      sensor.incomplete = false;
    }
  };

  $scope.cancelSensor = function(sensor) {
    if(sensor.new) {
      var index = $scope.editingMarker.sensors.indexOf(sensor);
      if(index !== -1) {
        $scope.editingMarker.sensors.splice(index, 1);
      }
    } else {
      sensor.incomplete = false;
      sensor.editing = false;
      for (var key in sensor.restore) {
        var value = sensor.restore[key];
        sensor[key] = value;
      }
    }

    setSensorsEditMode();
  };

  $scope.downloadArduino = function () {
    var boxid = $scope.editingMarker._id;
    $http.get($scope.osemapi.url+'/boxes/'+boxid+'/script', { headers: { 'X-ApiKey': $scope.apikey.key } })
      .success(function(data){
        $scope.boxScript = data;
      }).error(function(){
      // todo: display an error message
    });
  };

  $scope.deleteBox = function(){
    var boxid = $scope.editingMarker._id;
    $http.delete($scope.osemapi.url+'/boxes/'+boxid+'', { headers: { 'X-ApiKey': $scope.apikey.key } })
      .success(function(){
        $scope.boxdeleted = true;
        $scope.editableMode = false;
      }).error(function(){
      $scope.errorDuringDelete = true;
    });
  };

  $scope.getIcon = function(sensor) {
    if (sensor.icon !== undefined) {
      return sensor.icon;
    } else {
      if ((sensor.sensorType === 'HDC1008' || sensor.sensorType === 'DHT11')  && sensor.title === 'Temperatur') {
        return 'osem-thermometer';
      } else if (sensor.sensorType === 'HDC1008' || sensor.title === 'rel. Luftfeuchte' || sensor.title === 'Luftfeuchtigkeit') {
        return 'osem-humidity';
      } else if (sensor.sensorType === 'LM386') {
        return 'osem-volume-up';
      } else if (sensor.sensorType === 'BMP280' && sensor.title === 'Luftdruck') {
        return 'osem-barometer';
      } else if (sensor.sensorType === 'TSL45315' || sensor.sensorType === 'VEML6070') {
        return 'osem-brightness';
      } else {
        return 'osem-dashboard';
      }
    }
  };
}]);
