(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .controller('AccountDashboardController', AccountDashboardController);

  AccountDashboardController.$inject = [];

  function AccountDashboardController () {
    var vm = this;

    vm.test = "AAAAAAAA";
  }
})();
