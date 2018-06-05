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
      var icon = '';
      var color = '';
      if (boxData.exposure === 'indoor' || boxData.exposure === 'outdoor') {
        icon = 'cube';
        color = 'green';
      }

      if (boxData.exposure === 'mobile') {
        icon = 'rocket';
        color = 'blue';
      }

      var marker = L.AwesomeMarkers.icon({
        type: 'awesomeMarker',
        prefix: 'fa',
        icon: icon,
        markerColor: color
      });

      var lat = parseFloat(boxData.currentLocation.coordinates[1].toFixed(6));
      var lng = parseFloat(boxData.currentLocation.coordinates[0].toFixed(6));

      vm.boxPosition = {
        layerName: 'registration',
        lng: lng,
        lat: lat,
        latLng: [lat, lng],
        height: boxData.currentLocation.coordinates[2],
        draggable: true,
        zoom: 17,
        icon: marker
      };

      angular.copy(vm.boxPosition, vm.originalPosition);

      vm.editMarker = {
        m1: angular.copy(vm.boxPosition)
      };
      angular.copy(vm.boxPosition, vm.editMarkerInput);
    }

    function save () {
      return AccountService.updateBox(boxData._id, { location: vm.editMarker.m1 })
        .then(function (response) {
          angular.copy(response.data, boxData);
          notifications.addAlert('info', 'NOTIFICATION_BOX_UPDATE_SUCCESS');
        })
        .catch(function () {
          notifications.addAlert('danger', 'NOTIFICATION_BOX_UPDATE_FAILED');
        });
    }

    function resetPosition () {
      vm.editMarker = { m1: angular.copy(vm.originalPosition) };
      vm.editMarkerInput = angular.copy(vm.originalPosition);
      vm.editMarker.m1.draggable = true;
    }

    function setCoordinates (coords) {
      vm.editMarker = {
        m1: angular.copy(vm.originalPosition)
      };
      var lng = parseFloat(coords.lng.toFixed(6));
      var lat = parseFloat(coords.lat.toFixed(6));
      vm.editMarker.m1.lng = lng;
      vm.editMarker.m1.lat = lat;
      vm.editMarker.m1.latLng = [lat, lng];
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
