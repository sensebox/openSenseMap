(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .controller('EditBoxLocationController', EditBoxLocationController);

  EditBoxLocationController.$inject = ['$scope', 'boxData', 'notifications', 'AccountService'];

  function EditBoxLocationController ($scope, boxData, notifications, AccountService) {
    var vm = this;
    vm.editMarkerInput = {};
    vm.originalPosition = {};

    vm.save = save;
    vm.resetPosition = resetPosition;

    activate();

    ////

    function activate () {
      vm.boxPosition = {
        lng: parseFloat(boxData.currentLocation.coordinates[0].toFixed(6)),
        lat: parseFloat(boxData.currentLocation.coordinates[1].toFixed(6)),
        height: boxData.currentLocation.coordinates[2],
        draggable: true,
        zoom: 17,
        icon: {
          markerColor: 'green'
        }
      };

      angular.copy(vm.boxPosition, vm.originalPosition);

      vm.editMarker = {
        m1: angular.copy(vm.boxPosition)
      };
      angular.copy(vm.boxPosition, vm.editMarkerInput);
    }

    function save () {
      return AccountService.updateBox(boxData._id, {location: vm.editMarker.m1})
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
      vm.editMarker = {
        m1 : angular.copy(vm.originalPosition)
      };
      vm.editMarker.m1.lng = parseFloat(coords.lng.toFixed(6));
      vm.editMarker.m1.lat = parseFloat(coords.lat.toFixed(6));
      vm.editMarker.m1.height = coords.height;
      vm.editMarkerInput.lng = vm.editMarker.m1.lng;
      vm.editMarkerInput.lat = vm.editMarker.m1.lat;
    }

    ////

    $scope.$on('osemMapClick.map_edit', function (e, args) {
      setCoordinates(args.latlng);
    });

    $scope.$on('osemMarkerDragend.map_edit', function (e, args) {
      setCoordinates(args.target._latlng);
    });

    $scope.$watchCollection('location.editMarkerInput', function (newValue) {
      if (newValue && newValue.lat && newValue.lng) {
        setCoordinates({
          lng: newValue.lng,
          lat: newValue.lat,
          height: newValue.height,
        });
      }
    });
  }
})();
