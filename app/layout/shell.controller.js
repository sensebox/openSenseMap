(function() {
  'use strict';

  angular
      .module('app.layout')
      .controller('ShellController', ShellController);

  ShellController.$inject = [];

  function ShellController() {
    /*jshint validthis: true */
    var vm = this;

    vm.busyMessage = 'Please wait ...';
    vm.isBusy = true;
    vm.showSplash = true;

    activate();

    function activate() {
      console.log('activate shell');
    }
  }
})();
