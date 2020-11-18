(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .controller('EditBoxTinggController', EditBoxTinggController);

  EditBoxTinggController.$inject = ['$scope', 'boxData', 'notifications', 'AccountService'];

  function EditBoxTinggController ($scope, boxData, notifications, AccountService) {
    var vm = this;

    activate();

    ////

    function activate () {

      
    }

  }
})();
