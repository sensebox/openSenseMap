(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .controller('AccountSettingsController', AccountSettingsController);

  AccountSettingsController.$inject = ['$scope', '$translate', 'AccountService', 'LanguageService'];

  function AccountSettingsController ($scope, $translate, AccountService, LanguageService) {
    var vm = this;
    vm.details = {};
    vm.backupDetails = {};
    vm.newDetails = {};
    vm.alerts = [];
    vm.currentPassword = '';

    vm.updateAccount = updateAccount;
    vm.closeAlert = closeAlert;
    vm.updateDisabled = updateDisabled;
    vm.changeAttribute = changeAttribute;

    activate();

    ////

    function activate () {
      return getUserDetails()
        .then(function () {
          console.info('Settings View activated!');
          angular.copy(vm.backupDetails, vm.details);
        });
    }

    function getUserDetails () {
      return AccountService.getUserDetails()
        .then(function (data) {
          vm.backupDetails = data.data.me;
          return vm.backupDetails;
        });
    }

    function updateAccount () {
      vm.alerts.pop();
      if (angular.isDefined(vm.currentPassword)) {
        vm.newDetails.currentPassword = vm.currentPassword;
      } else {
        console.log('Please provide your current password');
        return false;
      }

      return AccountService.updateAccount(vm.newDetails)
        .then(function (data) {
          angular.merge(vm.backupDetails, data.data.me);
          angular.copy(vm.backupDetails, vm.details);
          vm.currentPassword = '';
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
          vm.currentPassword = '';
          $translate('NOTIFICATION_USER_UPDATE_FAILED').then(function (translation) {
            vm.alerts.push({ type: 'danger', msg: translation });
          });
        });
    }

    function closeAlert (index) {
      vm.alerts.splice(index, 1);
    }

    function updateDisabled () {
      if (angular.equals(vm.details, vm.backupDetails)) {
        return true;
      } else {
        if (angular.isUndefined(vm.currentPassword) || vm.currentPassword === '') {
          return true;
        }
      }
      return false;
    }

    function changeAttribute (key, value) {
      if (angular.isUndefined(vm.newDetails[key])) {
        vm.newDetails[key] = value
      } else if (angular.equals(value, vm.backupDetails[key])) {
        delete vm.newDetails[key];
      }
    }
  }
})();
