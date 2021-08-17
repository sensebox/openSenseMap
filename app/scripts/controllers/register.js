/* eslint no-undef: "off" */
(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .controller('RegisterController', RegisterController);

  RegisterController.$inject = [
    '$scope',
    '$translate',
    '$timeout',
    'SensorIcons',
    'WizardHandler',
    'AccountService',
    'osemMapData'
  ];

  function RegisterController (
    $scope,
    $translate,
    $timeout,
    SensorIcons,
    WizardHandler,
    AccountService,
    osemMapData
  ) {
    var vm = this;

    vm.newModel = {
      connection: null,
      sensors: {
        temp: false,
        pressure: false,
        light: false,
        pollution: false,
        bme680: false,
        co2: false
      },
      serialPort: 'Serial1',
      soilDigitalPort: 'A',
      soundMeterPort: 'B',
      windSpeedPort: 'C',
      bmePhenomenon: 'tempHumiPress'
    };
    vm.display_enabled = false;
    vm.wifi = {
      ssid: '',
      pasword: ''
    };

    vm.ttn = {
      devEUI: '',
      appEUI: '',
      appKey: ''
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
      },
      soilMoisture: {
        id: '',
        port: 'A'
      },
      soundLevelMeter: {
        id: '',
        port: 'B'
      },
      windSpeed: {
        id: '',
        port: 'C'
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
      decodeOptions: '[]',
      cayenneLppDecoding: []
    };
    vm.open = {
      sensebox: false,
      luftdaten: false,
      custom: false,
      mqtt: false,
      ttn: false,
      hackair: false,
      edu: false
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
    vm.cayenneLppDecodingChanged = cayenneLppDecodingChanged;
    vm.senseBoxSetupValid = senseBoxSetupValid;
    vm.generateNewSecret = generateNewSecret;
    vm.addSensorTemplate = addSensorTemplate;
    vm.generateScript = generateScript;
    vm.compile = compile;

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
      vm.newModel.security.secret = randomFixedInteger(16)
        .toString(16)
        .toUpperCase();
    }

    function randomFixedInteger (length) {
      return Math.floor(
        Math.pow(10, length - 1) +
          Math.random() * (Math.pow(10, length) - Math.pow(10, length - 1) - 1)
      );
    }

    function generateScript () {
      vm.boxScript = 'Neuer Sketch wird generiert...';

      return getScript();
    }

    function getScript () {
      return AccountService.getScript(vm.newSenseBox.id, {
        serialPort: vm.newSenseBox.serialPort,
        soilDigitalPort: vm.newSenseBox.soilDigitalPort,
        soundMeterPort: vm.newSenseBox.soundMeterPort,
        windSpeedPort: vm.newSenseBox.windSpeedPort,
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
        .catch(function () {});
    }

    function compile () {
      vm.compiling = true;

      return AccountService.compileSketch({
        board: 'sensebox-mcu',
        sketch: vm.boxScript
      })
        .then(function () {})
        .catch(function () {})
        .finally(function () {
          vm.compiling = false;
        });
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
      vm.stepTitle = WizardHandler.wizard(
        'RegistrationWizard'
      ).currentStepTitle();
    }

    function stepBack () {
      WizardHandler.wizard('RegistrationWizard').previous();
      setStepTitle();
      if (
        WizardHandler.wizard('RegistrationWizard').currentStepNumber() - 1 ===
        2
      ) {
        vm.showNext = true;
      } else {
        vm.showNext = true;
        vm.stepIsValid = false;
      }
    }

    function stepForward () {
      WizardHandler.wizard('RegistrationWizard').next();
      setStepTitle();
      if (
        WizardHandler.wizard('RegistrationWizard').currentStepNumber() === 2
      ) {
        vm.showNext = false;
      } else {
        vm.showNext = true;
      }
    }

    function stepIsValidChange (value) {
      if (
        WizardHandler.wizard('RegistrationWizard').currentStepNumber() === 2
      ) {
        vm.stepIsValid = value;
      }
    }

    function enterEvent (keyEvent) {
      var stepNumber = -1;
      if (keyEvent.which === 13) {
        stepNumber = WizardHandler.wizard(
          'RegistrationWizard'
        ).currentStepNumber();
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

    function add (icon, title, unit, sensorType) {
      var sensor = {
        id: vm.sensors.length,
        icon: icon,
        title: title,
        unit: unit,
        sensorType: sensorType
      };
      vm.sensors.push(sensor);
      vm.sensorSetup = JSON.stringify(vm.sensors);
      edit(sensor.id);
      vm.sensorIncomplete = false;

      if (vm.ttn.profile === 'cayenne-lpp') {
        updateCayenneDecoding();
      }
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

      if (vm.ttn.profile === 'cayenne-lpp') {
        updateCayenneDecoding();
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
        data.soilDigitalPort = vm.newSenseBox.soilDigitalPort;
        data.soundMeterPort = vm.newSenseBox.soundMeterPort;
        data.windSpeedPort = vm.newSenseBox.windSpeedPort;
      }
      AccountService.getScript(boxId, data)
        .then(function (data) {
          vm.boxScript = data;
        })
        .catch(function () {});
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

      if (vm.modelSelected.id === 'custom' || vm.modelSelected.id === 'edu') {
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
              case 'bme680':
                vm.newSenseBox.sensorTemplates.push('bme680');
                break;
              case 'co2':
                vm.newSenseBox.sensorTemplates.push('scd30');
                break;
              }
            }
          }
        }
        if (vm.extensions.feinstaub.id !== '') {
          vm.newSenseBox.sensorTemplates.push('sds 011');
          vm.newSenseBox.serialPort = vm.newModel.serialPort;
        }
        if (vm.extensions.soilMoisture.id !== '') {
          vm.newSenseBox.sensorTemplates.push('smt50');
          vm.newSenseBox.soilDigitalPort = vm.extensions.soilMoisture.port;
        }
        if (vm.extensions.soundLevelMeter.id !== '') {
          vm.newSenseBox.sensorTemplates.push('soundlevelmeter');
          vm.newSenseBox.soundMeterPort = vm.extensions.soundLevelMeter.port;
        }
        if (vm.extensions.windSpeed.id !== '') {
          vm.newSenseBox.sensorTemplates.push('windspeed');
          vm.newSenseBox.windSpeedPort = vm.extensions.windSpeed.port;
        }
      }

      if (vm.newModel.connection) {
        vm.newSenseBox.model = vm.newSenseBox.model + vm.newModel.connection;
      }

      if (
        vm.extensions.feinstaub.id !== '' &&
        vm.newSenseBox.model !== 'homeV2Lora'
      ) {
        vm.newSenseBox.model =
          vm.newSenseBox.model + vm.extensions.feinstaub.id;
      }

      AccountService.postNewBox(vm.newSenseBox)
        .then(function (data) {
          vm.newSenseBox.id = data.data._id;
          vm.newSenseBox.access_token = data.data.access_token;

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

    function cayenneLppDecodingChanged (sensor) {
      vm.ttn.cayenneLppDecoding[sensor.id].sensor_title = sensor.title;
      vm.ttn.cayenneLppDecoding[sensor.id].sensor_type = sensor.sensorType;
      vm.ttn.decodeOptions = JSON.stringify(vm.ttn.cayenneLppDecoding);
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

    function generateSensorTemplate (templateName) {
      var icon = '';
      var title = '';
      var unit = '';
      var sensorType = '';

      switch (templateName) {
      case 'HDC1080_TEMPERATURE':
        icon = 'osem-thermometer';
        title = 'Temperatur';
        unit = '°C';
        sensorType = 'HDC1080';
        break;
      case 'HDC1080_HUMIDITY':
        icon = 'osem-humidity';
        title = 'rel. Luftfeuchte';
        unit = '%';
        sensorType = 'HDC1080';
        break;
      case 'BMP280_PRESSURE':
        icon = 'osem-barometer';
        title = 'Luftdruck';
        unit = 'hPa';
        sensorType = 'BMP280';
        break;
      case 'BMP280_TEMPERATURE':
        icon = 'osem-thermometer';
        title = 'Temperatur';
        unit = '°C';
        sensorType = 'BMP280';
        break;
      case 'TSL45315':
        icon = 'osem-brightness';
        title = 'Beleuchtungsstärke';
        unit = 'lx';
        sensorType = 'TSL45315';
        break;
      case 'VEML6070':
        icon = 'osem-brightness';
        title = 'UV-Intensität';
        unit = 'μW/cm²';
        sensorType = 'VEML6070';
        break;
      case 'BME680_TEMPERATURE':
        icon = 'osem-thermometer';
        title = 'Temperatur';
        unit = '°C';
        sensorType = 'BME680';
        break;
      case 'BME680_HUMIDITY':
        icon = 'osem-humidity';
        title = 'rel. Luftfeuchte';
        unit = '%';
        sensorType = 'BME680';
        break;
      case 'BME680_PRESSURE':
        icon = 'osem-barometer';
        title = 'Luftdruck';
        unit = 'hPa';
        sensorType = 'BME680';
        break;
      case 'BME680_VOC':
        icon = 'osem-barometer';
        title = 'VOC';
        unit = 'kΩ';
        sensorType = 'BME680';
        break;
      case 'PM25':
        icon = 'osem-cloud';
        title = 'PM2.5';
        unit = 'µg/m³';
        sensorType = 'SDS 011';
        break;
      case 'PM10':
        icon = 'osem-cloud';
        title = 'PM10';
        unit = 'µg/m³';
        sensorType = 'SDS 011';
        break;
      case 'smt50_soilmoisture':
        icon = 'osem-humidity';
        title = 'Bodenfeuchte';
        unit = '%';
        sensorType = 'SMT50';
        break;
      case 'smt50_soiltemperature':
        icon = 'osem-thermometer';
        title = 'Bodentemperatur';
        unit = '°C';
        sensorType = 'SMT50';
        break;
      case 'soundlevelmeter':
        icon = 'osem-microphone';
        title = 'Lautstärke';
        unit = 'dB';
        sensorType = 'soundlevelmeter';
        break;
      case 'windspeed':
        icon = 'osem-particulate-matter';
        title = 'Windgeschwindigkeit';
        unit = 'm/s';
        sensorType = 'WINDSPEED';
        break;
      case 'scd30_co2':
        icon = 'osem-co2';
        title = 'CO₂';
        unit = 'ppm';
        sensorType = 'SCD30';
        break;
      }

      return {
        icon,
        title,
        unit, sensorType
      };
    }


    function removeSensorTemplate (template) {
      if (template === '' || template === null || template === undefined) {
        return;
      }

      // Remove specific sensor template
      for (let index = 0; index < vm.sensors.length; index++) {
        const element = vm.sensors[index];
        if (element.sensorType === template.sensorType && element.title === template.title) {
          vm.sensors.splice(index, 1);
        }
      }

      // Rewrite sensor ids
      var tempSensors = vm.sensors.map(function (sensor, index) {
        sensor.id = index;

        return sensor;
      });

      angular.copy(tempSensors, vm.sensors);

    }

    function addSensorTemplate (templateName) {
      var template = generateSensorTemplate(templateName);
      add(template.icon, template.title, template.unit, template.sensorType);
    }

    function generateMarkerIcon () {
      var icon = 'circle';
      var color = 'red';

      if (vm.newSenseBox.exposure === 'indoor' || vm.newSenseBox.exposure === 'outdoor') {
        icon = 'cube';
        color = 'green';
      } else if (vm.newSenseBox.exposure === 'mobile') {
        icon = 'rocket';
        color = 'blue';
      }

      return L.AwesomeMarkers.icon({
        type: 'awesomeMarker',
        prefix: 'fa',
        icon: icon,
        markerColor: color
      });
    }

    ////

    $scope.$on('osemMapClick.map_register', function (e, args) {

      if (Object.keys(vm.markers).length === 0) {
        vm.markers = {
          box: {
            layerName: 'registration',
            latLng: [
              parseFloat(args.latlng.lat.toFixed(6)),
              parseFloat(args.latlng.lng.toFixed(6))
            ],
            lat: parseFloat(args.latlng.lat.toFixed(6)),
            lng: parseFloat(args.latlng.lng.toFixed(6)),
            draggable: true,
            icon: generateMarkerIcon()
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
            layerName: 'registration',
            latLng: [
              parseFloat(args.latlng.lat.toFixed(6)),
              parseFloat(args.latlng.lng.toFixed(6))
            ],
            lat: parseFloat(args.latlng.lat.toFixed(6)),
            lng: parseFloat(args.latlng.lng.toFixed(6)),
            draggable: true,
            icon: generateMarkerIcon()
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
          osemMapData
            .getMap('map_register')
            .then(function (map) {
              map.invalidateSize();
              if (!vm.geolocationError.error) {
                map.setView([vm.markers.box.lat, vm.markers.box.lng], 16);
              }
            })
            .catch(function () {});
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

        var name =
          'Luftdaten.info Feinstaubsensor (' + nameParts[1].toUpperCase() + ')';

        if (!nameParts[2]) {
          name = name + ' ohne Temperatur-/Feuchtesensor';
        } else {
          name = name + (' mit ' + nameParts[2].toUpperCase());
        }
        vm.modelSelected.name = name;

        vm.invalidHardware = false;

        return;
      }

      if (newValue.indexOf('hackair') === 0) {
        vm.sensorSetup = vm.modelSelected.id;
        vm.extensions.feinstaub.id = '';
        vm.newModel.connection = null;
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

    // Watch selected sensors if model is homev2
    $scope.$watch('register.newModel.sensors', function (newValue, oldValue) {
      // Add sensor templates
      if (newValue.temp && oldValue.temp === false) {
        addSensorTemplate('HDC1080_TEMPERATURE');
        addSensorTemplate('HDC1080_HUMIDITY');
      } else if (newValue.pressure && oldValue.pressure === false) {
        addSensorTemplate('BMP280_PRESSURE');
      } else if (newValue.light && oldValue.light === false) {
        addSensorTemplate('VEML6070');
        addSensorTemplate('TSL45315');
      } else if (newValue.bme680 && oldValue.bme680 === false) {
        addSensorTemplate('BME680_TEMPERATURE');
        addSensorTemplate('BME680_HUMIDITY');
        addSensorTemplate('BME680_PRESSURE');
        addSensorTemplate('BME680_VOC');
      } else if (newValue.co2 && oldValue.co2 === false) {
        addSensorTemplate('scd30_co2');
      }

      // Remove sensor templates
      if (oldValue.temp && newValue.temp === false) {
        removeSensorTemplate(generateSensorTemplate('HDC1080_TEMPERATURE'));
        removeSensorTemplate(generateSensorTemplate('HDC1080_HUMIDITY'));
      } else if (oldValue.pressure && newValue.pressure === false) {
        removeSensorTemplate(generateSensorTemplate('BMP280_PRESSURE'));
      } else if (oldValue.light && newValue.light === false) {
        removeSensorTemplate(generateSensorTemplate('VEML6070'));
        removeSensorTemplate(generateSensorTemplate('TSL45315'));
      } else if (oldValue.bme680 && newValue.bme680 === '') {
        removeSensorTemplate(generateSensorTemplate('BME680_TEMPERATURE'));
        removeSensorTemplate(generateSensorTemplate('BME680_HUMIDITY'));
        removeSensorTemplate(generateSensorTemplate('BME680_PRESSURE'));
        removeSensorTemplate(generateSensorTemplate('BME680_VOC'));
      } else if (oldValue.co2 && newValue.co2 === '') {
        removeSensorTemplate(generateSensorTemplate('scd30_co2'));
      }
    }, true);

    // Watch extensions because they also add sensors
    $scope.$watch('register.extensions', function (newValue, oldValue) {
      // Add sensor template
      if (newValue.feinstaub.id !== '') {
        addSensorTemplate('PM25');
        addSensorTemplate('PM10');
      } else if (newValue.soilMoisture.id !== '') {
        addSensorTemplate('smt50_soilmoisture');
        addSensorTemplate('smt50_soiltemperature');
      } else if (newValue.soundLevelMeter.id !== '') {
        addSensorTemplate('soundlevelmeter');
      } else if (newValue.windSpeed.id !== '') {
        addSensorTemplate('windspeed');
      }

      // Remove sensor template
      if (newValue.feinstaub.id === '' && oldValue.feinstaub.id !== '') {
        removeSensorTemplate(generateSensorTemplate('PM25'));
        removeSensorTemplate(generateSensorTemplate('PM10'));
      } else if (newValue.soilMoisture.id === '' && oldValue.soilMoisture.id !== '') {
        removeSensorTemplate(generateSensorTemplate('smt50_soilmoisture'));
        removeSensorTemplate(generateSensorTemplate('smt50_soiltemperature'));
      } else if (newValue.soundLevelMeter.id === '' && oldValue.soundLevelMeter.id !== '') {
        removeSensorTemplate(generateSensorTemplate('soundlevelmeter'));
      } else if (newValue.windSpeed.id === '' && oldValue.windSpeed.id !== '') {
        removeSensorTemplate(generateSensorTemplate('windspeed'));
      }
    }, true);

    // Watch added sensors if selected model is custom or edu
    $scope.$watch('register.sensors', function () {
      if (vm.ttn.profile === 'cayenne-lpp') {
        updateCayenneDecoding();
      }
    }, true);

    $scope.$watch('register.newModel.connection', function (newValue) {
      if (newValue === 'Lora') {
        vm.ttnEnabled = true;
        vm.open.ttn = true;
      } else {
        vm.ttnEnabled = false;
        vm.open.ttn = false;
      }
    });

    $scope.$watch('register.ttn.profile', function (newValue) {
      if (newValue === 'cayenne-lpp') {
        updateCayenneDecoding();
      } else {
        vm.ttn.cayenneLppDecoding = [];
        vm.ttn.decodeOptions = JSON.stringify(vm.ttn.cayenneLppDecoding);
      }
    });

    function updateCayenneDecoding () {
      var tempCayenneLppDecoding = vm.sensors.map(function (sensor) {
        var decoderGuess = 'analog_in';

        var tempSubstr = ['temp'];
        var humiSubstr = ['humi', 'feucht'];
        var pressSubstr = ['press', 'druck'];
        var illuSubstr = ['hell', 'illu', 'uv', 'beleuch'];

        // Title could be undefined in manual configuration after adding a sensor
        if (sensor.title) {
          if (new RegExp(tempSubstr.join('|')).test(sensor.title.toLowerCase())) {
            decoderGuess = 'temperature';
          } else if (new RegExp(humiSubstr.join('|')).test(sensor.title.toLowerCase())) {
            decoderGuess = 'relative_humidity';
          } else if (new RegExp(pressSubstr.join('|')).test(sensor.title.toLowerCase())) {
            decoderGuess = 'barometric_pressure';
          } else if (new RegExp(illuSubstr.join('|')).test(sensor.title.toLowerCase())) {
            decoderGuess = 'luminosity';
          }
        }

        return Object.assign({
          sensor_title: sensor.title,
          sensor_type: sensor.sensorType,
          decoder: decoderGuess,
          channel: 1
        });
      });

      // Copy and apply changes to scope variables
      angular.copy(tempCayenneLppDecoding, vm.ttn.cayenneLppDecoding);
      vm.ttn.decodeOptions = JSON.stringify(vm.ttn.cayenneLppDecoding);
    }

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
        if (
          vm.mqtt.url.indexOf('mqtt://') === 0 ||
          vm.mqtt.url.indexOf('mqtts://') === 0
        ) {
          vm.validMQTTURL = true;
        } else {
          throw new Error('must start with mqtt[s]://');
        }
      } catch (e) {
        vm.validMQTTURL = false;
      }
    });

    $scope.$watchCollection('register.open', function (
      newAccordion,
      oldAccordion
    ) {
      if (
        vm.tag === 'edu' &&
        newAccordion &&
        oldAccordion &&
        oldAccordion.edu === true &&
        newAccordion.edu === false
      ) {
        vm.tag = '';
      }
      if (newAccordion) {
        if (newAccordion.custom === true) {
          vm.modelSelected.id = 'custom';
        } else if (newAccordion.edu === true) {
          vm.modelSelected.id = 'edu';
          if (vm.tag === '') {
            vm.tag = 'edu';
          }
        }
      }
    });

    $scope.$watchCollection('register.editMarkerInput.box', function (
      newValue,
      oldValue
    ) {
      if (
        newValue &&
        newValue.lat &&
        newValue.lng &&
        !angular.equals(newValue, oldValue)
      ) {
        if (Object.keys(vm.markers).length === 0) {
          vm.markers = {
            box: {
              layerName: 'registration',
              latLng: [
                parseFloat(newValue.lat.toFixed(6)),
                parseFloat(newValue.lng.toFixed(6))
              ],
              lat: parseFloat(newValue.lat.toFixed(6)),
              lng: parseFloat(newValue.lng.toFixed(6)),
              height: newValue.height,
              draggable: true,
              icon: generateMarkerIcon()
            }
          };
        } else {
          vm.markers = angular.copy(vm.markers);
          (vm.markers.box.latLng = [
            parseFloat(newValue.lat.toFixed(6)),
            parseFloat(newValue.lng.toFixed(6))
          ]),
          (vm.markers.box.lat = parseFloat(newValue.lat.toFixed(6)));
          vm.markers.box.lng = parseFloat(newValue.lng.toFixed(6));
          vm.markers.box.height = newValue.height;
        }
        vm.editMarkerInput = angular.copy(vm.markers);
      }
    });

    $scope.$watchCollection('register.newSenseBox.exposure', function () {
      if (vm.markers.box) {
        vm.markers = angular.copy(vm.markers);
        vm.markers.box.icon = generateMarkerIcon();
      }
    });
  }
})();
