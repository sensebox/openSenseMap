(function () {
  'use strict'

  angular
    .module('openSenseMapApp')
    .controller('SidebarBoxDetailsController', SidebarBoxDetailsController)

  SidebarBoxDetailsController.$inject = ['$scope', '$stateParams', '$document', '$timeout', 'ngDialog', 'OpenSenseBox', 'OpenSenseBoxData', 'OpenSenseBoxesSensors', 'leafletData']

  function SidebarBoxDetailsController ($scope, $stateParams, $document, $timeout, ngDialog, OpenSenseBox, OpenSenseBoxData, OpenSenseBoxesSensors, leafletData) {
    var vm = this

    vm.boxNotFound = false
    vm.selectedMarkerData
    vm.columns = []
    vm.sensordata = {}
    vm.chartDone = {}
    vm.chartError = {}

    vm.closeSidebar = closeSidebar
    vm.openEditDialog = openEditDialog
    vm.getIcon = getIcon
    vm.getData = getData
    vm.formatDate = formatDate
    vm.formatDateFull = formatDateFull

    var prom
    var delay = 60000

    activate()

    //

    function activate () {
      return OpenSenseBox.query({ boxId: $stateParams.id }, function (response) {
        var markerLatLng = [
          response.loc[0].geometry.coordinates[1],
          response.loc[0].geometry.coordinates[0]
        ]
        centerLatLng(markerLatLng);
        vm.selectedMarker = response
        getMeasurements()
      }, function () {
        vm.boxNotFound = true
      })
    }

    // centers a latlng (marker) on the map while reserving space for the sidebar
    function centerLatLng (latlng) {
      leafletData.getMap('map_main').then(function (map) {
        var padding = 450 // sidebar width: 450px
        // consider smaller devices (250px min map-width + 450px sidebar-width)
        if ($document[0].body.clientWidth <= 700) padding = 0

        map.fitBounds([latlng, latlng], {
          paddingTopLeft: [0, 0],
          paddingBottomRight: [padding, 0],
          maxZoom: 17,
          animate: false
        })
      })
    }

    function closeSidebar () {
      $timeout.cancel(prom)
    }

    function openEditDialog () {
      ngDialog.open({
        template: '/views/editbox.html',
        className: 'ngdialog-theme-default',
        data: vm,
        showClose: true,
        closeByDocument: false,
        controller: 'EditBoxController as editbox'
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

    function getMeasurements () {
      prom = $timeout(getMeasurements, delay)
      OpenSenseBoxesSensors.query({ boxId: $stateParams.id }, function (response) {
        if (angular.isUndefined(vm.selectedMarkerData)) {
          vm.selectedMarkerData = response
        } else {
          vm.selectedMarkerData.sensors.map(function (value) {
            for (var i = 0; i < response.sensors.length; i++) {
              if (value._id === response.sensors[i]._id && angular.isDefined(value.lastMeasurement)) {
                angular.extend(value.lastMeasurement, response.sensors[i].lastMeasurement)
              }
            }
          })
        }
      })
    }

    function getData (sensorId, panelOpen) {
      if (!panelOpen) {
        return // panel is in closing transition, don't fetch new data
      }
      var endDate = ''
      var box = vm.selectedMarker._id
      vm.chartDone[sensorId] = false
      vm.chartError[sensorId] = false

      // Get the date of the last taken measurement for the selected sensor
      for (var i = 0; i < vm.selectedMarkerData.sensors.length; i++) {
        if (sensorId === vm.selectedMarkerData.sensors[i]._id) {
          var title = vm.selectedMarkerData.sensors[i].title.toString().replace('.', '')

          vm.columns[sensorId] = [{'id': title, 'type': 'scatter'}, {'id': 'dates', 'type': 'date'}]
          vm.sensordata[sensorId] = []

          if (!vm.selectedMarkerData.sensors[i].lastMeasurement) {
            continue
          }
          endDate = vm.selectedMarkerData.sensors[i].lastMeasurement.createdAt

          OpenSenseBoxData.query({ boxId: box, sensorId: sensorId, date1: '', date2: endDate })
            .$promise.then(function (response) {
              for (var j = 0; j < response.length; j++) {
                var d = new Date(response[j].createdAt)
                var dataPair = {}
                dataPair[title] = parseFloat(response[j].value)
                dataPair.dates = d
                vm.sensordata[sensorId].push(dataPair)
              }
              vm.chartDone[sensorId] = true
            }, function () {
              vm.chartError[sensorId] = true
              vm.chartDone[sensorId] = true
            })
        }
      }
    }

    function formatDate (input) {
      return d3.time.format('%Y-%m-%d')(new Date(input))
    }

    function formatDateFull (input) {
      return d3.time.format('%Y-%m-%d %H:%M:%S')(new Date(input))
    }
  }
})()
