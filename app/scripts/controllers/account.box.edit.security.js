(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .controller('EditBoxSecurityController', EditBoxSecurityController);

  EditBoxSecurityController.$inject = ['$document', 'notifications', 'boxData', 'AccountService', 'Box'];

  function EditBoxSecurityController ($document, notifications, boxData, AccountService, Box) {
    var vm = this;

    vm.access_token = '';
    vm.useAuth = false;
    vm.refreshAccessToken = false;
    vm.boxData = boxData;

    vm.revealPassword = revealPassword;
    vm.toggleModal = toggleModal;
    vm.generateNewToken = generateNewToken;
    vm.save = save;

    vm.modalVisible = false;

    activate();

    ////

    function activate () {
      vm.access_token = boxData.access_token;
      vm.useAuth = boxData.useAuth;
    }

    function revealPassword () {
      var passField = $document.getElementById('password-field');
      if (passField.type === 'password') {
        passField.type = 'text';
      } else {
        passField.type = 'password';
      }
    }

    function toggleModal () {
      vm.modalVisible = !vm.modalVisible;
    }

    function generateNewToken () {
      vm.modalVisible = false;

      return AccountService.updateBox(boxData._id, { generate_access_token: true })
        .then(function (response) {
          angular.copy(new Box(response.data), boxData);
          // vm.access_token = boxData.access_token;
          vm.boxData = boxData;
          notifications.addAlert('info', 'NOTIFICATION_BOX_UPDATE_SUCCESS');
        })
        .catch(function () {
          notifications.addAlert('danger', 'NOTIFICATION_BOX_UPDATE_FAILED');
        });

    }

    function save () {
      return AccountService.updateBox(boxData._id, { useAuth: vm.useAuth === true ? true : 'false', refreshAccessToken: vm.refreshAccessToken })
        .then(function (response) {
          angular.copy(new Box(response.data), boxData);
          vm.boxData = boxData;
          notifications.addAlert('info', 'NOTIFICATION_BOX_UPDATE_SUCCESS');
        })
        .catch(function () {
          notifications.addAlert('danger', 'NOTIFICATION_BOX_UPDATE_FAILED');
        });
    }
  }
})();
