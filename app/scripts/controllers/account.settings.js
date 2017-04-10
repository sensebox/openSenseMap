(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .controller('AccountSettingsController', AccountSettingsController);

  AccountSettingsController.$inject = ['AccountService', 'LanguageService'];

  function AccountSettingsController (AccountService, LanguageService) {
    var vm = this;
    vm.details = {};

    vm.updateAccount = updateAccount;

    activate();

    ////

    function activate () {
      return getUserDetails()
        .then(function () {
          console.info('Settings View activated!');
          console.log(vm.details);
        });
    }

    function getUserDetails () {
      return AccountService.getUserDetails()
        .then(function (data) {
          vm.details = data.data.me;
          return vm.details;
        });
    }

    function updateAccount () {
      return AccountService.updateAccount(vm.details)
        .then(function (data) {
          angular.merge(vm.details, data.data.me);
          LanguageService.change(vm.details.language);
        });
    }
  }
})();
