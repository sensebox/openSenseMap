(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .controller('EditBoxTtnController', EditBoxTtnController);

  EditBoxTtnController.$inject = ['$scope', 'boxData', 'notifications', 'AccountService', 'Box'];

  function EditBoxTtnController ($scope, boxData, notifications, AccountService, Box) {
    var vm = this;
    vm.editingBox = {};
    vm.validTTNconfig = true;
    vm.settings = {
      profile: 'sensebox/home',
      app_id: '',
      dev_id: '',
      decodeOptions: '[]'
    };

    vm.save = save;
    vm.reloadCayenne = createCayenneEncoding;

    vm.decodeOptions = [];
    vm.cayenneLppDecodingChanged = cayenneLppDecodingChanged;
    vm.cayenneDecodingOptions = []; // temp variable for Cayenne

    activate();

    ////

    function activate () {
      if (angular.isDefined(boxData.integrations) && angular.isDefined(boxData.integrations.ttn)) {
        angular.copy(boxData.integrations.ttn, vm.settings);
        vm.settings.decodeOptions = JSON.stringify(vm.settings.decodeOptions);

        vm.decodeOptions = JSON.parse(vm.settings.decodeOptions);
        if (vm.settings.profile === 'cayenne-lpp') {
          vm.cayenneDecodingOptions = JSON.parse(vm.settings.decodeOptions);
        }
      }

      angular.copy(new Box(boxData), vm.editingBox);
    }

    function cayenneLppDecodingChanged (sensor, index) {
      vm.cayenneDecodingOptions[index].sensor_title = sensor.sensor_title;
      vm.cayenneDecodingOptions[index].sensor_type = sensor.sensor_type;

      // Update original decodeOptions and not just temp
      vm.settings.decodeOptions = JSON.stringify(vm.cayenneDecodingOptions);
    }

    function save () {
      var req = { ttn: angular.copy(vm.settings) };

      // Copy temp Cayenne encoding to finally save it
      if (vm.settings.profile === 'cayenne-lpp') {
        req.ttn.decodeOptions = vm.cayenneDecodingOptions;
      } else {
        req.ttn.decodeOptions = JSON.parse(req.ttn.decodeOptions);
      }


      return AccountService.updateBox(vm.editingBox._id, req)
        .then(function (response) {
          angular.copy(response.data, boxData);
          notifications.addAlert('info', 'NOTIFICATION_BOX_UPDATE_SUCCESS');
        })
        .catch(function () {
          notifications.addAlert('danger', 'NOTIFICATION_BOX_UPDATE_FAILED');
        });
    }

    /**
     * Create basic and initial Cayenne encoding
     */
    function createCayenneEncoding () {
      vm.cayenneDecodingOptions = vm.editingBox.sensorsArray.map(function (sensor) {
        var decoderGuess = 'analog_in';

        var tempSubstr = ['temp'];
        var humiSubstr = ['humi', 'feucht'];
        var pressSubstr = ['press', 'druck'];
        var illuSubstr = ['hell', 'illu', 'uv', 'beleuch'];
        if (new RegExp(tempSubstr.join('|')).test(sensor.title.toLowerCase())) {
          decoderGuess = 'temperature';
        } else if (new RegExp(humiSubstr.join('|')).test(sensor.title.toLowerCase())) {
          decoderGuess = 'relative_humidity';
        } else if (new RegExp(pressSubstr.join('|')).test(sensor.title.toLowerCase())) {
          decoderGuess = 'barometric_pressure';
        } else if (new RegExp(illuSubstr.join('|')).test(sensor.title.toLowerCase())) {
          decoderGuess = 'luminosity';
        }

        return Object.assign({
          sensor_title: sensor.title,
          sensor_type: sensor.sensorType,
          decoder: decoderGuess,
          channel: 1
        }, vm.decodeOptions[sensor.id]);
      });
    }

    ////

    // Watch for a profile change
    $scope.$watch('ttn.settings.profile', function (newValue) {
      // Changed to Cayenne -> create Cayenne encoding
      if (newValue === 'cayenne-lpp' && vm.cayenneDecodingOptions.length === 0) {
        createCayenneEncoding();
      }
    });

    // check if valid json for ttn decodeOptions
    $scope.$watch('ttn.settings.decodeOptions', function (newValue) {
      if (!newValue.length) {
        vm.validTTNconfig = true;

        return vm.validTTNconfig;
      }
      try {
        if (JSON.parse(vm.settings.decodeOptions).constructor !== Array) {
          throw new Error('must be an array');
        }
        vm.validTTNconfig = true;
      } catch (e) {
        vm.validTTNconfig = false;
      }
    });
  }
})();
