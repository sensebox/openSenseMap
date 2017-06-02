(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .controller('SidebarFilterController', SidebarFilterController);

  SidebarFilterController.$inject = ['$scope', '$timeout', 'boxFilter', 'phenomenonsFilter', 'OpenSenseMapData', 'OpenSenseMapAPI', 'FilterActiveService'];

  function SidebarFilterController ($scope, $timeout, boxFilter, phenomenonsFilter, OpenSenseMapData, OpenSenseMapAPI, FilterActiveService) {
    var vm = this;
    vm.inputFilter = {};
    vm.filterActive = FilterActiveService;
    vm.markers = {};
    vm.filteredMarkers = {};

    vm.openDatePicker = openDatePicker;
    vm.performFilter = performFilter;
    vm.endingDate = endingDate;
    vm.resetFilter = resetFilter;
    vm.liveSearch = liveSearch;
    vm.checkPhenomNeedsRefresh = checkPhenomNeedsRefresh;

    activate();

    ////

    function activate () {
      console.info('Activated Filter');
      vm.markers = OpenSenseMapData.getMarkers();
      vm.filteredMarkers = OpenSenseMapData.getMarkers();
    }

    function openDatePicker ($event) {
      $event.preventDefault();
      $event.stopPropagation();

      // prevent both date pickers from being opened at the same time
      if($event.currentTarget.id === "datepicker1") {
        vm.opened1 = true;
        vm.opened2 = false;
      } else if($event.currentTarget.id === "datepicker2") {
        vm.opened2 = true;
        vm.opened1 = false;
      }
    }

    /*
      Wait 500ms after each additional change/input and then execute the search
    */
    vm._timeout;
    function liveSearch () {
      if(vm._timeout){
        $timeout.cancel(vm._timeout);
      }
      vm._timeout = $timeout(function(){
        vm.performFilter();
        vm._timeout = null;
      }, 500);
    };

    function endingDate (numDays) {
      //TODO use moment and utc
      vm.inputFilter.DateTo = new Date();
      vm.inputFilter.DateFrom = new Date((new Date()).valueOf() - 1000*60*60*24*numDays);
      vm.needsRefresh = true;
    }

    function performFilter () {
      vm.filterActive.active = true;
      vm.loading = true;
      var nameexpr = {
        station: {
          name: vm.inputFilter.Name,
          grouptag: vm.inputFilter.Grouptag,
          exposure: vm.inputFilter.Exposure
        }
      };

      if (vm.needsRefresh &&
        vm.inputFilter.DateTo &&
        vm.inputFilter.DateTo !== '' &&
        vm.inputFilter.DateFrom &&
        vm.inputFilter.DateFrom !== ''
        ) {
        var date = [vm.inputFilter.DateFrom.toISOString(), vm.inputFilter.DateTo.toISOString()]
        if(date !== '' && Array.isArray(date)) {
          date = date.join(',');
        }
        var data = {
          params: {
            date: date,
            phenomenon: vm.inputFilter.Phenomenon,
            exposure: vm.inputFilter.Exposure,
            grouptag: vm.inputFilter.Grouptag,
            model: vm.inputFilter.Model
          }
        };
        getBoxes(data);
      } else if (
          angular.isDefined(vm.inputFilter.Name) ||
          angular.isDefined(vm.inputFilter.Grouptag) ||
          angular.isDefined(vm.inputFilter.Exposure)
        ) {
        var filtered = boxFilter(vm.markers, nameexpr);
        setMarkers(filtered, false);
      } else if (
          angular.isDefined(vm.inputFilter.Phenomenon)
        ) {
        var filtered = phenomenonsFilter(vm.markers, vm.inputFilter.Phenomenon);
        setMarkers(filtered, false);
      }
    }

    function resetFilter () {
      vm.inputFilter.Name = "";
      vm.inputFilter.Grouptag = "";
      vm.inputFilter.DateFrom = "";
      vm.inputFilter.DateTo = "";
      vm.inputFilter.Exposure = "";
      vm.inputFilter.Phenomenon = "";
      vm.filterActive.active = false;
      getBoxes();
    };

    function getBoxes (data) {
      OpenSenseMapAPI.getBoxes(data)
        .then(function (response) {
          setMarkers(response)
        })
        .catch(function (error) {
          console.error(error);
          vm.loading = false;
        });
    }

    function setMarkers (data, classification) {
      OpenSenseMapData.setMarkers(data, classification)
        .then(function (response) {
          vm.filteredMarkers = response;
          $scope.$emit('markersChanged', OpenSenseMapData.getMarkers());
          vm.loading = false;
        })
        .catch(function (error) {
          console.error(error);
          vm.loading = false;
        });
    }

    function checkPhenomNeedsRefresh () {
      if((vm.inputFilter.DateFrom && vm.inputFilter.DateFrom !== '') || (vm.inputFilter.DateTo && vm.inputFilter.DateTo !== '')) {
        vm.needsRefresh=true;
      } else {
        performFilter();
      }
    };
  }
})();
