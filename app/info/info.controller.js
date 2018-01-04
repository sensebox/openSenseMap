(function() {
  'use strict';

  angular
    .module('app.info')
    .controller('InfoController', InfoController);

  InfoController.$inject = [];
  function InfoController() {
    var vm = this;


    activate();

    ////////////////

    function activate() {
      // console.info(app.VERSION +'-'+app.NAME);
    }
  }
})();
