(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .controller('AccountSettingsController', AccountSettingsController);

  AccountSettingsController.$inject = ['$scope', '$state', '$timeout', '$translate', 'AccountService', 'LanguageService', 'AuthenticationService'];

  function AccountSettingsController ($scope, $state, $timeout, $translate, AccountService, LanguageService, AuthenticationService) {
    var vm = this;
    vm.details = {};
    vm.backupDetails = {};
    vm.newDetails = {};
    vm.alerts = [];
    vm.currentPassword = '';
    vm.password = '';

    vm.updateAccount = updateAccount;
    vm.closeAlert = closeAlert;
    vm.updateDisabled = updateDisabled;
    vm.changeAttribute = changeAttribute;
    vm.deleteAccount = deleteAccount;

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
        vm.newDetails[key] = value;
      } else if (vm.newDetails[key] !== value) {
        vm.newDetails[key] = value;
      }

      //Check if new value equals old one
      if (angular.equals(value, vm.backupDetails[key])) {
        delete vm.newDetails[key];
      }
    }

    function deleteAccount () {
      var data = {
        password: vm.password
      };
      return AccountService.deleteAccount(data)
        .then(function (data) {
          $translate('NOTIFICATION_USER_ACCOUNT_DELETE_SUCCESS').then(function (translation) {
            vm.alerts.push({ type: 'info', msg: translation });
          });
          AuthenticationService.logout();
          $timeout(function () {
            $state.go('explore.map');
          }, 5000);
        })
        .catch(function (error) {
          $translate('NOTIFICATION_USER_ACCOUNT_DELETE_FAILD').then(function (translation) {
            vm.alerts.push({ type: 'danger', msg: translation });
          });
        });
    }
  }
})();
