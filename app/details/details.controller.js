(function() {
  'use strict';

  angular
    .module('sidebar.details')
    .controller('DetailsController', DetailsController);

  DetailsController.$inject = [];
  function DetailsController() {
    var vm = this;


    activate();

    ////////////////

    function activate() {
      console.log('Activate sidebar.details');
    }
  }
})();
