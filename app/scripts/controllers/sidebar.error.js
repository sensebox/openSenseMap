(function() {
  'use strict';

  angular
    .module('openSenseMapApp')
    .controller('SidebarErrorController', SidebarErrorController);

  SidebarErrorController.$inject = [];

  function SidebarErrorController () {
    var vm = this;

    vm.openChat = openChat;

    activate();

    ////////////////

    function activate() {
    }

    function openChat () {
      Tawk_API.toggle();
    }
  }
})();
