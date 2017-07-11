(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .controller('AccountSettingsChangePasswordController', AccountSettingsChangePasswordController);

  AccountSettingsChangePasswordController.$inject = ['$state', '$timeout', '$translate', 'AccountService', 'AuthenticationService'];

  function AccountSettingsChangePasswordController ($state, $timeout, $translate, AccountService, AuthenticationService) {
    var vm = this;
    vm.currentPassword = '';
    vm.newPassword = {
      password: '',
      passwordConfirm: ''
    };
    vm.alerts = [];

    vm.updateAccount = updateAccount;

    activate();

    ////

    function activate () {}

    function updateAccount () {
      vm.alerts.pop();
      if (angular.equals(vm.newPassword.password, vm.newPassword.passwordConfirm)) {
        var data = {
          currentPassword: vm.currentPassword,
          newPassword: vm.newPassword.password
        };
        return AccountService.updateAccount(data)
          .then(function (data) {
            AuthenticationService.logout();
            $translate('NOTIFICATION_PASSWORD_UPDATE_SUCCESS').then(function (translation) {
              vm.alerts.push({ type: 'info', msg: translation });
            });
            vm.currentPassword = '';
            vm.newPassword = {
              password: '',
              passwordConfirm: ''
            };
            $timeout(function () {
              $state.go('explore.map');
            }, 5000);
          })
          .catch(function (error) {
            vm.currentPassword = '';
            vm.newPassword = {
              password: '',
              passwordConfirm: ''
            };
            $translate('NOTIFICATION_PASSWORD_UPDATE_FAILED').then(function (translation) {
              vm.alerts.push({ type: 'danger', msg: translation });
            });
          });
      } else {
        $translate('NOTIFICATION_PASSWORD_NOT_THE_SAME').then(function (translation) {
          vm.alerts.push({ type: 'info', msg: translation });
        });
      }
    }
  }
})();
