'use strict';

angular.module('openSenseMapApp')
  .controller('EditboxCtrl', ['$scope', 'Validation', '$http', 'OpenSenseBoxAPI', 'SensorIcons', function($scope, Validation, $http, OpenSenseBoxAPI, SensorIcons){

  $scope.osemapi = OpenSenseBoxAPI;
  $scope.icons = SensorIcons;
  $scope.editingMarker = angular.copy($scope.$parent.selectedMarker);
  $scope.mqtt = {};
  $scope.mqttEnabled = false;

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
  $scope.enableEditableMode = function () {
    var boxId = $scope.editingMarker._id;

    Validation.checkApiKey(boxId,$scope.apikey.key).then(function(response){
      $scope.apikeyIssue = false;
      if (response.status === 200) {
        $scope.editableMode = true;
        $scope.apikeyIssue = false;
        if (response.data.mqtt !== undefined) {
          $scope.mqttEnabled = true;
          $scope.mqtt = response.data.mqtt;
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

  $scope.saveChange = function (event) {
    var boxid = $scope.editingMarker._id;
    var imgsrc = angular.element(document.getElementById('flowUploadImage')).attr('src');
    var newBoxData = {
      _id: $scope.editingMarker._id,
      name: $scope.editingMarker.name,
      sensors: $scope.editingMarker.sensors,
      description: $scope.editingMarker.description,
      weblink: $scope.editingMarker.weblink,
      grouptag: $scope.editingMarker.grouptag,
      exposure: $scope.editingMarker.exposure,
      loc: $scope.editMarker.m1,
      image: imgsrc
    };

    if ($scope.mqttEnabled) {
      newBoxData.mqtt = $scope.mqtt;
    } else {
      newBoxData.mqtt = null;
    }

    $http.put($scope.osemapi.url+'/boxes/'+boxid, newBoxData, { headers: { 'X-ApiKey': $scope.apikey.key } })
      .success(function(data, status){
        $scope.editableMode = false;
        $scope.mqtt = {};
        $scope.mqttEnabled = false;
        $scope.savedSuccessfully = true;
      $scope.savedError = false;
        if (data.image === '') {
          $scope.image = 'placeholder.png';
        } else {
          $scope.image = data.image;
        }
        $scope.editingMarker = angular.copy(data);
        $scope.$parent.selectedMarker = angular.copy(data);
      }).error(function(data, status){
        $scope.savedError = true;
    });
  };

  $scope.flowFileAdded = function(file,event) {
    if ((file.getExtension().toLowerCase() === 'jpg' || file.getExtension().toLowerCase() === 'png' || file.getExtension().toLowerCase() === 'jpeg') && file.size < 512000) {
      return true;
    } else {
      return false;
    }
  };

  $scope.logThis = function() {
    console.log($scope.editingMarker);
  };

  $scope.addSensor = function() {
    $scope.editingMarker.sensors.push({
      sensorType: '',
      title: '',
      unit: '',
      editing: true,
      new: true
    });
  };

  $scope.editSensor = function(sensor) {
    sensor.restore = angular.copy(sensor);
    sensor.editing = true;
  };

  $scope.saveSensor = function(sensor) {
    if(sensor.name === '' || sensor.sensorType === '' || sensor.unit === '') {
      sensor.incomplete = true;
      return false;
    } else {
      sensor.editing = false;
      sensor.incomplete = false;
      sensor.edited = true;
    }
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
    if(sensor.name === '' || sensor.sensorType === '' || sensor.unit === '') {
      var index = $scope.editingMarker.sensors.indexOf(sensor);
      if(index !== -1) {
        $scope.editingMarker.sensors.splice(index, 1);
      }
    } else {
      sensor.incomplete = false;
      sensor.editing = false;
    }
  };

  $scope.downloadArduino = function () {
    var boxid = $scope.editingMarker._id;
    $http.get($scope.osemapi.url+'/boxes/'+boxid+'/script', { headers: { 'X-ApiKey': $scope.apikey.key } })
      .success(function(data, status){
        $scope.boxScript = data;
      }).error(function(data, status){
      // todo: display an error message
    });
  };

  $scope.deleteBox = function(){
    var boxid = $scope.editingMarker._id;
    $http.delete($scope.osemapi.url+'/boxes/'+boxid+'', { headers: { 'X-ApiKey': $scope.apikey.key } })
      .success(function(data, status){
        $scope.boxdeleted = true;
        $scope.editableMode = false;
      }).error(function(data, status){
      $scope.errorDuringDelete = true;
    });
  };
}]);
