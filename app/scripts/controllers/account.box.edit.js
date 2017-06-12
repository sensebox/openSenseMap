(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .controller('EditBoxController', EditBoxController);

  EditBoxController.$inject = ['$state', 'notifications'];

  function EditBoxController ($state, notifications) {
    var vm = this;
    vm.tabActive = {
      general: true,
      sensors: false,
      location: false,
      script: false,
      mqtt: false,
      ttn: false
    };
    vm.alerts = [];

    vm.changeActiveTab = changeActiveTab;
    vm.closeAlert = notifications.closeAlert;

    activate();

    ////

    function activate () {
      changeActiveTab($state.current.url.split('/')[1]);
      vm.alerts = notifications.getAlerts();
    }

    function changeActiveTab (tab) {
      Object.keys(vm.tabActive).map(function(key, index) {
         vm.tabActive[key] = false;
      });
      switch (tab) {
        case 'general':
          vm.tabActive.general = true;
          break;
        case 'sensors':
          vm.tabActive.sensors = true;
          break;
        case 'extensions':
          vm.tabActive.extensions = true;
          break;
        case 'location':
          vm.tabActive.location = true;
          break;
        case 'script':
          vm.tabActive.script = true;
          break;
        case 'mqtt':
          vm.tabActive.mqtt = true;
          break;
        case 'ttn':
          vm.tabActive.ttn = true;
          break;
      }
    }
  }
})();
