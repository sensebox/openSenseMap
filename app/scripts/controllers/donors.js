(function () {
    'use strict';
  
    angular
      .module('openSenseMapApp')
      .controller('DonorsController', DonorsController);
  
    DonorsController.$inject = ['$state', 'app'];
    function DonorsController ($state, app) {
      var vm = this;
      vm.app = app;

  
  
      activate();
  
      ////////////////
  
      function activate () {
      }

    }
  })();
  