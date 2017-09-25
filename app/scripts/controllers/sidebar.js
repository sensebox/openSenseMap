(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .controller('SidebarController', SidebarController);

  SidebarController.$inject = ['Sidebar'];

  function SidebarController (Sidebar) {
    var vm = this;
    vm.minimized = false;
    vm.Sidebar = Sidebar;

    vm.minimize = minimize;

    activate();

    ////

    function activate () {
    }

    function minimize () {
      vm.minimized = !vm.minimized;
      Sidebar.minimized = vm.minimized;
    }
  }
})();
