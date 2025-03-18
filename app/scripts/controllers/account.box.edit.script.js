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
    vm.enable_debug = false;
    vm.sdsSerialPort = 'Serial1';
    vm.rg15SerialPort = 'Serial1';
    vm.boxScript = '';
    vm.showConfiguration = false;
    vm.showSdsPort = false;
    vm.showRG15Port = false;
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
      console.log(boxData);
      if (boxData.model.startsWith('homeV2Wifi')) {
        vm.showConfiguration = true;
        vm.showWifiConfiguration = true;
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
        return s.sensorType === 'RG-15';
      }).length !== 0) {
        vm.showRG15Port = true;
      }

      if (boxData.sensorsArray.filter(function (s) {
        return (s.sensorType === 'SPS30' || s.sensorType === 'SDS 011');
      }).length !== 0) {
        vm.showSdsPort = true;
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
        soilDigitalPort: vm.soilDigitalPort,
        sdsSerialPort: vm.sdsSerialPort,
        rg15SerialPort: vm.rg15SerialPort,
        soundMeterPort: vm.soundMeterPort,
        windSpeedPort: vm.windSpeedPort,
        ssid: vm.wifi.ssid,
        password: vm.wifi.password,
        devEUI: vm.ttn.devEUI,
        appEUI: vm.ttn.appEUI,
        appKey: vm.ttn.appKey,
        display_enabled: vm.display_enabled,
        enable_debug: vm.enable_debug
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
