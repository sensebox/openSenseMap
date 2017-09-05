(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .controller('AccountDashboardController', AccountDashboardController);

  AccountDashboardController.$inject = ['$http', 'AccountService'];

  function AccountDashboardController ($http, AccountService) {
    var vm = this;

    vm.boxes = [];

    vm.deleteBox = deleteBox;

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
        .then(function (data) {
          data.data.boxes.forEach(function (box) {
            vm.boxes.push(box);
          });
        });
    }

    function deleteBox (boxId) {
      return AccountService.deleteBox(boxId)
        .then(function (response) {
          console.log(response);
          console.info('Box deleted');
          getUsersBoxes();
        })
        .catch(function (error) {
          console.log(error);
          console.info('Error while deleting senseBox');
        });
    }
  }
})();
