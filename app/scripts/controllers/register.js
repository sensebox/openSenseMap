(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .controller('RegisterController', RegisterController);

  RegisterController.$inject = ['$scope', '$http', '$translate' ,'leafletData', 'OpenSenseBoxAPI', 'MapService', 'SensorIcons', 'WizardHandler'];

  function RegisterController ($scope, $http, $translate ,leafletData, OpenSenseBoxAPI, MapService, SensorIcons, WizardHandler) {
    var vm = this;
    vm.stepTitle = '';
    vm.stepIndex = 0;
    vm.showNext = true;

    //new sensebox object
    vm.newSenseBox = {
      id: '',
      name: '',
      model: '',
      boxType: 'fixed',
      sensors: [],
      tag: '',
      exposure: '',
      orderID: '',
      loc: [{
        'type':'feature',
        'geometry': {
          'type':'Point',
          'coordinates':[]
        }
      }]
    };
    vm.modelSelected = {
      id: '',
      name: false
    };
    vm.extensions = {
      feinstaub: {
        id: ''
      }
    }
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

    activate();

    ////

    function activate() {
      vm.defaults = MapService.defaults;
      vm.center = MapService.center;
      vm.events = MapService.events;
      vm.icons = SensorIcons;
      vm.editMarkerInput =  angular.copy(vm.markers);
      vm.registering = false;
      $translate('STEP0').then(function (msg) {
        vm.stepTitle = msg;
      });
    }

    function isSenseBoxModel () {
      if (vm.modelSelected.id.startsWith('home')) {
        return false;
      }

      return true;
    }

    function setStepTitle() {
      vm.stepTitle = WizardHandler.wizard('RegistrationWizard').currentStepTitle();
    }

    function stepBack () {
      WizardHandler.wizard('RegistrationWizard').previous();
      setStepTitle();
      if (WizardHandler.wizard('RegistrationWizard').currentStepNumber()-1 === 2) {
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

    function enterEvent(keyEvent) {
      if (keyEvent.which === 13)
        var stepNumber = WizardHandler.wizard('RegistrationWizard').currentStepNumber();
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
    };

    function remove (index) {
        vm.sensors.splice(index,1);
        vm.isCustom[index]=false;
        vm.editing[index]=false;
        for(var i=0; i < vm.sensors.length; i++){
          vm.sensors[i].id=i;
        }
        if ( vm.sensors.length === 0) {
          vm.sensorSetup = '';
          vm.sensorIncomplete = true;
        } else {
          vm.sensorSetup = JSON.stringify($scope.sensors);
        }
      };

    function edit (index) {
      vm.editing[index] = true;
    };

    function setSensorIcon (sensor, newIcon) {
      sensor.icon = newIcon.name;
    };

    function downloadArduino () {
      var boxid = vm.newSenseBox.id;
      $http.get(OpenSenseBoxAPI.url+'/boxes/'+boxid+'/script')
        .success(function(data){
          vm.boxScript = data;
        }).error(function(){
          // todo: display an error message
      });
    };

    function loadSensors () {
      var boxid = vm.newSenseBox.id;
      $http.get(OpenSenseBoxAPI.url+'/boxes/'+boxid)
        .success(function(data){
          vm.registeredSensors = data['sensors'];
        }).error(function(){
          // todo: display an error message
      });
    };

    function completeRegistration () {
      setStepTitle();
      vm.alerts = [];
      vm.newSenseBox.mqtt = vm.mqtt;
      if (vm.ttnEnabled) {
        vm.newSenseBox.ttn = vm.ttn;
      }
      vm.newSenseBox.loc[0].geometry.coordinates.push(vm.markers.box.lng);
      vm.newSenseBox.loc[0].geometry.coordinates.push(vm.markers.box.lat);
      vm.registering = true;
      if (vm.modelSelected.id === 'custom') {
        for (var i = 0; i < vm.sensors.length; i++) {
          vm.newSenseBox.sensors = vm.sensors;
        }
      } else {
        vm.newSenseBox.model = vm.modelSelected.id;
      }

      if (vm.extensions.feinstaub.id !== '') {
        vm.newSenseBox.model = vm.newSenseBox.model + vm.extensions.feinstaub.id;
      }

      $http.post(OpenSenseBoxAPI.url+'/boxes', vm.newSenseBox)
        .success( function (response) {
          vm.newSenseBox.id = response.data._id;
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
          downloadArduino();
          loadSensors();
        })
        .error( function () {
          $translate('REGISTRATION_FAIL').then(function (msg) {
            var alert = {
              type: 'danger',
              msg: msg
            };
            vm.alerts.push(alert);
          });
          vm.registering = false;
        });
    };

    ////

    $scope.$on('leafletDirectiveMarker.map_register.dragend', function(e, args) {
      vm.markers[args.modelName].lat = parseFloat(args.model.lat.toFixed(6));
      vm.markers[args.modelName].lng = parseFloat(args.model.lng.toFixed(6));
      vm.editMarkerInput =  angular.copy(vm.markers);
    });

    $scope.$on('leafletDirectiveMap.map_register.click', function(e, args) {
      if (Object.keys(vm.markers).length === 0) {
        vm.markers.box = {
          'lat': parseFloat(args.leafletEvent.latlng.lat.toFixed(6)),
          'lng': parseFloat(args.leafletEvent.latlng.lng.toFixed(6)),
          'draggable': true
        };
      } else {
        vm.markers.box.lat = parseFloat(args.leafletEvent.latlng.lat.toFixed(6));
        vm.markers.box.lng = parseFloat(args.leafletEvent.latlng.lng.toFixed(6));
        vm.markers.box.draggable = true;
      }
      vm.editMarkerInput =  angular.copy(vm.markers);
    });

    $scope.$on('leafletDirectiveMap.map_register.locationfound', function(e, args){
      if (Object.keys(vm.markers).length === 0) {
        vm.markers.box = {
          'lat': parseFloat(args.leafletEvent.latlng.lat.toFixed(6)),
          'lng': parseFloat(args.leafletEvent.latlng.lng.toFixed(6)),
          'draggable': true
        };
      } else {
        vm.markers.box.lat = parseFloat(args.leafletEvent.latlng.lat.toFixed(6));
        vm.markers.box.lng = parseFloat(args.leafletEvent.latlng.lng.toFixed(6));
        vm.markers.box.draggable = true;
      }
      leafletData.getMap('map_register').then(function(map) {
        map.setView([args.leafletEvent.latlng.lat,args.leafletEvent.latlng.lng],16);
      });
      vm.editMarkerInput =  angular.copy(vm.markers);
    });

    $scope.$on('leafletDirectiveMap.map_register.locationerror', function(event){
      //TODO set alert
      console.log(event);
    });

    $scope.$on('wizard:stepChanged', function (step, index) {
      vm.stepIndex = index.index;
      $translate(index.step.wzData.translation).then(function (msg) {
        vm.stepTitle = msg;
      });
    });

    $scope.$watch('register.modelSelected.id', function(newValue) {
      console.log('Selected ' + newValue);
      switch(newValue) {
        case 'homeEthernet':
          vm.modelSelected.name = 'senseBox Home Ethernet';
          vm.sensors = [];
          vm.sensorSetup = vm.modelSelected.id;
          break;
        case 'homeWifi':
          vm.modelSelected.name = 'senseBox Home Wifi';
          vm.sensors = [];
          vm.sensorSetup = vm.modelSelected.id;
          break;
        case 'luftdaten_sds011':
          vm.modelSelected.name = 'Luftdaten.info Feinstaubsensor ohne Temperatur/Feuchtesensor';
          vm.sensors = [];
          vm.sensorSetup = vm.modelSelected.id;
          vm.extensions.feinstaub.id = '';
          break;
        case 'luftdaten_sds011_dht11':
          vm.modelSelected.name = 'Luftdaten.info Feinstaubsensor mit DHT11';
          vm.sensors = [];
          vm.sensorSetup = vm.modelSelected.id;
          vm.extensions.feinstaub.id = '';
          break;
        case 'luftdaten_sds011_dht22':
          vm.modelSelected.name = 'Luftdaten.info Feinstaubsensor mit DHT22';
          vm.sensors = [];
          vm.sensorSetup = vm.modelSelected.id;
          vm.extensions.feinstaub.id = '';
          break;
        case 'luftdaten_sds011_bmp180':
          vm.modelSelected.name = 'Luftdaten.info Feinstaubsensor mit BMP180';
          vm.sensors = [];
          vm.sensorSetup = vm.modelSelected.id;
          vm.extensions.feinstaub.id = '';
          break;
        case 'luftdaten_sds011_bme280':
          vm.modelSelected.name = 'Luftdaten.info Feinstaubsensor mit BME280';
          vm.sensors = [];
          vm.sensorSetup = vm.modelSelected.id;
          vm.extensions.feinstaub.id = '';
          break;
        case 'custom':
          vm.modelSelected.name = 'senseBox manuelle Konfiguration';
          vm.sensorSetup = '';
          vm.extensions.feinstaub.id = '';
          break;
        default:
          vm.modelSelected.name = false;
          break;
      }
      vm.invalidHardware = false;
    });

    // check if valid json for ttn decodeOptions
    $scope.$watch('register.ttn.decodeOptions', function(newValue) {
      if (!newValue.length) {
        return vm.validTTNconfig = true;
      }
      try {
        if (JSON.parse(vm.ttn.decodeOptions).constructor !== Array) {
          throw 'must be an array';
        }
        vm.validTTNconfig = true;
      } catch (e) {
        vm.validTTNconfig = false;
      }
    });

    $scope.$watchCollection('register.open.collapse3',function (newValue) {
      if (newValue) {
        vm.modelSelected.id = 'custom';
      }
    });

    $scope.$watchCollection('register.editMarkerInput.box', function (newValue) {
      if (newValue && newValue.lat && newValue.lng) {
        if (vm.markers.box === undefined) {
          vm.markers.box = {};
        }
        vm.markers.box.lng = newValue.lng;
        vm.markers.box.lat = newValue.lat;
      }
    });
  }
})();
