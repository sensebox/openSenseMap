(function() {
  'use strict';

  angular
    .module('app.info')
    .controller('InfoController', InfoController);

  InfoController.$inject = ['config'];
  function InfoController(config) {
    var vm = this;


    activate();

    ////////////////

    function activate() {
      console.info(config.appVersion + ' - ' + config.appName);
    }
  }
})();
