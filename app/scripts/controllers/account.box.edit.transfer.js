(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .controller('EditBoxTransferController', EditBoxTransferController);

  EditBoxTransferController.$inject = ['boxData', 'AccountService'];

  function EditBoxTransferController (boxData, AccountService) {
    var vm = this;
    vm.device = {};
    vm.deviceName = '';
    vm.data = {};

    vm.transferDevice = transferDevice;
    vm.revokeToken = revokeToken;

    activate();

    ////

    function activate () {
      if (angular.isDefined(boxData)) {
        angular.copy(boxData, vm.device);

        return AccountService.getTransferToken(vm.device._id)
          .then(function (response) {
            angular.copy(response.data, vm.data);
          })
          .catch(function (error) {
            console.log(error);
          });
      }
    }

    function transferDevice () {

      var payload = {
        boxId: vm.device._id
      };

      return AccountService.transferDevice(payload)
        .then(function (response) {
          angular.copy(response.data, vm.data);
        })
        .catch(function (error) {
          console.log(error);
        });
    }

    function revokeToken () {
      var payload = {
        boxId: vm.device._id,
        token: vm.data.token
      };

      return AccountService.revokeToken(payload)
        .then(function (response) {
          if (response.status === 204) {
            angular.copy({}, vm.data);
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    }

  }
})();
