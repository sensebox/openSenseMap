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
    vm.showSerialPort = false;
    vm.compiling = false;
    vm.wifi = {
      ssid: '',
      password: ''
    };

    vm.generateScript = generateScript;
    vm.compile = compile;

    activate();

    ////

    function activate () {
      if (boxData.model.startsWith('homeV2Wifi')) {
        vm.showConfiguration = true;
      }

      if (boxData.model === 'homeV2WifiFeinstaub') {
        vm.showSerialPort = true;
      }

      return getScript();
    }

    function generateScript () {
      vm.boxScript = 'Neuer Sketch wird generiert...';

      return getScript();
    }

    function getScript () {
      return AccountService.getScript(boxData._id, {
        serialPort: vm.serialPort,
        ssid: vm.wifi.ssid,
        password: vm.wifi.password
      })
        .then(function (response) {
          vm.boxScript = response;
        })
        .catch(function () {
        });
    }

    function compile () {
      vm.compiling = true;

      return AccountService.compileSketch({
        board: 'sensebox-mcu',
        sketch: vm.boxScript
      })
        .then(function () {
        })
        .catch(function () {
        })
        .finally(function () {
          vm.compiling = false;
        });
    }
  }
})();
