(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .controller('EditBoxMqttController', EditBoxMqttController);

  EditBoxMqttController.$inject = ['boxData', 'notifications', 'AccountService'];

  function EditBoxMqttController (boxData, notifications, AccountService) {
    var vm = this;

    vm.settings = {
      enabled: false,
      url: '',
      topic: '',
      messageFormat: '',
      decodeOptions: '',
      connectionOptions: ''
    };

    vm.save = save;

    activate();

    ////

    function activate () {
      if (angular.isDefined(boxData.integrations) && angular.isDefined(boxData.integrations.mqtt)) {
        angular.copy(boxData.integrations.mqtt, vm.settings);
      }
    }

    function save () {
      return AccountService.updateBox(boxData._id, { mqtt: vm.settings })
        .then(function (response) {
          angular.copy(response.data, boxData);
          notifications.addAlert('info', 'NOTIFICATION_BOX_UPDATE_SUCCESS');
        })
        .catch(function () {
          notifications.addAlert('danger', 'NOTIFICATION_BOX_UPDATE_FAILED');
        });
    }
  }
})();
