(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .controller('SidebarDownloadController', SidebarDownloadController);

  SidebarDownloadController.$inject = ['$scope', 'moment', 'OpenSenseMapAPI', 'OpenSenseMapData', 'osemMapData', 'Sidebar'];

  function SidebarDownloadController ($scope, moment, OpenSenseMapAPI, OpenSenseMapData, osemMapData, Sidebar) {
    var vm = this;
    vm.map;
    vm.inputFilter = {
      window: 'raw',
      operation: 'arithmeticMean'
    };
    vm.downloadform = {
      format: 'CSV',
      pleaseWait: false,
      emptyData: false,
      errorOccured: false
    };
    vm.columns = {
      lat: 'lat',
      lng: 'lon',
      height: '',
      boxName: 'boxName',
      boxId: 'boxId',
      exposure: '',
      unit: 'unit',
      value: 'value',
      createdAt: 'createdAt',
      phenomenon: '',
      sensorId: '',
      sensorType: '',
    }

    vm.dataDownload = dataDownload;
    vm.closeSidebar = closeSidebar;
    vm.changeWindow = changeWindow;

    activate();

    ////

    function activate () {
      Sidebar.setTitle('Download');
      vm.markersFiltered = OpenSenseMapData.getMarkers();
      vm.count = Object.keys(vm.markersFiltered).length;

      osemMapData.getMap('map_main')
        .then(function (map) {
          vm.map = map;
          $scope.$broadcast('initData', {});
          vm.map.on('zoomend moveend', mapZoomMove);
          return 'event attached';
        });
    }

    function closeSidebar () {
      vm.map.off('zoomend moveend', mapZoomMove);
    }

    function mapZoomMove () {
      vm.count = getBoxIdsFromBBox(vm.map).length;
      $scope.$apply();
    }

    function changeWindow () {
      switch (vm.inputFilter.window) {
        case '1h':
        case '1d':
        case '10m':
          vm.columns.createdAt = '';
          vm.columns.sensorId = '';
          vm.columns.value = '';
          break;
      }
    }

    function dataDownload () {
      vm.downloadform.pleaseWait = true;
      var boxids = getBoxIdsFromBBox(vm.map);
      var columns = [];
      for (var key in vm.columns) {
        if (vm.columns.hasOwnProperty(key)) {
          var element = vm.columns[key];
          if (element !== '') {
            columns.push(element)
          }
        }
      }

      var params = {
        boxid: boxids.join(','),
        'to-date': vm.inputFilter.DateTo.toISOString(),
        'from-date': vm.inputFilter.DateFrom.toISOString(),
        phenomenon: vm.inputFilter.Phenomenon,
        columns: columns.join(','),
        download: true,
        format: vm.downloadform.format
      };

      if (vm.inputFilter.window === 'raw') {
        params.columns = columns;
        OpenSenseMapAPI.getData(params);
      } else {
        params.window = vm.inputFilter.window;
        params.operation = vm.inputFilter.operation;
        OpenSenseMapAPI.getStatisticalData(params);
      }
    }

    function getBoxIdsFromBBox (map){
      var boxids = [];
      var bbox = map.getBounds();
      angular.forEach(vm.markersFiltered, function(marker, key) {
        if (bbox.contains([marker.latLng[0],marker.latLng[1]])) {
          boxids.push(marker.station._id);
        }
      });
      return boxids;
    };

    ////


    $scope.$on('osemMapReady', function () {

      osemMapData.getMap('map_main')
        .then(function (map) {
          vm.map = map;
          $scope.$broadcast('initData', {});
          vm.map.on('zoomend moveend', mapZoomMove);
        })
        .catch(function (error) {
          console.log(error);
        });
    });

    $scope.$on('initData', function (e, args) {
      vm.count = getBoxIdsFromBBox(vm.map).length;
    });

    $scope.$on('$destroy', function () {
      Sidebar.setTitle('');
    });
  }
})();
