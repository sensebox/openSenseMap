(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .controller('EditBoxScriptController', EditBoxScriptController);

  EditBoxScriptController.$inject = ['boxData', 'AccountService'];

  function EditBoxScriptController (boxData, AccountService) {
    var vm = this;
    vm.box = boxData;
    vm.display_enabled = false;
    vm.serialPort = 'Serial1';
    vm.boxScript = '';
    vm.showConfiguration = false;
    vm.showSerialPort = false;
    vm.soilDigitalPort = 'A';
    vm.showSoilDigitalPort = false;
    vm.soundMeterPort = 'B';
    vm.showSoundMeterPort = false;
    vm.windSpeedPort = 'C';
    vm.showWindSpeedPort = false;
    vm.compiling = false;
    vm.wifi = {
      ssid: '',
      password: ''
    };
    vm.showWifiConfiguration = false;
    vm.ttn = {
      devEUI: '',
      appEUI: '',
      appKey: ''
    };
    vm.showTTNConfiguration = false;

    vm.generateScript = generateScript;
    vm.compile = compile;

    activate();

    ////

    function activate () {
      if (boxData.model.startsWith('homeV2Wifi')) {
        vm.showConfiguration = true;
        vm.showWifiConfiguration = true;
      }
      if (boxData.model === 'homeV2WifiFeinstaub' || boxData.sensorsArray.filter(function (s) {
        return s.title === 'PM10';
      }).length > 0) {
        vm.showSerialPort = true;
      }

      if (boxData.model === 'homeV2Lora') {
        vm.showConfiguration = true;
        vm.showTTNConfiguration = true;
      }

      if (boxData.model === 'homeV2Ethernet') {
        vm.showConfiguration = true;
      }

      if (boxData.sensorsArray.filter(function (s) {
        return s.sensorType === 'SMT50';
      }).length !== 0) {
        vm.showSoilDigitalPort = true;
      }

      if (boxData.sensorsArray.filter(function (s) {
        return s.sensorType === 'SOUNDLEVELMETER';
      }).length !== 0) {
        vm.showSoundMeterPort = true;
      }

      if (boxData.sensorsArray.filter(function (s) {
        return s.sensorType === 'WINDSPEED';
      }).length !== 0) {
        vm.showWindSpeedPort = true;
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
        soilDigitalPort: vm.soilDigitalPort,
        soundMeterPort: vm.soundMeterPort,
        windSpeedPort: vm.windSpeedPort,
        ssid: vm.wifi.ssid,
        password: vm.wifi.password,
        devEUI: vm.ttn.devEUI,
        appEUI: vm.ttn.appEUI,
        appKey: vm.ttn.appKey,
        display_enabled: vm.display_enabled
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
