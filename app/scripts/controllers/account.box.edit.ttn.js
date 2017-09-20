(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .controller('EditBoxTtnController', EditBoxTtnController);

  EditBoxTtnController.$inject = ['$scope', 'boxData', 'notifications', 'AccountService'];

  function EditBoxTtnController ($scope, boxData, notifications, AccountService) {
    var vm = this;
    vm.validTTNconfig = true;
    vm.settings = {
      profile: 'sensebox/home',
      app_id: '',
      dev_id: '',
      decodeOptions: '[]'
    };

    vm.save = save;

    activate();

    ////

    function activate () {
      if (angular.isDefined(boxData.integrations) && angular.isDefined(boxData.integrations.ttn)) {
        angular.copy(boxData.integrations.ttn, vm.settings);
        vm.settings.decodeOptions = JSON.stringify(vm.settings.decodeOptions);
      }
    }

    function save () {
      var req = { ttn: angular.copy(vm.settings) };
      req.ttn.decodeOptions = JSON.parse(req.ttn.decodeOptions);
      return AccountService.updateBox(boxData._id, req)
        .then(function (response) {
          angular.copy(response.data, boxData);
          notifications.addAlert('info', 'NOTIFICATION_BOX_UPDATE_SUCCESS');
        })
        .catch(function (error) {
          console.log('ERROR RESPONSE');
          console.log(error);
          notifications.addAlert('danger', 'NOTIFICATION_BOX_UPDATE_FAILED');
        });
    }

    ////

    // check if valid json for ttn decodeOptions
    $scope.$watch('ttn.settings.decodeOptions', function(newValue) {
      if (!newValue.length) {
        return vm.validTTNconfig = true;
      }
      try {
        if (JSON.parse(vm.settings.decodeOptions).constructor !== Array) {
          throw 'must be an array';
        }
        vm.validTTNconfig = true;
      } catch (e) {
        vm.validTTNconfig = false;
      }
    });
  }
})();
