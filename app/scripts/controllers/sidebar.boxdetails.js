(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .controller('SidebarBoxDetailsController', SidebarBoxDetailsController);

  SidebarBoxDetailsController.$inject = ['$scope', '$stateParams', '$timeout', 'Box', 'OpenSenseMapAPI', 'osemMapData'];

  function SidebarBoxDetailsController ($scope, $stateParams, $timeout, Box, OpenSenseMapAPI, osemMapData) {
    var vm = this;
    vm.box = {};

    vm.focusSelectedBox = focusSelectedBox;
    vm.openChart = openChart;
    vm.resetFilter = resetFilter;
    vm.performFilter = performFilter;

    activate();

    ////

    function activate () {
      OpenSenseMapAPI.getBox($stateParams.id)
        .then(function (response) {
          vm.box = new Box(response);
          vm.archiveLink = vm.box.getArchiveLink();
          focusSelectedBox();
        })
        .catch(function (error) {
          vm.boxNotFound = true;
        })
        .finally(function () {
          $timeout(function () {
            $scope.$broadcast('osemBadgeRefreshStartTimer');
          }, 1000)
        });
    }

    function focusSelectedBox () {
      var markerLatLng = [
        vm.box.loc[0].geometry.coordinates[1],
        vm.box.loc[0].geometry.coordinates[0]
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

    $scope.$on('osemBadgeRefreshFinished', function () {
      vm.box.getLastMeasurement();
      $scope.$broadcast('osemBadgeRefreshStartTimer');
    });

    $scope.$on('osemChartsMouseOver', function (event, data) {
      // console.log('mouseover', data);
    });

    function openChart (sensor, panelOpen){
      if(!panelOpen) {
        sensor.chart.fromDate = undefined;
        sensor.chart.toDate = undefined;
        sensor.chart.error = false;
        sensor.chart.done = false;
        return; // panel is in closing transition, don't fetch new data
      }

      var chartConfig = sensor.chart;
      chartConfig.yAxisTitle = sensor.title + '('+sensor.unit+')';

      getSensorData(sensor, {});
    }

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
