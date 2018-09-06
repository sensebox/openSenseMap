/* eslint no-undef: "off" */
(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .controller('RegisterController', RegisterController);

  RegisterController.$inject = ['$scope', '$translate', '$timeout', 'SensorIcons', 'WizardHandler', 'AccountService', 'osemMapData'];

  function RegisterController ($scope, $translate, $timeout, SensorIcons, WizardHandler, AccountService, osemMapData) {
    var vm = this;

    vm.newModel = {
      connection: null,
      sensors: {
        temp: false,
        pressure: false,
        light: false,
        pollution: false
      },
      serialPort: 'Serial1'
    };

    // vm.radioModel = null;
    vm.stepTitle = '';
    vm.stepIndex = 0;
    vm.showNext = true;
    vm.tag = '';
    vm.geolocationError = {
      error: false,
      message: ''
    };
    vm.privacy = false;
    vm.completed = false;

    //new sensebox object
    vm.newSenseBox = {
      name: '',
      exposure: '',
      location: []
    };

    vm.modelSelected = {
      id: '',
      name: false
    };
    vm.extensions = {
      feinstaub: {
        id: ''
      }
    };

    vm.mqtt = {
      enabled: false,
      url: '',
      topic: '',
      messageFormat: '',
      decodeOptions: '',
      connectionOptions: ''
    };
    vm.ttnEnabled = false;
    vm.validTTNconfig = true;
    vm.validMQTTURL = false;
    vm.ttn = {
      profile: 'sensebox/home',
      app_id: '',
      dev_id: '',
      decodeOptions: '[]'
    };
    vm.open = {
      collapse1: true,
      collapse2: false,
      collapse3: false,
      collapse4: false,
      collapse5: false
    };

    vm.markers = {};
    vm.sensors = [];
    vm.editMarkerInput = {};
    vm.sensorSetup = '';
    vm.editing = {};
    vm.isCustom = {};
    vm.events = {
      autolocation: true
    };

    vm.enterEvent = enterEvent;
    vm.add = add;
    vm.remove = remove;
    vm.setSensorIcon = setSensorIcon;
    vm.completeRegistration = completeRegistration;
    vm.setStepTitle = setStepTitle;
    vm.stepBack = stepBack;
    vm.stepForward = stepForward;
    vm.stepIsValidChange = stepIsValidChange;
    vm.isSenseBoxModel = isSenseBoxModel;
    vm.stepIsValid = false;
    vm.senseBoxSetupValid = senseBoxSetupValid;
    vm.generateNewSecret = generateNewSecret;

    activate();

    ////

    function activate () {
      vm.icons = SensorIcons;
      vm.editMarkerInput = angular.copy(vm.markers);
      vm.registering = false;
      $translate('STEP0').then(function (msg) {
        vm.stepTitle = msg;
      });

      // var possible = '0123456789';
      // var text = 0;

      // generateNewSecret();
    }

    function generateNewSecret () {
      vm.newModel.security.secret = randomFixedInteger(16).toString(16)
        .toUpperCase();
    }

    function randomFixedInteger (length) {
      return Math.floor(Math.pow(10, length - 1) + Math.random() * (Math.pow(10, length) - Math.pow(10, length - 1) - 1));
    }


    function isSenseBoxModel () {
      if (vm.modelSelected.id.startsWith('homeV2')) {
        return 'homeV2';
      }

      if (vm.modelSelected.id.startsWith('home')) {
        return 'home';
      }

      return '';
    }

    function setStepTitle () {
      vm.stepTitle = WizardHandler.wizard('RegistrationWizard').currentStepTitle();
    }

    function stepBack () {
      WizardHandler.wizard('RegistrationWizard').previous();
      setStepTitle();
      if (WizardHandler.wizard('RegistrationWizard').currentStepNumber() - 1 === 2) {
        vm.showNext = true;
      } else {
        vm.showNext = true;
        vm.stepIsValid = false;
      }
    }

    function stepForward () {
      WizardHandler.wizard('RegistrationWizard').next();
      setStepTitle();
      if (WizardHandler.wizard('RegistrationWizard').currentStepNumber() === 2) {
        vm.showNext = false;
      } else {
        vm.showNext = true;
      }
    }

    function stepIsValidChange (value) {
      if (WizardHandler.wizard('RegistrationWizard').currentStepNumber() === 2) {
        vm.stepIsValid = value;
      }
    }

    function enterEvent (keyEvent) {
      var stepNumber = -1;
      if (keyEvent.which === 13) {
        stepNumber = WizardHandler.wizard('RegistrationWizard').currentStepNumber();
      }
      switch (stepNumber) {
      case 2:
        if (vm.modelSelected.id === false) {
          vm.invalidHardware = true;
        } else {
          vm.invalidHardware = false;
        }
        if (vm.sensors.length === 0) {
          vm.sensorIncomplete = true;
        } else {
          vm.sensorIncomplete = false;
        }
        if (senseboxForm.$valid) {
          WizardHandler.wizard('RegistrationWizard').next();
        }
        break;
      case 3:
        completeRegistration();
      }
    }

    function add () {
      var sensor = {
        id: vm.sensors.length,
        icon: '',
        title: '',
        unit: '',
        sensorType: ''
      };
      vm.sensors.push(sensor);
      vm.sensorSetup = JSON.stringify(vm.sensors);
      edit(sensor.id);
      vm.sensorIncomplete = false;
    }

    function remove (index) {
      vm.sensors.splice(index, 1);
      vm.isCustom[index] = false;
      vm.editing[index] = false;
      for (var i = 0; i < vm.sensors.length; i++) {
        vm.sensors[i].id = i;
      }
      if (vm.sensors.length === 0) {
        vm.sensorSetup = '';
        vm.sensorIncomplete = true;
      } else {
        vm.sensorSetup = JSON.stringify($scope.sensors);
      }
    }

    function edit (index) {
      vm.editing[index] = true;
    }

    function setSensorIcon (sensor, newIcon) {
      sensor.icon = newIcon.name;
    }

    function downloadArduino (boxId, model) {
      var data = {};
      if (model.startsWith('homeV2')) {
        data.serialPort = vm.newModel.serialPort;
      }
      AccountService.getScript(boxId, data)
        .then(function (data) {
          vm.boxScript = data;
        })
        .catch(function () {
        });
    }

    function completeRegistration () {
      setStepTitle();
      vm.alerts = [];

      if (vm.mqtt.enabled) {
        vm.newSenseBox.mqtt = vm.mqtt;
      }
      if (vm.ttnEnabled) {
        vm.newSenseBox.ttn = vm.ttn;
        vm.newSenseBox.ttn.decodeOptions = JSON.parse(vm.ttn.decodeOptions);
      }
      vm.newSenseBox.location.push(vm.markers.box.lng);
      vm.newSenseBox.location.push(vm.markers.box.lat);
      if (vm.markers.box.height) {
        vm.newSenseBox.location.push(vm.markers.box.height);
      }
      vm.registering = true;

      if (vm.tag !== '') {
        vm.newSenseBox.grouptag = vm.tag;
      }

      if (vm.modelSelected.id === 'custom') {
        for (var i = 0; i < vm.sensors.length; i++) {
          vm.newSenseBox.sensors = vm.sensors;
        }
      } else {
        vm.newSenseBox.model = vm.modelSelected.id;
      }

      if (vm.modelSelected.id === 'homeV2') {
        vm.newSenseBox.sensorTemplates = [];
        for (var key in vm.newModel.sensors) {
          if (vm.newModel.sensors.hasOwnProperty(key)) {
            var element = vm.newModel.sensors[key];
            if (element) {
              switch (key) {
              case 'temp':
                vm.newSenseBox.sensorTemplates.push('hdc1080');
                break;
              case 'pressure':
                vm.newSenseBox.sensorTemplates.push('bmp280');
                break;
              case 'light':
                vm.newSenseBox.sensorTemplates.push('veml6070');
                vm.newSenseBox.sensorTemplates.push('tsl45315');
                break;
              }
            }
          }
        }
        if (vm.extensions.feinstaub.id !== '') {
          vm.newSenseBox.sensorTemplates.push('sds 011');
          vm.newSenseBox.serialPort = vm.newModel.serialPort;
        }
      }

      if (vm.newModel.connection) {
        vm.newSenseBox.model = vm.newSenseBox.model + vm.newModel.connection;
      }

      if (vm.extensions.feinstaub.id !== '') {
        vm.newSenseBox.model = vm.newSenseBox.model + vm.extensions.feinstaub.id;
      }

      AccountService.postNewBox(vm.newSenseBox)
        .then(function (data) {
          vm.newSenseBox.id = data.data._id;
          WizardHandler.wizard('RegistrationWizard').next();
          vm.registering = false;
          $translate('REGISTRATION_SUCCESS').then(function (msg) {
            var alert = {
              type: 'success',
              msg: msg
            };
            vm.alerts.push(alert);
            vm.regSuccess = true;
          });
          downloadArduino(data.data._id, data.data.model);
          vm.registeredSensors = data.data['sensors'];
          vm.completed = true;
          vm.stepIndex = 0;
        })
        .catch(function () {
          $translate('REGISTRATION_FAIL').then(function (msg) {
            var alert = {
              type: 'danger',
              msg: msg
            };
            vm.alerts.push(alert);
          });
          vm.registering = false;
        });
    }

    function senseBoxSetupValid () {
      var validTTN = true;
      var validMQTT = true;

      if (vm.ttnEnabled) {
        validTTN = vm.validTTNconfig;
      }

      if (vm.mqtt.enabled) {
        validMQTT = vm.validMQTTURL;
      }

      return validTTN && validMQTT;
    }

    ////

    $scope.$on('osemMapClick.map_register', function (e, args) {
      if (Object.keys(vm.markers).length === 0) {
        vm.markers = {
          box: {
            'layerName': 'registration',
            'latLng': [parseFloat(args.latlng.lat.toFixed(6)), parseFloat(args.latlng.lng.toFixed(6))],
            'lat': parseFloat(args.latlng.lat.toFixed(6)),
            'lng': parseFloat(args.latlng.lng.toFixed(6)),
            'draggable': true
          }
        };
      } else {
        vm.markers = angular.copy(vm.markers);
        vm.markers.box.latLng = [
          parseFloat(args.latlng.lat.toFixed(6)),
          parseFloat(args.latlng.lng.toFixed(6))
        ];
        vm.markers.box.lat = parseFloat(args.latlng.lat.toFixed(6));
        vm.markers.box.lng = parseFloat(args.latlng.lng.toFixed(6));
      }
      vm.editMarkerInput = angular.copy(vm.markers);
    });

    $scope.$on('osemMarkerDragend.map_register', function (e, args) {
      vm.markers = angular.copy(vm.markers);
      vm.markers.box.latLng = [
        parseFloat(args.target._latlng.lat.toFixed(6)),
        parseFloat(args.target._latlng.lng.toFixed(6))
      ];
      vm.markers.box.lat = parseFloat(args.target._latlng.lat.toFixed(6));
      vm.markers.box.lng = parseFloat(args.target._latlng.lng.toFixed(6));
      vm.editMarkerInput = angular.copy(vm.markers);
    });

    $scope.$on('osemMapOnLocationFound.map_register', function (e, args) {
      vm.map = args.map;
      if (Object.keys(vm.markers).length === 0) {
        vm.markers = {
          box: {
            'layerName': 'registration',
            'latLng': [parseFloat(args.latlng.lat.toFixed(6)), parseFloat(args.latlng.lng.toFixed(6))],
            'lat': parseFloat(args.latlng.lat.toFixed(6)),
            'lng': parseFloat(args.latlng.lng.toFixed(6)),
            'draggable': true
          }
        };
        if (args.latlng.altitude) {
          vm.markers.box.height = parseFloat(args.latlng.altitude.toFixed(2));
        }
      } else {
        vm.markers = angular.copy(vm.markers);
        vm.markers.box.latLng = [
          parseFloat(args.latlng.lat.toFixed(6)),
          parseFloat(args.latlng.lng.toFixed(6))
        ];
        vm.markers.box.lat = parseFloat(args.latlng.lat.toFixed(6));
        vm.markers.box.lng = parseFloat(args.latlng.lng.toFixed(6));
      }
      vm.editMarkerInput = angular.copy(vm.markers);
    });

    $scope.$on('osemMapOnLocationError.map_register', function (e, args) {
      vm.geolocationError.error = true;
      vm.geolocationError.message = args.message;
    });

    $scope.$on('wizard:stepChanged', function (step, index) {
      vm.stepIndex = index.index;

      $translate(index.step.wzData.translation).then(function (msg) {
        vm.stepTitle = msg;
      });
      if (index.index === 1) {
        $timeout(function () {
          osemMapData.getMap('map_register')
            .then(function (map) {
              map.invalidateSize();
              if (!vm.geolocationError.error) {
                map.setView([vm.markers.box.lat, vm.markers.box.lng], 16);
              }
            })
            .catch(function () {
            });
        }, 200);
      }
    });

    $scope.$watch('register.modelSelected.id', function (newValue) {
      if (newValue.indexOf('home') === 0) {
        vm.modelSelected.name = 'senseBox Home ' + newValue.substring(4);
        vm.sensorSetup = vm.modelSelected.id;

        vm.newModel.connection = null;
        vm.extensions.feinstaub.id = '';

        vm.invalidHardware = false;

        return;
      }

      if (newValue.indexOf('luftdaten') === 0) {
        vm.sensorSetup = vm.modelSelected.id;
        vm.extensions.feinstaub.id = '';
        vm.newModel.connection = null;

        var nameParts = newValue.split('_');

        var name = 'Luftdaten.info Feinstaubsensor (' + nameParts[1].toUpperCase() + ')';

        if (!nameParts[2]) {
          name = name + ' ohne Temperatur-/Feuchtesensor';
        } else {
          name = name + (' mit ' + nameParts[2].toUpperCase());
        }
        vm.modelSelected.name = name;

        vm.invalidHardware = false;

        return;
      }

      if (newValue === 'custom') {
        vm.sensorSetup = '';
        vm.extensions.feinstaub.id = '';
        vm.newModel.connection = null;

        vm.invalidHardware = false;

        return;
      }

      vm.modelSelected.name = false;
    });

    $scope.$watch('register.newModel.connection', function (newValue) {
      if (newValue === 'lora') {
        vm.ttnEnabled = true;
        vm.open.collapse5 = true;
      } else {
        vm.ttnEnabled = false;
        vm.open.collapse5 = false;
      }
    });

    // check if valid json for ttn decodeOptions
    $scope.$watch('register.ttn.decodeOptions', function (newValue) {
      if (!newValue.length) {
        vm.validTTNconfig = true;

        return vm.validTTNconfig;
      }
      try {
        if (JSON.parse(vm.ttn.decodeOptions).constructor !== Array) {
          throw new Error('must be an array');
        }
        vm.validTTNconfig = true;
      } catch (e) {
        vm.validTTNconfig = false;
      }
    });

    $scope.$watch('register.mqtt.url', function (newValue) {
      if (angular.isUndefined(newValue) || !newValue.length) {
        vm.validMQTTURL = false;

        return vm.validMQTTURL;
      }
      try {
        if (vm.mqtt.url.indexOf('mqtt://') === 0 || vm.mqtt.url.indexOf('mqtts://') === 0) {
          vm.validMQTTURL = true;
        } else {
          throw new Error('must start with mqtt[s]://');
        }
      } catch (e) {
        vm.validMQTTURL = false;
      }
    });

    $scope.$watchCollection('register.open.collapse3', function (newValue) {
      if (newValue) {
        vm.modelSelected.id = 'custom';
      }
    });

    $scope.$watchCollection('register.editMarkerInput.box', function (newValue, oldValue) {
      if (newValue && newValue.lat && newValue.lng && !angular.equals(newValue, oldValue)) {
        if (Object.keys(vm.markers).length === 0) {
          vm.markers = {
            box: {
              'latLng': [parseFloat(newValue.lat.toFixed(6)), parseFloat(newValue.lng.toFixed(6))],
              'lat': parseFloat(newValue.lat.toFixed(6)),
              'lng': parseFloat(newValue.lng.toFixed(6)),
              'height': newValue.height,
              'draggable': true
            }
          };
        } else {
          vm.markers = angular.copy(vm.markers);
          vm.markers.box.latLng = [
            parseFloat(newValue.lat.toFixed(6)),
            parseFloat(newValue.lng.toFixed(6))
          ],
          vm.markers.box.lat = parseFloat(newValue.lat.toFixed(6));
          vm.markers.box.lng = parseFloat(newValue.lng.toFixed(6));
          vm.markers.box.height = newValue.height;
        }
        vm.editMarkerInput = angular.copy(vm.markers);
      }
    });

    $scope.$watchCollection('register.newSenseBox.exposure', function (newValue) {
      if (newValue === '') {
        return;
      }
      var icon = '';
      var color = '';

      if (newValue === 'indoor' || newValue === 'outdoor') {
        icon = 'cube';
        color = 'green';
      }

      if (newValue === 'mobile') {
        icon = 'rocket';
        color = 'blue';
      }
      vm.markers = angular.copy(vm.markers);
      vm.markers.box.icon = L.AwesomeMarkers.icon({
        type: 'awesomeMarker',
        prefix: 'fa',
        icon: icon,
        markerColor: color
      });
    });
  }
})();
