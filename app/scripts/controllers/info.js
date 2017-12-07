(function() {
  'use strict';

  angular
    .module('openSenseMapApp')
    .controller('InfoController', InfoController);

  InfoController.$inject = ['app'];
  function InfoController(app) {
    var vm = this;
    vm.app = app;

    activate();

    ////////////////

    function activate() {}
  }
})();
