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
          angular.copy(response.data, boxData);
          notifications.addAlert('info', 'NOTIFICATION_BOX_UPDATE_SUCCESS');
        })
        .catch(function (error) {
          notifications.addAlert('danger', 'NOTIFICATION_BOX_UPDATE_FAILED');
        });
    }

    function deleteBox () {
      return AccountService.deleteBox(boxData._id)
        .then(function (response) {
          notificaitons.addAlert('info', 'NOTIFICATION_BOX_DELETE_SUCCESS');
        })
        .catch(function (error) {
          notificaitons.addAlert('danger', 'NOTIFICATION_BOX_DELETE_FAILED');
        });
    }
  }
})();
