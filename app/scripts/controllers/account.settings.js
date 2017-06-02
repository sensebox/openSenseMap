(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .controller('AccountSettingsController', AccountSettingsController);

  AccountSettingsController.$inject = ['$scope', '$translate', 'AccountService', 'LanguageService'];

  function AccountSettingsController ($scope, $translate, AccountService, LanguageService) {
    var vm = this;
    vm.details = {};
    vm.alerts = [];

    vm.updateAccount = updateAccount;
    vm.closeAlert = closeAlert;

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
      vm.alerts.pop();
      return AccountService.updateAccount(vm.details)
        .then(function (data) {
          angular.merge(vm.details, data.data.me);
          $translate('NOTIFICATION_USER_UPDATE_SUCCESS').then(function (translation) {
            vm.alerts.push({ type: 'info', msg: translation });
          });
          vm.details.currentPassword = '';
          LanguageService.change(vm.details.language)
            .then(function (response) {
              $scope.$emit('languageChanged', response);
            })
            .catch(function (error) {
              console.log(error);
            });
        })
        .catch(function (error) {
          $translate('NOTIFICATION_USER_UPDATE_FAILED').then(function (translation) {
            vm.alerts.push({ type: 'danger', msg: translation });
          });
        })
    }

    function closeAlert (index) {
      vm.alerts.splice(index, 1);
    }
  }
})();
