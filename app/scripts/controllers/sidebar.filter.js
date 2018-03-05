(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .controller('SidebarFilterController', SidebarFilterController);

  SidebarFilterController.$inject = ['$scope', '$timeout', 'boxFilter', 'phenomenonFilter', 'OpenSenseMapData', 'OpenSenseMapAPI', 'FilterActiveService', 'Sidebar'];

  function SidebarFilterController ($scope, $timeout, boxFilter, phenomenonFilter, OpenSenseMapData, OpenSenseMapAPI, FilterActiveService, Sidebar) {
    var vm = this;
    vm.inputFilter = {};
    vm.filteredMarkers = {};
    vm.liveFilteredMarkers = [];
    vm.needsRefresh = false;

    vm.performTimeFilter = performTimeFilter;
    vm.resetFilter = resetFilter;
    vm.liveSearch = liveSearch;
    vm.refreshLiveFilter = refreshLiveFilter;
    vm.reset = reset;
    vm.results;

    activate();

    ////

    function activate () {
      Sidebar.setTranslationId('SEARCH_AND_FILTER');
      vm.filteredMarkers = OpenSenseMapData.getMarkers();
      vm.liveFilteredMarkers = OpenSenseMapData.getMarkers();
      vm.results = Object.keys(vm.filteredMarkers).length;

      if (FilterActiveService.active && FilterActiveService.filteredResults) {
        vm.filteredMarkers = FilterActiveService.filteredResults;
      }

      if (FilterActiveService.query) {
        vm.inputFilter.DateFrom = FilterActiveService.query.DateFrom;
        vm.inputFilter.DateTo = FilterActiveService.query.DateTo;
        vm.inputFilter.Name = FilterActiveService.query.Name;
        vm.inputFilter.Exposure = FilterActiveService.query.Exposure;
        vm.inputFilter.vendor = FilterActiveService.query.vendor;
        vm.inputFilter.Grouptag = FilterActiveService.query.Grouptag;
        vm.inputFilter.Phenomenon = FilterActiveService.query.Phenomenon;
      }
    }

    /*
      Wait 500ms after each additional change/input and then execute the search
    */
    vm._timeout;
    function liveSearch (filter) {
      if(vm._timeout){
        $timeout.cancel(vm._timeout);
      }
      vm._timeout = $timeout(function() {
        performLiveFilter(filter);
        vm._timeout = null;
      }, 500);
    }

    function refreshLiveFilter () {
      return performLiveFilter('box');
    }

    function performLiveFilter (filter, useLiveFilteredMarkers, markers) {
      vm.loading = true;
      switch (filter) {
        case 'box':
          var nameexpr = {
            station: {
              name: vm.inputFilter.Name,
              grouptag: vm.inputFilter.Grouptag,
              exposure: vm.inputFilter.Exposure,
              model: vm.inputFilter.vendor
            }
          };

          if (useLiveFilteredMarkers) {
            return boxFilter(markers, nameexpr)
              .then(function (response) {
                setMarkersLive(response);
              });
          }

          return boxFilter(vm.filteredMarkers, nameexpr)
            .then(function (response) {
              if (vm.inputFilter.Phenomenon) {
                return performLiveFilter('phenomenon', true, response);
              }
              setMarkersLive(response);
            });
          break;
        case 'phenomenon':
          if (useLiveFilteredMarkers) {
            return phenomenonFilter(markers, vm.inputFilter.Phenomenon)
              .then(function (response) {
                setMarkersLive(response);
              });
          }
          return phenomenonFilter(vm.filteredMarkers, vm.inputFilter.Phenomenon)
            .then(function (response) {
              if (vm.inputFilter.Exposure !== undefined ||
                  vm.inputFilter.Name !== undefined ||
                  vm.inputFilter.vendor !== undefined ||
                  vm.inputFilter.Grouptag !== undefined) {
                    return performLiveFilter('box', true, response);
              }
              setMarkersLive(response);
            });
          break;
      }
    }

    function performTimeFilter () {
      var date = [vm.inputFilter.DateFrom.toISOString(), vm.inputFilter.DateTo.toISOString()];
      if(date !== '' && Array.isArray(date)) {
        date = date.join(',');
      };
      var data = {
        params: {
          date: date,
          classify: true
        }
      };

      return getBoxes(data)
        .then(function () {
          FilterActiveService.active = true;
        });
    }

    function resetFilter () {
      var data = {
        params: {
          classify: true
        }
      }
      return getBoxes(data)
        .then(function () {
          vm.inputFilter.Name = undefined;
          vm.inputFilter.Grouptag = undefined;
          vm.inputFilter.DateFrom = undefined;
          vm.inputFilter.DateTo = undefined;
          vm.inputFilter.Exposure = undefined;
          vm.inputFilter.Phenomenon = undefined;
          vm.inputFilter.vendor = undefined;
          FilterActiveService.active = false;
          FilterActiveService.query = {};
          vm.needsRefresh = false;
        });
    }

    function reset (filter) {
      var filterType = 'box';
      switch (filter) {
        case "name":
          vm.inputFilter.Name = undefined;
          break;
        case "group":
          vm.inputFilter.Grouptag = undefined;
          break;
        case "vendor":
          vm.inputFilter.vendor = undefined;
          break;
        case "exposure":
          vm.inputFilter.Exposure = undefined;
          break;
        case "phenomenon":
          vm.inputFilter.Phenomenon = undefined;
          filterType = 'box';
          break;
      }
      liveSearch(filterType);
    }

    function getBoxes (data) {
      vm.loading = true;
      return OpenSenseMapAPI.getBoxes(data)
        .then(function (response) {
          setMarkers(response);
        })
        .catch(function (error) {
          console.error(error);
        })
        .finally(function () {
          vm.loading = false;
        });
    }

    function setMarkers (data) {
      return OpenSenseMapData.setMarkers(data)
        .then(function (response) {
          vm.filteredMarkers = response;
          vm.results = Object.keys(vm.filteredMarkers).length;
          $scope.$emit('markersChanged', {});
          if (vm.inputFilter.Exposure !== undefined ||
              vm.inputFilter.Name !== undefined ||
              vm.inputFilter.vendor !== undefined ||
              vm.inputFilter.Phenomenon !== undefined ||
              vm.inputFilter.Grouptag !== undefined) {
            vm.needsRefresh = true;
          }
          FilterActiveService.query = vm.inputFilter;
        })
        .catch(function (error) {
          console.error(error);
        })
        .finally(function () {
          vm.loading = false;
        });
    }

    function setMarkersLive (filteredMarkers) {
      OpenSenseMapData.justSetMarkers(filteredMarkers);
      vm.liveFilteredMarkers = filteredMarkers;
      vm.results = filteredMarkers.length;
      $scope.$emit('markersChanged', {});
      vm.loading = false;
      vm.needsRefresh = false;
      FilterActiveService.active = true;
      FilterActiveService.query = vm.inputFilter;
    }

    // destroy watcher
    $scope.$on('$destroy', function() {
      Sidebar.setTranslationId('');
      $timeout.cancel( vm._timeout );
      if (FilterActiveService.active) {
        FilterActiveService.filteredResults = vm.filteredMarkers;
      } else {
        delete FilterActiveService.filteredResults;
      }
    });
  }
})();
