(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .controller('AccountDashboardController', AccountDashboardController);

  AccountDashboardController.$inject = ['$http', 'OpenSenseBoxAPI', 'AccountService'];

  function AccountDashboardController ($http, OpenSenseBoxAPI, AccountService) {
    var vm = this;

    vm.boxes = [];

    activate();

    ////

    function activate () {
      return getUsersBoxes()
        .then(function () {
          console.info('Activated Dashboard View');
          console.info(vm.boxes);
        });
    }

    function getUsersBoxes () {
      vm.boxes = [];
      return AccountService.getUsersBoxes()
        .then(function (boxes) {
          vm.boxes = boxes;
        });
    }

  }
})();
