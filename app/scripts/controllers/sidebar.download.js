(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .controller('SidebarDownloadController', SidebarDownloadController);

  SidebarDownloadController.$inject = [
    '$scope',
    '$httpParamSerializer',
    'app',
    'OpenSenseMapAPI',
    'OpenSenseMapData',
    'osemMapData',
    'Sidebar',
    'boxes'
  ];

  function SidebarDownloadController (
    $scope,
    $httpParamSerializer,
    app,
    OpenSenseMapAPI,
    OpenSenseMapData,
    osemMapData,
    Sidebar,
    boxes
  ) {
    var vm = this;
    vm.map;
    vm.inputFilter = {
      window: 'raw',
      operation: 'arithmeticMean'
    };
    vm.downloadform = {
      format: 'csv',
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
      sensorType: ''
    };

    vm.dataDownload = dataDownload;
    vm.closeSidebar = closeSidebar;
    vm.changeWindow = changeWindow;
    vm.getHref = getHref;

    activate();

    ////

    function activate () {
      Sidebar.setTitle('Download');
      OpenSenseMapData.setMarkers(boxes); // retrieved through state.resolve in app.js (because we need the full metadata for filtering)
      vm.markersFiltered = OpenSenseMapData.getMarkers();
      vm.downloadMarkers = vm.markersFiltered;
      vm.count = Object.keys(vm.markersFiltered).length;

      osemMapData.getMap('map_main').then(function (map) {
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

    function getDownloadParameters () {
      var boxids = getBoxIdsFromBBox(vm.map);
      var columns = [];
      for (var key in vm.columns) {
        if (vm.columns.hasOwnProperty(key)) {
          var element = vm.columns[key];
          if (element !== '') {
            columns.push(element);
          }
        }
      }

      var params = {
        format: vm.downloadform.format,
        boxid: boxids.join(','),
        'to-date': vm.inputFilter.DateTo.toISOString(),
        'from-date': vm.inputFilter.DateFrom.toISOString(),
        phenomenon: vm.inputFilter.Phenomenon,
        columns: columns.join(','),
        download: true
      };

      return params;
    }

    function dataDownload () {
      vm.downloadform.pleaseWait = true;
      var params = getDownloadParameters();

      if (vm.inputFilter.window === 'raw') {
        OpenSenseMapAPI.getData(params);
      } else {
        params.window = vm.inputFilter.window;
        params.operation = vm.inputFilter.operation;
        OpenSenseMapAPI.getStatisticalData(params);
      }
    }

    function getHref () {
      if (
        vm.map &&
        vm.inputFilter.DateTo &&
        vm.inputFilter.DateFrom &&
        vm.inputFilter.Phenomenon
      ) {
        var params = getDownloadParameters();
        var endpoint = '';
        if (vm.inputFilter.window === 'raw') {
          endpoint = '/boxes/data';
        } else {
          params.window = vm.inputFilter.window;
          params.operation = vm.inputFilter.operation;
          endpoint = '/statistics/descriptive';
        }
        var query = $httpParamSerializer(params);

        return encodeURI(app.API_URL + '/' + endpoint + '?' + query);
      }

      return '';
    }

    function getBoxIdsFromBBox (map) {
      var boxids = [];
      var bbox = map.getBounds();
      vm.downloadMarkers = [];
      angular.forEach(vm.markersFiltered, function (marker) {
        if (bbox.contains([marker.latLng[0], marker.latLng[1]])) {
          boxids.push(marker.station._id);
          vm.downloadMarkers.push(marker);
        }
      });

      return boxids;
    }

    ////

    $scope.$on('osemMapReady', function () {
      osemMapData
        .getMap('map_main')
        .then(function (map) {
          vm.map = map;
          $scope.$broadcast('initData', {});
          vm.map.on('zoomend moveend', mapZoomMove);
        })
        .catch(function () {});
    });

    $scope.$on('initData', function () {
      vm.count = getBoxIdsFromBBox(vm.map).length;
    });

    $scope.$on('$destroy', function () {
      Sidebar.setTitle('');
    });
  }
})();
