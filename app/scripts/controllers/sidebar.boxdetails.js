(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .controller('SidebarBoxDetailsController', SidebarBoxDetailsController);

  SidebarBoxDetailsController.$inject = ['$scope', '$stateParams', 'OpenSenseMapAPI', 'OpenSenseMapData', 'osemMapData'];

  function SidebarBoxDetailsController ($scope, $stateParams, OpenSenseMapAPI, OpenSenseMapData, osemMapData) {
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
      // $timeout.cancel(vm.prom);
    }

    function getMeasurements () {
      // vm.prom = $timeout(getMeasurements, vm.delay);
      OpenSenseMapAPI.getSensors($stateParams.id)
        .then(function (response) {
          if (vm.selectedMarkerData === undefined) {
            vm.selectedMarkerData = response;
          } else {
            vm.selectedMarkerData.sensors.map(function (value) {
              for (var i = 0; i < response.sensors.length; i++) {
                if (value._id === response.sensors[i]._id && value.lastMeasurement !== null && value.lastMeasurement !== undefined ) {
                  angular.extend(value.lastMeasurement, response.sensors[i].lastMeasurement);
                  var datapair = {
                    date: new Date(response.sensors[i].lastMeasurement.createdAt),
                    value: response.sensors[i].lastMeasurement.value
                  }
                  if (angular.isDefined(vm.sensordata[response.sensors[i]._id])) {
                    vm.sensordata[response.sensors[i]._id].push(datapair);
                  }
                }
              }
            });
          }
        })
        .catch(function (error) {
          console.error(error);
        })
        .finally(function () {
          $scope.$broadcast('osemBadgeRefreshStartTimer');
        });
    }

    function getBadgeColor (exposure) {
      if (exposure === 'indoor') {
        return 'orange';
      } else {
        return 'olive';
      }
    }

    function focusSelectedBox () {
      var markerLatLng = [
        vm.selectedMarker.loc[0].geometry.coordinates[1],
        vm.selectedMarker.loc[0].geometry.coordinates[0]
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

    $scope.$on('osemBadgeRefreshFinished', function () {
      getMeasurements();
    });

    /* CHARTS */
    vm.columns = [];
    vm.sensordata = {};
    vm.chartDone = {};
    vm.chartError = {};
    vm.labels = [];
    function getData (sensorId, panelOpen){
      if(!panelOpen) {
        console.log(vm.chartDone);
        delete vm.chartDone[sensorId];
        return; // panel is in closing transition, don't fetch new data
      }
      var endDate = '';
      var box = vm.selectedMarker._id;
      vm.chartDone[sensorId] = false;
      vm.chartError[sensorId] = false;

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
              'to-date': endDate
            }
          };
          OpenSenseMapAPI.getSensorData(box, sensorId, data)
            .then(function (response) {
              for (var j = 0; j < response.length; j++) {
                var d = new Date(response[j].createdAt);
                var dataPair = {};
                dataPair.value = parseFloat(response[j].value);
                dataPair.date = d;
                dataPair.unit = unit;
                vm.sensordata[sensorId].push(dataPair);
              }
              vm.chartDone[sensorId] = true;
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
