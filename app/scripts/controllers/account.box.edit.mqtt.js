(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .controller('EditBoxMqttController', EditBoxMqttController);

  EditBoxMqttController.$inject = ['boxData', 'AccountService'];

  function EditBoxMqttController (boxData, AccountService) {
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
      if (angular.isDefined(boxData.integrations) && angular.isDefined(boxData.integrations.ttn)) {
        angular.copy(boxData.integrations.mqtt, vm.settings);
      }
    }

    function save () {
      return AccountService.updateBox(boxData._id, {mqtt: vm.settings})
        .then(function (response) {
          console.log('SUCCESS RESPONSE');
          console.log(response);
          //TODO set boxData
        })
        .catch(function (error) {
          console.log('ERROR RESPONSE');
          console.log(error);
          //TODO schow error messages
        });
    }
  }
})();
