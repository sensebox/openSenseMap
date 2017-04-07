(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .controller('AccountSettingsController', AccountSettingsController);

  AccountSettingsController.$inject = ['AccountService'];

  function AccountSettingsController (AccountService) {
    var vm = this;
    vm.details = {};

    activate();

    ////

    function activate () {
      return getUserDetails()
        .then(function () {
          console.info('Settings View activated!');
        });
    }

    function getUserDetails () {
      return AccountService.getUserDetails()
        .then(function (data) {
          console.log(data);
          vm.details = data;
          return vm.details;
        });
    }
  }
})();
