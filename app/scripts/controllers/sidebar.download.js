(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .controller('SidebarDownloadController', SidebarDownloadController);

  SidebarDownloadController.$inject = ['$scope', 'moment', 'OpenSenseMapAPI', 'OpenSenseMapData', 'osemMapData'];

  function SidebarDownloadController ($scope, moment, OpenSenseMapAPI, OpenSenseMapData, osemMapData) {
    var vm = this;
    vm.map;
    vm.inputFilter = {
      DateTo: '',
      DateFrom: ''
    };
    vm.downloadform = {
      format: 'CSV',
      pleaseWait: false,
      emptyData: false,
      errorOccured: false
    };

    vm.endingDate = endingDate;
    vm.openDatePicker = openDatePicker;
    vm.dataDownload = dataDownload;
    vm.closeSidebar = closeSidebar;

    activate();

    ////

    function activate () {
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

    function endingDate (numDays) {
      vm.inputFilter.DateTo = moment.utc().toDate();
      vm.inputFilter.DateFrom = moment.utc().subtract(numDays, 'days').toDate();
    }

    function openDatePicker ($event) {
      $event.preventDefault();
      $event.stopPropagation();

      // prevent both date pickers from being opened at the same time
      if($event.currentTarget.id === 'datepicker1') {
        vm.opened1 = true;
        vm.opened2 = false;
      } else if($event.currentTarget.id === 'datepicker2') {
        vm.opened2 = true;
        vm.opened1 = false;
      }
    }

    function dataDownload () {
      vm.downloadform.pleaseWait = true;
      var boxids = getBoxIdsFromBBox(vm.map);
      var data = {
        params: {
          boxid: boxids.join(','),
          'to-date': vm.inputFilter.DateTo,
          'from-date': vm.inputFilter.DateFrom,
          phenomenon: vm.inputFilter.Phenomenon
        }
      };

      return OpenSenseMapAPI.getData(data)
        .then(function (data) {
          if(data.length>0){
            var blob = new Blob([data],{type:'text/csv;charset=utf-8;'});
            var link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = 'opensensemap_org-download-' + encodeURI(vm.inputFilter.Phenomenon) + stampDownload() +'.csv';
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          } else {
            vm.downloadform.emptyData=true;
          }
          vm.downloadform.pleaseWait = false;
        })
        .catch(function (error) {
          vm.downloadform.pleaseWait = false;
          if(data.length===0 && error === 404){
            vm.downloadform.emptyData=true;
          } else {
            vm.downloadform.errorOccured = true;
            console.log(error);
          }
        });
    }

    function stampDownload () {
      try {
        return '-' + moment.utc().toISOString().replace(/-|:|\.\d*Z/g,'').replace('T','_');
      } catch (e) {
        return '';
      }
    }

    function getBoxIdsFromBBox (map){
      var boxids = [];
      var bbox = map.getBounds();
      angular.forEach(vm.markersFiltered, function(marker, key) {
        if(bbox.contains([marker.lat, marker.lng])) {
          boxids.push(marker.station.id);
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
  }
})();
