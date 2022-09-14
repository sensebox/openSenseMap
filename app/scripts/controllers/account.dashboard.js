(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .controller('AccountDashboardController', AccountDashboardController);

  AccountDashboardController.$inject = ['AccountService', 'LocalStorageService', '$scope'];

  function AccountDashboardController (AccountService, LocalStorageService, $scope) {
    var vm = this;
    var localStorageKey = 'osem.dashboard.listStyle';
    var localStorageOrderByKey = 'osem.dashboard.orderBy';

    vm.boxes = [];
    vm.listStyle = 'tiles';
    vm.orderByProperty = 'createdAt';
    vm.claimToken = '';
    vm.claimPattern = /^[a-z0-9]*$/;
    vm.errorMessage = '';

    vm.claimDevice = claimDevice;
    vm.closeAlert = closeAlert;

    activate();

    ////

    function activate () {
      var listStyleFromLocalStorage = LocalStorageService.getValue(localStorageKey);
      if (listStyleFromLocalStorage) {
        vm.listStyle = listStyleFromLocalStorage;
      }

      var orderByFromLocalStorage = LocalStorageService.getValue(localStorageOrderByKey);
      if (orderByFromLocalStorage) {
        vm.orderByProperty = orderByFromLocalStorage;
      }

      return getUsersBoxes()
        .then(function () {
          // console.info('Activated Dashboard View');
          // console.info(vm.boxes);
        });
    }

    function getUsersBoxes () {
      vm.boxes = [];

      return AccountService.getUsersBoxes()
        .then(function (boxes) {
          vm.boxes = boxes;
        });
    }

    function claimDevice () {
      var payload = {
        token: vm.claimToken
      };



      return AccountService.claimDevice(payload)
        .then(function () {

          // Clear token field
          vm.claimToken = '';

          return getUsersBoxes()
            .then(function () {
              // console.log('refreshed boxes');
            });
        })
        .catch(function (error) {
          console.log(error);
          vm.errorMessage = error.message;
        });
    }

    function closeAlert () {
      vm.errorMessage = '';
    }

    $scope.$watch('dashboard.listStyle', function (value) {
      LocalStorageService.setValue(localStorageKey, value);
    });

    $scope.$watch('dashboard.orderByProperty', function (value) {
      LocalStorageService.setValue(localStorageOrderByKey, value);
    });
  }
})();
