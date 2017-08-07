(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .controller('SidebarBoxDetailsController', SidebarBoxDetailsController);

  SidebarBoxDetailsController.$inject = ['$scope', '$stateParams', '$timeout', 'OpenSenseMapAPI', 'OpenSenseMapData', 'osemMapData'];

  function SidebarBoxDetailsController ($scope, $stateParams, $timeout, OpenSenseMapAPI, OpenSenseMapData, osemMapData) {
    var vm = this;
    vm.delay = 60000;
    vm.selectedMarker = {};

    vm.closeSidebar = closeSidebar;
    vm.getBadgeColor = getBadgeColor;
    vm.focusSelectedBox = focusSelectedBox;
    vm.getIcon = getIcon;
    vm.getData = getData;
    vm.formatDate = formatDate;
    vm.formatDateFull = formatDateFull;

    activate();

    ////

    function activate () {
      return OpenSenseMapAPI.getBox($stateParams.id)
        .then(function (response) {
          angular.copy(response, vm.selectedMarker);
          vm.archiveLink = "https://archive.opensensemap.org/"+moment().subtract(1, 'days').format('YYYY-MM-DD')+"/"+vm.selectedMarker._id+"-"+doubleGermanS(vm.selectedMarker.name).replace(/[^A-Za-z0-9._-]/g,'_');
          getMeasurements();
          focusSelectedBox();

          // for mobile boxes, get it's trajectory and add it to the map
          if (vm.selectedMarker.exposure === 'mobile') {
              return OpenSenseMapAPI.getBoxLocations($stateParams.id)
              // save result in map.js scope, as it needs to be accessible for leaflet directive
              .then(function (response) { $scope.$parent.map.boxLocations = response; });
          }
        })
        .catch(function (error) {
          console.log(error);
          vm.boxNotFound = true;
        });
    }

    function doubleGermanS (value) {
      value = value.replace(/ß/g, 'ßß');
      return value;
    }

    function closeSidebar () {
      $timeout.cancel(vm.prom);
    }

    // fetches/updates the sensor metadata in an interval
    function getMeasurements () {
      vm.prom = $timeout(getMeasurements, vm.delay);
      OpenSenseMapAPI.getSensors($stateParams.id)
        .then(function (response) {
          if (vm.selectedMarkerData === undefined) {
            vm.selectedMarkerData = response;
          } else {
            vm.selectedMarkerData.sensors.map(function (value) {
              for (var i = 0; i < response.sensors.length; i++) {
                if (value._id === response.sensors[i]._id && value.lastMeasurement !== null && value.lastMeasurement !== undefined ) {
                  angular.extend(value.lastMeasurement, response.sensors[i].lastMeasurement);
                }
              }
            });
          }
        })
        .catch(function (error) {
          console.error(error);
        });
    }

    function getBadgeColor (exposure) {
      if (exposure === 'indoor') {
        return 'orange';
      } else if (exposure === 'outdoor') {
        return 'olive';
      } else if (exposure === 'mobile') {
        return 'navy';
      } else {
        return '';
      }
    }

    function focusSelectedBox () {
      var markerLatLng = [
        vm.selectedMarker.currentLocation.coordinates[1],
        vm.selectedMarker.currentLocation.coordinates[0]
      ];
      centerLatLng(markerLatLng);
    }

    function centerLatLng (latlng) {
      osemMapData.getMap('map_main').then(function(map) {
        var padding = 450; // sidebar width: 450px
        // consider smaller devices (250px min map-width + 450px sidebar-width)
        if (document.body.clientWidth <= 700) padding = 0;

        map.fitBounds([latlng, latlng], {
          paddingTopLeft: [0,0],
          paddingBottomRight: [padding, 0],
          maxZoom: 17,
          animate: false
        });
      });
    }

    function getIcon (sensor) {
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
    }

    vm.selectSensor = function(sensor, event) {
      // if already selected sensor is selected again: clear selection
      if (sensor._id === vm.selectedSensor.id) {
        $scope.$parent.map.selectedSensorMeasurements = [];
        vm.selectedSensor = { id: null };
        return;
      }

      vm.selectedSensor.id = sensor._id; // for styling in the view

      // get chart data once
      if (!vm.chartDone[sensor._id]) {
        getData(sensor._id);
      } else if (vm.selectedMarker.exposure === 'mobile') {
        // if chart was already done once, manually add measurements to the map
        // using the cached measurement data
        $scope.$parent.map.selectedSensorMeasurements = vm.measurements[sensor._id];
      }

      // dont close a chart if it is already open
      if (vm.chartOpen[sensor._id]) {
        event.stopPropagation();
        event.preventDefault();
      }
    };

    /* CHARTS */
    vm.selectedSensor = { id: null };
    vm.columns = [];
    vm.sensordata = {}; // contains transformed measurements for the charts
    vm.measurements = {}; // contains original measurements for the map
    vm.chartDone = {};
    vm.chartError = {};
    vm.chartOpen = {};
    vm.labels = [];

    function getData (sensorId) {
      var endDate = '';
      var box = vm.selectedMarker;
      vm.chartDone[sensorId] = false;
      vm.chartError[sensorId] = false;
      vm.chartOpen[sensorId] = false;

      // Get the date of the last taken measurement for the selected sensor
      for (var i = 0; i < vm.selectedMarkerData.sensors.length; i++){
        if(sensorId === vm.selectedMarkerData.sensors[i]._id){
          var title = vm.selectedMarkerData.sensors[i].title.toString().replace('.','');
          var unit = vm.selectedMarkerData.sensors[i].unit.toString();

          vm.columns[sensorId] = [{'id': title, 'type': 'scatter'}, {'id': 'dates', 'type': 'date'}];
          vm.sensordata[sensorId] = [];
          vm.labels[sensorId] = title +' ('+unit+')';

          if(!vm.selectedMarkerData.sensors[i].lastMeasurement) {
            continue;
          }

          endDate = vm.selectedMarkerData.sensors[i].lastMeasurement.createdAt;

          var data = {
            params: {
              'from-date': '',
              'to-date': endDate
            }
          };
          OpenSenseMapAPI.getSensorData(box._id, sensorId, data)
            .then(function (response) {
              vm.measurements[sensorId] = response;

              // for mobile boxes: show measurements on the map
              if (box.exposure === 'mobile') {
                $scope.$parent.map.selectedSensorMeasurements = response;
              }

              // fill the chart
              for (var j = 0; j < response.length; j++) {
                var d = new Date(response[j].createdAt);
                var dataPair = {};
                dataPair[title] = parseFloat(response[j].value);
                dataPair.dates = d;
                vm.sensordata[sensorId].push(dataPair);
              }
              vm.chartDone[sensorId] = true;

              return response;
            })
            .catch(function (error) {
              console.error(error);
              vm.chartError[sensorId] = true;
              vm.chartDone[sensorId] = true;
            });
        }
      }
    };

    function formatDate (input){
      return d3.time.format('%Y-%m-%d')(new Date(input));
    };
    function formatDateFull (input){
      return d3.time.format('%Y-%m-%d %H:%M:%S')(new Date(input));
    };
  }
})();
