(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .controller('RegisterController', RegisterController);

  RegisterController.$inject = ['$scope', '$translate', '$timeout', 'SensorIcons', 'WizardHandler', 'AccountService', 'osemMapData'];

  function RegisterController ($scope, $translate, $timeout, SensorIcons, WizardHandler, AccountService, osemMapData) {
    var vm = this;
    vm.stepTitle = '';
    vm.stepIndex = 0;
    vm.showNext = true;
    vm.tag = '';
    vm.geolocationError = {
      error: false,
      message: ''
    };

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

    activate();

    ////

    function activate() {
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

    function downloadArduino (boxId) {
      AccountService.getScript(boxId)
        .then(function (data) {
          vm.boxScript = data;
        })
        .catch(function (error) {
          //todo: display error and reload button
        });
    };

    $scope.open = {
      collapse1: true,
      collapse2: false,
      collapse3: false,
      collapse4: false
    };

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

      if (vm.extensions.feinstaub.id !== '') {
        vm.newSenseBox.model = vm.newSenseBox.model + vm.extensions.feinstaub.id;
      }

      AccountService.postNewBox(vm.newSenseBox)
        .then(function (data) {
          console.log('new sensebox successful', data);
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
          downloadArduino(data.data._id);
          vm.registeredSensors = data.data['sensors'];
          vm.stepIsValid = true;
          vm.stepIndex = 0;
        })
        .catch(function (error) {
          console.log(error);
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

    $scope.$on('osemMapClick.map_register', function(e, args) {
      if (Object.keys(vm.markers).length === 0) {
        vm.markers = {
          box: {
            'lat': parseFloat(args.latlng.lat.toFixed(6)),
            'lng': parseFloat(args.latlng.lng.toFixed(6)),
            'draggable': true,
            'icon': {
              markerColor: 'green'
            }
          }
        };
      } else {
        vm.markers = angular.copy(vm.markers);
        vm.markers.box.lat = parseFloat(args.latlng.lat.toFixed(6));
        vm.markers.box.lng = parseFloat(args.latlng.lng.toFixed(6));
      }
      vm.editMarkerInput =  angular.copy(vm.markers);
    });

    $scope.$on('osemMarkerDragend.map_register', function(e, args) {
      vm.markers = angular.copy(vm.markers);
      vm.markers.box.lat = parseFloat(args.target._latlng.lat.toFixed(6));
      vm.markers.box.lng = parseFloat(args.target._latlng.lng.toFixed(6));
      vm.editMarkerInput =  angular.copy(vm.markers);
    });

    $scope.$on('osemMapOnLocationFound.map_register', function (e, args) {
      vm.map = args.map;
      if (Object.keys(vm.markers).length === 0) {
        vm.markers = {
          box: {
            'lat': parseFloat(args.latlng.lat.toFixed(6)),
            'lng': parseFloat(args.latlng.lng.toFixed(6)),
            'draggable': true,
            'icon': {
              'markerColor': 'green'
            }
          }
        };
        if (args.latlng.altitude) {
          vm.markers.box.height = parseFloat(args.latlng.altitude.toFixed(2))
        }
      } else {
        vm.markers = angular.copy(vm.markers);
        vm.markers.box.lat = parseFloat(args.latlng.lat.toFixed(6));
        vm.markers.box.lng = parseFloat(args.latlng.lng.toFixed(6));
      }
      vm.editMarkerInput =  angular.copy(vm.markers);
    });

    $scope.$on('osemMapOnLocationError.map_register', function(e, args){
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
                map.setView([vm.markers.box.lat,vm.markers.box.lng],16);
              }
            })
            .catch(function (error) {
              console.log(error);
            });
        }, 200);
      }
    });

    $scope.$watch('register.modelSelected.id', function(newValue) {
      if (newValue.indexOf('home') === 0) {
        vm.modelSelected.name = 'senseBox Home ' + newValue.substring(4);
        vm.sensorSetup = vm.modelSelected.id;

        vm.invalidHardware = false;

        return;
      }

      if (newValue.indexOf('luftdaten') === 0) {
        vm.sensorSetup = vm.modelSelected.id;
        vm.extensions.feinstaub.id = '';

        var nameParts = newValue.split('_');

        var name = 'Luftdaten.info Feinstaubsensor (' + nameParts[1].toUpperCase() + ')';

        if (!nameParts[2]) {
          name += ' ohne Temperatur-/Feuchtesensor';
        } else {
          name += ' mit ' + nameParts[2].toUpperCase();
        }
        vm.modelSelected.name = name;

        vm.invalidHardware = false;

        return;
      }

      if (newValue === 'custom') {
        vm.sensorSetup = '';
        vm.extensions.feinstaub.id = '';

        vm.invalidHardware = false;

        return;
      }

      vm.modelSelected.name = false;
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

    $scope.$watch('register.mqtt.url', function(newValue) {
      if (angular.isUndefined(newValue) || !newValue.length) {
        return vm.validMQTTURL = false;
      }
      try {
        if (vm.mqtt.url.indexOf('mqtt://') == 0 || vm.mqtt.url.indexOf('mqtts://') == 0) {
          vm.validMQTTURL = true;
        } else {
          throw 'must start with mqtt[s]://';
        }
      } catch (e) {
        vm.validMQTTURL = false;
      }
    });

    $scope.$watchCollection('register.open.collapse3',function (newValue) {
      if (newValue) {
        vm.modelSelected.id = 'custom';
      }
    });

    $scope.$watchCollection('register.editMarkerInput.box', function (newValue, oldValue) {
      if (newValue && newValue.lat && newValue.lng && !angular.equals(newValue, oldValue)) {
        if (Object.keys(vm.markers).length === 0) {
          vm.markers = {
            box: {
              'lat': parseFloat(newValue.lat.toFixed(6)),
              'lng': parseFloat(newValue.lng.toFixed(6)),
              'height': newValue.height,
              'draggable': true,
              'icon': {
                'markerColor': 'green'
              }
            }
          };
        } else {
          vm.markers = angular.copy(vm.markers);
          vm.markers.box.lat = parseFloat(newValue.lat.toFixed(6));
          vm.markers.box.lng = parseFloat(newValue.lng.toFixed(6));
          vm.markers.box.height = newValue.height;
        }
        vm.editMarkerInput =  angular.copy(vm.markers);
      }
    });
  }
})();
