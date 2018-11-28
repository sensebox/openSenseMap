(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .controller('EditBoxScriptController', EditBoxScriptController);

  EditBoxScriptController.$inject = ['boxData', 'AccountService'];

  function EditBoxScriptController (boxData, AccountService) {
    var vm = this;
    vm.box = boxData;

    vm.serialPort = 'Serial1';
    vm.boxScript = '';
    vm.showConfiguration = false;

    vm.changeSerialPort = changeSerialPort;

    activate();

    ////

    function activate () {
      if (boxData.model.startsWith('homeV2')) {
        vm.showConfiguration = true;
      }

      return getScript();
    }

    function changeSerialPort () {
      vm.boxScript = 'Neuer Sketch wird generiert...';

      return getScript();
    }

    function getScript () {
      return AccountService.getScript(boxData._id, {
        serialPort: vm.serialPort
      })
        .then(function (response) {
          vm.boxScript = response;
        })
        .catch(function () {
        });
    }
  }
})();
