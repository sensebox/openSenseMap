(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .controller('EditBoxGeneralController', EditBoxGeneralController);

  EditBoxGeneralController.$inject = ['$state', 'notifications', 'boxData', 'AccountService'];

  function EditBoxGeneralController ($state, notifications, boxData, AccountService) {
    var vm = this;
    vm.editingMarker = {};

    vm.save = save;
    vm.deleteBox = deleteBox;

    activate();

    ////

    function activate () {
      angular.copy(boxData, vm.editingMarker);
    }

    function save () {
      notifications.pop();
      var imgsrc = angular.element(document.getElementById('flowUploadImage')).attr('src');
      var data = {
        name: vm.editingMarker.name,
        description: vm.editingMarker.description,
        weblink: vm.editingMarker.weblink,
        grouptag: vm.editingMarker.grouptag,
        exposure: vm.editingMarker.exposure,
        image: imgsrc
      };
      return AccountService.updateBox(boxData._id, data)
        .then(function (response) {
          console.log('Success', response);
          notifications.push({ type: 'info', msg: 'Oh snap! Change a few things up and try submitting again.' });
        })
        .catch(function (error) {
          console.log('Error', error);
          notifications.push({ type: 'danger', msg: 'Oh snap! Change a few things up and try submitting again.' });
        });
    }

    function deleteBox () {
      return AccountService.deleteBox(boxData._id)
        .then(function (response) {
          console.log(response);
          console.info('Box deleted');
          $state.go('account.dashboard');
        })
        .catch(function (error) {
          console.log(error);
          console.info('Error while deleting senseBox');
        });
    }
  }
})();
