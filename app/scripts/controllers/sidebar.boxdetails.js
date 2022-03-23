(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .controller('SidebarBoxDetailsController', SidebarBoxDetailsController);

  SidebarBoxDetailsController.$inject = ['$scope', '$state', '$stateParams', '$document', 'moment', '$timeout', 'Box', 'OpenSenseMapAPI', 'osemMapData', 'Sidebar', 'LocalStorageService', 'ngDialog'];

  function SidebarBoxDetailsController ($scope, $state, $stateParams, $document, moment, $timeout, Box, OpenSenseMapAPI, osemMapData, Sidebar, LocalStorageService, ngDialog) {
    var vm = this;
    vm.box = {};
    vm.selectedSensor = null;
    vm.minimized = false;

    vm.selectSensor = selectSensor;
    vm.resetFilter = resetFilter;
    vm.performFilter = performFilter;
    vm.openInformation = openInformation;

    activate();

    ////

    function activate () {
      return OpenSenseMapAPI.getBox($stateParams.id)
        .then(function (response) {
          vm.box = new Box(response);
          Sidebar.setTitle(vm.box.name);
          Sidebar.addAction({ href: vm.box.getArchiveLink(), target: '_blank', icon: 'fa-archive', hideOnMinimized: true });
          Sidebar.addAction({ handler: focusSelectedBox, icon: 'fa-thumb-tack', hideOnMinimized: false });

          var account = LocalStorageService.getValue('osem.account');
          if (account) {
            var boxes = JSON.parse(account).boxes;
            if (boxes.indexOf($stateParams.id) > -1) {
              Sidebar.addAction({ handler: editBox, icon: 'fa-pencil', hideOnMinimized: true });
            }
          }

          focusSelectedBox();
        })
        .catch(function () {
          vm.boxNotFound = true;
        })
        .finally(function () {
          $scope.$parent.$parent.$broadcast('boxSelected', vm.box);
          $timeout(function () {
            $scope.$broadcast('osemBadgeRefreshStartTimer');
          }, 1000);
        });
    }

    function openInformation (title) {
      var prefix = '';
      var showInfluence = true;
      var showFunFact = true;
      switch (title.toLowerCase()) {
      case 'temperatur':
      case 'temperature':
      case 'lufttemperatur':
        prefix = 'TEMPERATURE';
        break;
      case 'rel. luftfeuchte':
      case 'luftfeuchte':
        prefix = 'HUMIDITY';
        break;
      case 'luftdruck':
      case 'atm. luftdruck':
        prefix = 'AIRPRESSURE';
        break;
      case 'beleuchtungsstärke':
      case 'illuminence':
        showInfluence = false;
        prefix = 'ILLUMINENCE';
        break;
      case 'uv-index':
      case 'uv-intensität':
        prefix = 'UV';
        showInfluence = false;
        break;
      case 'pm10':
      case 'pm2.5':
        prefix = 'PARTICULAR_MATTER';
        showFunFact = false;
        break;
      case 'innenraumluftqualität (iaq)':
        prefix = 'IAQ';
        break;
      case 'kalibrierungswert':
        prefix = 'CALIBRATION';
        showFunFact = false;
        showInfluence = false;
        break;
      case 'co2 äquivalent':
        prefix = 'CO2';
        showInfluence = false;
        break;
      case 'atemluft voc äquivalent':
        prefix = 'VOC';
        showInfluence = false;
        showFunFact = false;
        break;
      }

      if (prefix !== '') {
        ngDialog.open({
          template: '../../views/phenomenon.html',
          appendClassName: 'ngdialog-custom',
          showClose: true,
          closeByDocument: false,
          data: {
            'phenomenon': title,
            'showDefinition': true,
            'definition': prefix + '_DEFINITION',
            'showUnit': true,
            'unit': prefix + '_UNIT',
            'showInterpretation': true,
            'interpretation': prefix + '_INTERPRETATION',
            'showInfluence': showInfluence,
            'influence': prefix + '_INFLUENCE',
            'showFunFact': showFunFact,
            'funfact': prefix + '_FUN_FACT'
          }
        });
      }

    }

    function getBoxTrajectory (options) {
      var params = Object.assign({ format: 'geojson' }, options);
      var data = { params: params };

      return OpenSenseMapAPI.getBoxLocations($stateParams.id, data)
        .then(function (response) {
          // save result in map.js scope, as it needs to be accessible for leaflet directive
          $scope.$parent.map.boxLocations = response;
          focusSelectedBox(response);

          return response;
        });
    }

    function editBox () {
      $state.go('account.edit.general', { id: vm.box._id });
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
      osemMapData.getMap('map_main').then(function (map) {
        var padding = 450; // sidebar width: 450px
        // consider smaller devices (250px min map-width + 450px sidebar-width)
        if ($document[0].body.clientWidth <= 700) {padding = 0;}
        if (Sidebar.minimized) {padding = 0;}

        map.fitBounds(bounds, {
          paddingTopLeft: [0, 0],
          paddingBottomRight: [padding, 0],
          maxZoom: 17,
          animate: false
        });
      });
    }

    $scope.$on('$destroy', function () {
      $scope.$parent.$parent.$broadcast('boxDeselected', vm.box);
      // reset externally stored state
      $scope.$parent.map.legendInfo = {};
      $scope.$parent.map.boxLocations = {};
      $scope.$parent.map.selectedSensorMeasurements = [];

      Sidebar.removeActions();
      Sidebar.setTitle('');
    });

    $scope.$on('osemBadgeRefreshFinished', function () {
      vm.box.getLastMeasurement();

      // update trajectory and (map)measurements for mobile boxes
      // but only if there is no time filter selected in the chart
      if (
        vm.box.exposure === 'mobile' &&
        (!vm.selectedSensor || !vm.selectedSensor.chart.toDate)
      ) {
        if (vm.selectedSensor) {
          var params = {};
          params.toDate = vm.selectedSensor.lastMeasurement.createdAt;
          performFilter(vm.selectedSensor, params);
        }
      }

      $scope.$broadcast('osemBadgeRefreshStartTimer');
    });

    $scope.$on('osemChartsMouseOver', function (event, data) {
      $scope.$parent.map.highlightedMeasure = data;
    });
    $scope.$on('osemChartsMouseOut', function () {
      $scope.$parent.map.highlightedMeasure = undefined;
    });
    $scope.$on('osemMeasurementMouseOver.map_main', function (e, args) {
      vm.selectedSensor.chart.selectedMeasurement = args.target.options.measurement;
    });
    $scope.$on('osemMeasurementMouseOut.map_main', function () {
      vm.selectedSensor.chart.selectedMeasurement = undefined;
    });

    function selectSensor (sensor, event) {
      $scope.$parent.map.selectedSensorMeasurements = [];
      $scope.$parent.map.legendInfo = {};
      sensor.chart.error = false;

      // if already selected sensor is selected again: clear selection
      if (sensor === vm.selectedSensor) {
        sensor.locations = $scope.$parent.map.boxLocations;
        $scope.$parent.map.boxLocations = {};
        vm.selectedSensor = null;

        return;
      }
      vm.selectedSensor = sensor;

      // get chart data once and add measurements to the map
      // if we have them already, use the cached data
      if (!sensor.measurements) {
        var params = {};
        if (angular.isDefined(sensor.chart.fromDate) && angular.isDefined(sensor.chart.toDate)) {
          params.toDate = sensor.chart.toDate.toISOString();
          params.fromDate = sensor.chart.fromDate.toISOString();
        } else if (angular.isDefined(sensor.lastMeasurement)) {
          params.toDate = sensor.lastMeasurement.createdAt;
        } else {
          return;
        }

        performFilter(sensor, params);
      } else if (vm.box.exposure === 'mobile') {
        $scope.$parent.map.selectedSensorMeasurements = sensor.measurements;
        $scope.$parent.map.boxLocations = sensor.locations;
      }

      sensor.chart.yAxisTitle = sensor.title + '(' + sensor.unit + ')';
      angular.extend($scope.$parent.map.legendInfo, { unit: sensor.unit });

      // dont close a chart if it is already open when being selected
      if (sensor.chart.open) {
        event.stopPropagation();
        event.preventDefault();
      }
    }

    function resetFilter (sensor) {
      $scope.$parent.map.selectedSensorMeasurements = [];
      $scope.$parent.map.legendInfo = {};
      $scope.$parent.map.boxLocations = {};

      var data = {
        params: {}
      };
      if (angular.isDefined(sensor.lastMeasurement)) {
        data.params['to-date'] = sensor.lastMeasurement.createdAt;
      }

      if (vm.box.exposure === 'mobile') {
        getBoxTrajectory(data.params); // might need an update for the new timeframe
      }

      return getSensorData(sensor, data);
    }

    function performFilter (sensor, params) {
      var data = {
        params: {}
      };

      if (params) {
        if (params.toDate) {
          data.params['to-date'] = params.toDate;
        }
        if (params.fromDate) {
          data.params['from-date'] = params.fromDate;
        }
      } else {
        data.params['to-date'] = sensor.chart.toDate.toISOString();
        data.params['from-date'] = sensor.chart.fromDate.toISOString();
      }

      if (vm.box.exposure === 'mobile') {
        getBoxTrajectory(data.params); // might need an update for the new timeframe
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
        .catch(function () {
          sensor.chart.error = true;
        });
    }
  }
})();
