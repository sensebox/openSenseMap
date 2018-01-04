(function() {
  'use strict';

  angular
    .module('app.layout')
    .controller('TopNavController', TopNavController);

  TopNavController.$inject = ['routerHelper'];

  /* @ngInject */
  function TopNavController(routerHelper) {
    var vm = this;

    vm.title = 'config.appTitle';


    activate();

    ////////////////

    function activate() {
      console.log('Activate top navbar');
      getNavRoutes();
    }

    function getNavRoutes () {
      console.log(routerHelper.getStates());
    }
  }
})();
