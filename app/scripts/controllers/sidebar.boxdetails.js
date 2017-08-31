(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .controller('SidebarBoxDetailsController', SidebarBoxDetailsController);

  SidebarBoxDetailsController.$inject = ['$scope', '$stateParams', '$timeout', 'Box', 'OpenSenseMapAPI', 'osemMapData'];

  function SidebarBoxDetailsController ($scope, $stateParams, $timeout, Box, OpenSenseMapAPI, osemMapData) {
    var vm = this;
    vm.box = {};

    vm.getBadgeColor = getBadgeColor;
    vm.focusSelectedBox = focusSelectedBox;
    vm.selectSensor = selectSensor;
    vm.resetFilter = resetFilter;
    vm.performFilter = performFilter;

    activate();

    ////

    function activate () {
      OpenSenseMapAPI.getBox($stateParams.id)
        .then(function (response) {
          vm.box = new Box(response);
          vm.archiveLink = vm.box.getArchiveLink();

          // for mobile boxes, get it's trajectory and add it to the map
          if (vm.box.exposure === 'mobile') {
            return OpenSenseMapAPI.getBoxLocations($stateParams.id)
              // save result in map.js scope, as it needs to be accessible for leaflet directive
              .then(function (response) {
                $scope.$parent.map.boxLocations = response;
                return response;
              });
          }
        })
        .catch(function (error) {
          vm.boxNotFound = true;
        })
        .then(function (trajectory) {
          focusSelectedBox(trajectory);
        })
        .finally(function () {
          $timeout(function () {
            $scope.$broadcast('osemBadgeRefreshStartTimer');
          }, 1000)
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

    // focus current location of a box or its trajectory, if optional
    // `trajectory` GeoJSON linestring is provided
    function focusSelectedBox (trajectory) {
      var currentLoc = [
        vm.box.currentLocation.coordinates[1],
        vm.box.currentLocation.coordinates[0]
      ];

      console.log(trajectory)

      var bounds = trajectory && trajectory.geometry.coordinates.length
        ? L.geoJSON(trajectory).getBounds()
        : [currentLoc, currentLoc];

      return centerBounds(bounds);
    }

    function centerBounds (bounds) {
      osemMapData.getMap('map_main').then(function(map) {
        var padding = 450; // sidebar width: 450px
        // consider smaller devices (250px min map-width + 450px sidebar-width)
        if (document.body.clientWidth <= 700) padding = 0;

        console.log(bounds)
        map.fitBounds(bounds, {
          paddingTopLeft: [0,0],
          paddingBottomRight: [padding, 0],
          maxZoom: 17,
          animate: false
        });
      });
    }

    $scope.$on('$destroy', function(ev) {
      // reset externally stored state
      $scope.$parent.map.legendInfo = {};
      $scope.$parent.map.boxLocations = {};
      $scope.$parent.map.selectedSensorMeasurements = [];
    });

    $scope.$on('osemBadgeRefreshFinished', function () {
      vm.box.getLastMeasurement();
      $scope.$broadcast('osemBadgeRefreshStartTimer');
    });

    $scope.$on('osemChartsMouseOver', function (event, data) {
      // console.log('mouseover', data);
    });


    /* CHARTS */
    vm.selectedSensor = { id: null };
    vm.measurements = {}; // contains original measurements for the map

    function selectSensor(sensor, event) {
      $scope.$parent.map.selectedSensorMeasurements = [];
      $scope.$parent.map.legendInfo = {};
      sensor.chart.fromDate = undefined;
      sensor.chart.toDate = undefined;
      sensor.chart.error = false;

      // if already selected sensor is selected again: clear selection
      if (sensor._id === vm.selectedSensor.id) {
        vm.selectedSensor = { id: null };
        return;
      }

      vm.selectedSensor.id = sensor._id; // for styling in the view

      // get chart data once
      if (!sensor.chart.done) {
        getSensorData(sensor, {});
      } else if (vm.box.exposure === 'mobile') {
        // if chart was already done once, manually add measurements to the map
        // using the cached measurement data
        $scope.$parent.map.selectedSensorMeasurements = vm.measurements[sensor._id];
      }

      var chartConfig = sensor.chart;
      chartConfig.yAxisTitle = sensor.title + '('+sensor.unit+')';

      angular.extend($scope.$parent.map.legendInfo, { unit: sensor.unit });

      // dont close a chart if it is already open when being selected
      if (sensor.chart.open) {
        event.stopPropagation();
        event.preventDefault();
      }
    };

    function resetFilter (sensor) {
      return getSensorData(sensor, {});
    }

    function performFilter (sensor) {
      var data = {
        params: {
          'from-date': sensor.chart.fromDate.toISOString(),
          'to-date': sensor.chart.toDate.toISOString()
        }
      }
      return getSensorData(sensor, data);
    }

    function getSensorData (sensor, data) {
      return OpenSenseMapAPI.getSensorData(vm.box._id, sensor._id, data)
        .then(function (response) {
          // for mobile boxes: show measurements on the map
          if (vm.box.exposure === 'mobile') {
            vm.measurements[sensor._id] = response;
            $scope.$parent.map.selectedSensorMeasurements = response;
          }

          sensor.chart.data = [];
          for (var j = 0; j < response.length; j++) {
            var d = new Date(response[j].createdAt);
            var dataPair = {};
            dataPair.value = parseFloat(response[j].value);
            dataPair.date = d;
            dataPair.unit = sensor.unit;
            sensor.chart.data.push(dataPair);
          }
          sensor.chart.done = true;
        })
        .catch(function (error) {
          sensor.chart.error = true;
        });
    }
  }
})();
