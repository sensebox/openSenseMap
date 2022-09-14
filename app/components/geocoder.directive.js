(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .directive('osemGeocoder', osemGeocoder);

  osemGeocoder.$inject = [];

  function osemGeocoder () {
    var directive = {
      templateUrl: 'components/geocoder.directive.html',
      link: link,
      // eslint-disable-next-line angular/directive-restrict
      restrict: 'E',
      transclude: true,
      controller: GeocoderController,
      controllerAs: 'geocoder',
      bindToController: true, // because the scope is isolated
      scope: {
        selectBox: '='
      },
    };

    return directive;

    ////

    function link (scope, element, attrs) {}
  }

  GeocoderController.$inject = ['$scope', '$http'];

  function GeocoderController ($scope, $http) {
    var vm = this;

    vm.$onInit = onInit;
    vm.$onDestroy = onDestroy;

    vm.searchString = '';
    vm.showClearSearch = false;
    vm.modelOptions = {
      debounce: {
        default: 300,
        blur: 250,
      },
      getterSetter: true,
    };

    vm.searchStringChanged = searchStringChanged;
    vm.getLocations = getLocations;
    vm.selectResult = selectResult;
    vm.clearSearch = clearSearch;

    ////

    function onInit () {
      activate();
    }

    function onDestroy () {}

    function activate () {}

    function searchStringChanged () {
      if (vm.searchString !== '') {
        vm.showClearSearch = true;
      } else {
        vm.showClearSearch = false;
      }
    }

    function getLocations (searchstring) {
      var results = [];

      return $http
        .get('//locationiq.org/v1/search.php', {
          params: {
            format: 'json',
            key: '23e12b10d8c3aad04e8e',
            addressdetails: 1,
            limit: 4,
            q: searchstring,
          },
        })
        .then(function (response) {
          return results.concat(response.data);
        })
        .catch(function () {
          return results;
        });
    }

    function selectResult (item) {
      $scope.geocoder.selectBox(item);
    }

    function clearSearch () {
      vm.searchString = '';
      vm.searchStringChanged();
    }

    ////
  }
})();
