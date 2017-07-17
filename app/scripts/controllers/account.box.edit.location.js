(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .controller('EditBoxLocationController', EditBoxLocationController);

  EditBoxLocationController.$inject = ['$scope', 'boxData', 'notifications', 'MapService', 'AccountService'];

  function EditBoxLocationController ($scope, boxData, notifications, MapService, AccountService) {
    var vm = this;
    vm.editMarkerInput = {};
    vm.originalPosition = {};

    vm.save = save;
    vm.resetPosition = resetPosition;

    activate();

    ////

    function activate () {
      vm.defaults = MapService.defaults;
      vm.events = MapService.events;

      vm.boxPosition = {
        lng: parseFloat(boxData.loc[0].geometry.coordinates[0].toFixed(6)),
        lat: parseFloat(boxData.loc[0].geometry.coordinates[1].toFixed(6)),
        draggable: true,
        zoom: 17
      };

      angular.copy(vm.boxPosition, vm.originalPosition);

      vm.editMarker = {
        m1: angular.copy(vm.boxPosition)
      };
      angular.copy(vm.boxPosition, vm.editMarkerInput);
    }

    function save () {
      return AccountService.updateBox(boxData._id, {loc: vm.editMarker.m1})
        .then(function (response) {
          angular.copy(response.data, boxData);
          notifications.addAlert('info', 'NOTIFICATION_BOX_UPDATE_SUCCESS');
        })
        .catch(function (error) {
          notifications.addAlert('danger', 'NOTIFICATION_BOX_UPDATE_FAILED');
        });
    }

    function resetPosition () {
      vm.editMarker = { m1: angular.copy(vm.originalPosition) };
      vm.editMarkerInput =  angular.copy(vm.originalPosition);
      vm.editMarker.m1.draggable = true;
    }

    function setCoordinates (coords) {
      vm.editMarker.m1.lng = parseFloat(coords.lng.toFixed(6));
      vm.editMarker.m1.lat = parseFloat(coords.lat.toFixed(6));
      vm.editMarkerInput.lng = vm.editMarker.m1.lng;
      vm.editMarkerInput.lat = vm.editMarker.m1.lat;
    }

    ////

    $scope.$on('leafletDirectiveMap.editbox_map.click', function (e, args) {
      setCoordinates(args.leafletEvent.latlng);
    });

    $scope.$on('leafletDirectiveMarker.editbox_map.dragend', function (e, args) {
      setCoordinates(args.model);
    });

    $scope.$watchCollection('location.editMarkerInput', function (newValue) {
      if (newValue && newValue.lat && newValue.lng) {
        vm.editMarker.m1.lng = newValue.lng;
        vm.editMarker.m1.lat = newValue.lat;
      }
    });
  }
})();
