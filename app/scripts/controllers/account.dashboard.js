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
    vm.boxes_count = 0;
    vm.listStyle = 'tiles';
    vm.orderByProperty = 'createdAt';
    vm.page = 0;
    vm.claimToken = '';
    vm.claimPattern = /^[a-z0-9]*$/;
    vm.errorMessage = '';

    vm.claimDevice = claimDevice;
    vm.closeAlert = closeAlert;
    vm.nextPage = nextPage;
    vm.previousPage = previousPage;

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

      return AccountService.getUsersBoxes(vm.page)
        .then(function (response) {
          vm.boxes = response.data.boxes;
          vm.boxes_count = response.data.boxes_count;
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

    function nextPage () {
      vm.page = vm.page + 1;
    }

    function previousPage () {
      vm.page = vm.page - 1;
    }

    $scope.$watch('dashboard.listStyle', function (value) {
      LocalStorageService.setValue(localStorageKey, value);
    });

    $scope.$watch('dashboard.orderByProperty', function (value) {
      LocalStorageService.setValue(localStorageOrderByKey, value);
    });

    $scope.$watch('dashboard.page', function () {
      return getUsersBoxes();
    });
  }
})();
