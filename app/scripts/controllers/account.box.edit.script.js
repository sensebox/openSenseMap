(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .controller('EditBoxScriptController', EditBoxScriptController);

  EditBoxScriptController.$inject = ['boxData', 'AccountService'];

  function EditBoxScriptController (boxData, AccountService) {
    var vm = this;
    vm.boxScript = '';

    activate();

    ////

    function activate () {
      return AccountService.getScript(boxData._id)
        .then(function (response) {
          vm.boxScript = response;
        })
        .catch(function (error) {
          //TODO log errors
        })
    }
  }
})();
