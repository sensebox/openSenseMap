(function () {
  'use strict'

  angular
    .module('openSenseMapApp')
    .controller('EditBoxController', EditBoxController)

  EditBoxController.$inject = ['$scope', '$http', 'Validation', 'OpenSenseBoxAPI', 'SensorIcons']

  function EditBoxController ($scope, $http, Validation, OpenSenseBoxAPI, SensorIcons) {
    var vm = this
    vm.editingMarker
    vm.editableMode
    vm.apikey
    vm.boxPosition
    vm.sensorsEditMode = false
    vm.editMapDefaults
    vm.editMarkerInput
    vm.mqtt = {
      enabled: false,
      url: '',
      topic: '',
      messageFormat: '',
      decodeOptions: '',
      connectionOptions: ''
    }
    vm.icons = SensorIcons

    vm.resetPosition = resetPosition
    vm.enableEditableMode = enableEditableMode
    vm.cancelChange = cancelChange
    vm.cancelChange = cancelChange
    vm.saveChange = saveChange
    vm.flowFileAdded = flowFileAdded
    vm.addSensor = addSensor
    vm.editSensor = editSensor
    vm.saveSensor = saveSensor
    vm.deleteSensor = deleteSensor
    vm.cancelSensor = cancelSensor
    vm.downloadArduino = downloadArduino
    vm.deleteBox = deleteBox
    vm.getIcon = getIcon
    vm.setSensorIcon = setSensorIcon

    activate()

    //

    function activate () {
      vm.editingMarker = angular.copy($scope.ngDialogData.selectedMarker)
      vm.boxPosition = {
        lng: parseFloat(vm.editingMarker.loc[0].geometry.coordinates[0].toFixed(6)),
        lat: parseFloat(vm.editingMarker.loc[0].geometry.coordinates[1].toFixed(6)),
        zoom: 17
      }
      vm.editMarkerInput = angular.copy(vm.boxPosition)
      vm.editMapDefaults = angular.copy($scope.defaults)
      vm.editMapDefaults.scrollWheelZoom = false
      resetPosition()
    }

    function resetPosition () {
      vm.editMarker = { m1: angular.copy(vm.boxPosition) }
      vm.editMarkerInput = angular.copy(vm.boxPosition)
      vm.editMarker.m1.draggable = true
      delete vm.editMarker.m1.zoom
    }

    function enableEditableMode () {
      var boxId = vm.editingMarker._id

      Validation.checkApiKey(boxId, vm.apikey.key).then(function (response) {
        vm.apikeyIssue = false
        if (response.status === 200) {
          vm.editableMode = true
          vm.apikeyIssue = false
          vm.mqtt = response.data.mqtt
        } else {
          vm.apikeyIssue = true
          vm.editableMode = false
        }
      })
    }

    function cancelChange () {
      vm.editableMode = false
      delete vm.editingMarker
      $scope.closeThisDialog()
    }

    function saveChange () {
      vm.savedSuccessfully = false
      vm.savedError = false

      var boxid = vm.editingMarker._id
      var imgsrc = angular.element(document.getElementById('flowUploadImage')).attr('src')
      var newBoxData = {
        _id: vm.editingMarker._id,
        name: vm.editingMarker.name,
        sensors: vm.editingMarker.sensors,
        description: vm.editingMarker.description,
        weblink: vm.editingMarker.weblink,
        grouptag: vm.editingMarker.grouptag,
        exposure: vm.editingMarker.exposure,
        loc: vm.editMarker.m1,
        image: imgsrc,
        mqtt: vm.mqtt
      }

      $http.put(OpenSenseBoxAPI.url + '/boxes/' + boxid, newBoxData, { headers: { 'X-ApiKey': vm.apikey.key } })
        .success(function (data) {
          vm.savedSuccessfully = true
          vm.savedError = false
          if (data.image === '') {
            vm.image = 'placeholder.png'
          } else {
            vm.image = data.image
          }
          vm.editingMarker = angular.copy(data)
          $scope.ngDialogData.selectedMarker = angular.copy(data)
        }).error(function () {
          vm.savedError = true
        })
    }

    function flowFileAdded (file) {
      if ((file.getExtension().toLowerCase() === 'jpg' || file.getExtension().toLowerCase() === 'png' || file.getExtension().toLowerCase() === 'jpeg') && file.size < 512000) {
        return true
      } else {
        return false
      }
    }

    function setSensorsEditMode () {
      for (var i = vm.editingMarker.sensors.length - 1; i >= 0; i--) {
        if (vm.editingMarker.sensors[i].editing) {
          vm.sensorsEditMode = true
          return
        }
      }
      vm.sensorsEditMode = false
    }

    function addSensor () {
      vm.editingMarker.sensors.push({
        icon: '',
        sensorType: '',
        title: '',
        unit: '',
        editing: true,
        new: true
      })

      setSensorsEditMode()
    }

    function editSensor (sensor) {
      sensor.restore = angular.copy(sensor)
      sensor.editing = true

      setSensorsEditMode()
    }

    function saveSensor (sensor) {
      if (sensor.icon === '' || sensor.name === '' || sensor.sensorType === '' || sensor.unit === '') {
        sensor.incomplete = true
        return false
      } else {
        sensor.editing = false
        sensor.incomplete = false
        sensor.edited = true
      }

      setSensorsEditMode()
    }

    function deleteSensor (sensor) {
      if (sensor.new) {
        var index = vm.editingMarker.sensors.indexOf(sensor)
        if (index !== -1) {
          vm.editingMarker.sensors.splice(index, 1)
        }
      } else {
        sensor.deleted = true
        sensor.incomplete = false
      }
    }

    function cancelSensor (sensor) {
      if (sensor.new) {
        var index = vm.editingMarker.sensors.indexOf(sensor)
        if (index !== -1) {
          vm.editingMarker.sensors.splice(index, 1)
        }
      } else {
        sensor.incomplete = false
        sensor.editing = false
        for (var key in sensor.restore) {
          var value = sensor.restore[key]
          sensor[key] = value
        }
      }

      setSensorsEditMode()
    }

    function downloadArduino () {
      var boxid = vm.editingMarker._id
      $http.get(OpenSenseBoxAPI.url + '/boxes/' + boxid + '/script', { headers: { 'X-ApiKey': vm.apikey.key } })
        .success(function (data) {
          vm.boxScript = data
        }).error(function () {
          // todo: display an error message
        })
    }

    function deleteBox () {
      var boxid = vm.editingMarker._id
      $http.delete(OpenSenseBoxAPI.url + '/boxes/' + boxid + '', { headers: { 'X-ApiKey': vm.apikey.key } })
        .success(function () {
          vm.boxdeleted = true
          vm.editableMode = false
        })
        .error(function () {
          vm.errorDuringDelete = true
        })
    }

    function getIcon (sensor) {
      if (angular.isDefined(sensor.icon)) {
        return sensor.icon
      } else {
        if ((sensor.sensorType === 'HDC1008' || sensor.sensorType === 'DHT11') && sensor.title === 'Temperatur') {
          return 'osem-thermometer'
        } else if (sensor.sensorType === 'HDC1008' || sensor.title === 'rel. Luftfeuchte' || sensor.title === 'Luftfeuchtigkeit') {
          return 'osem-humidity'
        } else if (sensor.sensorType === 'LM386') {
          return 'osem-volume-up'
        } else if (sensor.sensorType === 'BMP280' && sensor.title === 'Luftdruck') {
          return 'osem-barometer'
        } else if (sensor.sensorType === 'TSL45315' || sensor.sensorType === 'VEML6070') {
          return 'osem-brightness'
        } else {
          return 'osem-dashboard'
        }
      }
    }

    function setSensorIcon (sensor, newIcon) {
      sensor.icon = newIcon.name
    }

    //

    $scope.$on('leafletDirectiveMap.editbox_map.click', function (e, args) {
      vm.editMarker.m1.lng = parseFloat(args.leafletEvent.latlng.lng.toFixed(6))
      vm.editMarker.m1.lat = parseFloat(args.leafletEvent.latlng.lat.toFixed(6))
      vm.editMarkerInput.lng = vm.editMarker.m1.lng
      vm.editMarkerInput.lat = vm.editMarker.m1.lat
    })

    $scope.$on('leafletDirectiveMarker.editbox_map.dragend', function (e, args) {
      vm.editMarker.m1.lng = parseFloat(args.model.lng.toFixed(6))
      vm.editMarker.m1.lat = parseFloat(args.model.lat.toFixed(6))
      vm.editMarkerInput.lng = vm.editMarker.m1.lng
      vm.editMarkerInput.lat = vm.editMarker.m1.lat
    })

    $scope.$watchCollection('editbox.editMarkerInput', function (newValue) {
      if (newValue && newValue.lat && newValue.lng) {
        vm.editMarker.m1.lng = newValue.lng
        vm.editMarker.m1.lat = newValue.lat
      }
    })
  }
})()

