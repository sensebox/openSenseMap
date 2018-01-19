(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .controller('SidebarBoxDetailsController', SidebarBoxDetailsController);

  SidebarBoxDetailsController.$inject = ['$scope', '$stateParams', '$timeout', 'Box', 'OpenSenseMapAPI', 'osemMapData', 'Sidebar'];

  function SidebarBoxDetailsController ($scope, $stateParams, $timeout, Box, OpenSenseMapAPI, osemMapData, Sidebar) {
    var vm = this;
    vm.box = {};
    vm.selectedSensor = null;
    vm.minimized = false;

    vm.selectSensor = selectSensor;
    vm.resetFilter = resetFilter;
    vm.performFilter = performFilter;
    vm.getTimeAgo = getTimeAgo;

    activate();

    ////

    function activate () {
      OpenSenseMapAPI.getBox($stateParams.id)
        .then(function (response) {
          vm.box = new Box(response);
          Sidebar.setTitle(vm.box.name);
          Sidebar.addAction({href: vm.box.getArchiveLink(), target: '_blank', icon: 'fa-archive', hideOnMinimized: true});
          Sidebar.addAction({handler: focusSelectedBox, icon: 'fa-thumb-tack', hideOnMinimized: false});
          focusSelectedBox();
          if (vm.box.exposure === 'mobile') getBoxTrajectory();
        })
        .catch(function (error) {
          vm.boxNotFound = true;
        })
        .finally(function () {
          $scope.$parent.$broadcast('boxSelected', vm.box);
          $timeout(function () {
            $scope.$broadcast('osemBadgeRefreshStartTimer');
          }, 1000)
        });
    }

    function getTimeAgo (lastMeasurement) {
      return moment(lastMeasurement).fromNow();
    }

    function getBoxTrajectory (options) {
      var options = Object.assign({ format: 'geojson' }, options);
      var data = { params: options };
      return OpenSenseMapAPI.getBoxLocations($stateParams.id, data)
        .then(function (response) {
          // save result in map.js scope, as it needs to be accessible for leaflet directive
          $scope.$parent.map.boxLocations = response;
          focusSelectedBox(response);
          return response;
        })
    }

    // focus current location of a box or its trajectory, if optional
    // `trajectory` GeoJSON linestring is provided
    function focusSelectedBox (trajectory) {
      var currentLoc = [
        vm.box.currentLocation.coordinates[1],
        vm.box.currentLocation.coordinates[0]
      ];

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
        if (Sidebar.minimized) padding = 0;

        map.fitBounds(bounds, {
          paddingTopLeft: [0,0],
          paddingBottomRight: [padding, 0],
          maxZoom: 17,
          animate: false
        });
      });
    }

    $scope.$on('$destroy', function(ev) {
      $scope.$parent.$broadcast('boxDeselected', vm.box);
      // reset externally stored state
      $scope.$parent.map.legendInfo = {};
      $scope.$parent.map.boxLocations = {};
      $scope.$parent.map.selectedSensorMeasurements = [];
    });

    $scope.$on('osemBadgeRefreshFinished', function () {
      vm.box.getLastMeasurement();

      // update trajectory and (map)measurements for mobile boxes
      // but only if there is no time filter selected in the chart
      if (
        vm.box.exposure === 'mobile' &&
        (!vm.selectedSensor || !vm.selectedSensor.chart.toDate)
      ) {
        if (vm.selectedSensor) getSensorData(vm.selectedSensor);
        getBoxTrajectory();
      }

      $scope.$broadcast('osemBadgeRefreshStartTimer');
    });

    // sync the selected measurement between chart & map
    // TODO: more elegant way of 2way binding?
    $scope.$on('osemChartsMouseOver', function (event, data) {
      $scope.$parent.map.highlightedMeasure = data;
    });
    $scope.$on('osemChartsMouseOut', function (event, data) {
      $scope.$parent.map.highlightedMeasure = undefined;
    });
    $scope.$on('osemMeasurementMouseOver.map_main', function (e, args) {
      vm.selectedSensor.chart.selectedMeasurement = args.target.options.measurement;
    });
    $scope.$on('osemMeasurementMouseOut.map_main', function (e, args) {
      vm.selectedSensor.chart.selectedMeasurement = undefined;
    });

    $scope.$on('$destroy', function () {
      Sidebar.removeActions();
      Sidebar.setTitle('');
    });

    function selectSensor(sensor, event) {
      $scope.$parent.map.selectedSensorMeasurements = [];
      $scope.$parent.map.legendInfo = {};
      sensor.chart.fromDate = undefined;
      sensor.chart.toDate = undefined;
      sensor.chart.error = false;

      // if already selected sensor is selected again: clear selection
      if (sensor === vm.selectedSensor) {
        vm.selectedSensor = null;
        return;
      }
      vm.selectedSensor = sensor;

      // get chart data once and add measurements to the map
      // if we have them already, use the cached data
      if (!sensor.measurements) {
        var data = {
          params: {}
        };
        if (angular.isDefined(sensor.lastMeasurement)) {
          data.params['to-date'] = sensor.lastMeasurement.createdAt;
        }

        getSensorData(sensor, data);
      } else if (vm.box.exposure === 'mobile') {
        $scope.$parent.map.selectedSensorMeasurements = sensor.measurements;
      }

      sensor.chart.yAxisTitle = sensor.title + '('+sensor.unit+')';
      angular.extend($scope.$parent.map.legendInfo, { unit: sensor.unit });

      // dont close a chart if it is already open when being selected
      if (sensor.chart.open) {
        event.stopPropagation();
        event.preventDefault();
      }
    };

    function resetFilter (sensor) {
      var data = {
        params: {}
      };
      if (angular.isDefined(sensor.lastMeasurement)) {
        data.params['to-date'] = sensor.lastMeasurement.createdAt;
      }

      return getSensorData(sensor, data);
    }

    function performFilter (sensor) {
      var data = {
        params: {
          'from-date': sensor.chart.fromDate.toISOString(),
          'to-date': sensor.chart.toDate.toISOString()
        }
      }

      if (vm.box.exposure === 'mobile') {
        getBoxTrajectory(data.params) // might need an update for the new timeframe
      }

      return getSensorData(sensor, data);
    }

    function getSensorData (sensor, data) {
      return OpenSenseMapAPI.getSensorData(vm.box._id, sensor._id, data)
        .then(function (response) {
          sensor.chart.data = [];
          for (var j = 0; j < response.length; j++) {
            sensor.chart.data.push({
              id: response[j].id,
              value: parseFloat(response[j].value),
              date: new Date(response[j].createdAt),
              unit: sensor.unit,
            });
          }
          sensor.chart.done = true;
          return response;
        })
        .then(function (measurements) {
          if (vm.box.exposure === 'mobile') {
            sensor.measurements = measurements;
            $scope.$parent.map.selectedSensorMeasurements = measurements;
          }
          return measurements;
        })
        .catch(function (error) {
          sensor.chart.error = true;
        });
    }
  }
})();
