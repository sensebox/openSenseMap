'use strict';

angular.module('openSenseMapApp')
  .controller('RegisterCtrl', ['$scope', '$state', '$http', '$q', '$timeout', '$filter', '$location', 'leafletData', 'OpenSenseBoxAPI', 'SensorIcons', '$translate', 'WizardHandler', function($scope, $state, $http, $q, $timeout, $filter, $location, leafletData, OpenSenseBoxAPI, SensorIcons, $translate, WizardHandler){
    $scope.osemapi = OpenSenseBoxAPI;
    $scope.icons = SensorIcons;
    $scope.alerts = [];
    $scope.editing = {};
    $scope.isCustom = {};
    $scope.sensorSetup = '';
    $scope.modelSelected = {
      id: false,
      name: false
    };

    $scope.markers = {};

    //new user object
    $scope.user = {
      firstname: '',
      lastname: '',
      email: '',
      lang: 'de_DE'
    };

    //new sensebox object
    $scope.newSenseBox = {
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

    $scope.mqtt = {
      enabled: false,
      url: '',
      topic: '',
      messageFormat: '',
      decodeOptions: '',
      connectionOptions: ''
    };

    $scope.ttn = {
      profile: 'sensebox/home',
      app_id: '',
      dev_id: '',
      decodeOptions: '[]'
    };

    $scope.editMarkerInput =  angular.copy($scope.markers);
    $scope.$watchCollection('editMarkerInput.box', function (newValue) {
      if (newValue && newValue.lat && newValue.lng) {
        if ($scope.markers.box === undefined) {
          $scope.markers.box = {};
        }
        $scope.markers.box.lng = newValue.lng;
        $scope.markers.box.lat = newValue.lat;
      }
    });

    $scope.invalidHardware = false;

    $scope.exitValidation = function(){
      var stepNumber = WizardHandler.wizard('RegistrationWizard').currentStepNumber();
      switch (stepNumber) {
        case 2:
          if (userForm.$valid) {
            return true;
          }
        case 3:
          if (senseboxForm.$valid) {
            return true;
          }
      }
      return false;
    };

    $scope.enterEvent = function(keyEvent) {
      if (keyEvent.which === 13)
        var stepNumber = WizardHandler.wizard('RegistrationWizard').currentStepNumber();
        switch (stepNumber) {
          case 1:
            WizardHandler.wizard('RegistrationWizard').next();
            break;
          case 2:
            this.generateID();
            this.goToMap();
            if (userForm.$valid) {
              WizardHandler.wizard('RegistrationWizard').next();
            }
            break;
          case 3:
            if ($scope.modelSelected.id === false) {
              $scope.invalidHardware = true;
            } else {
              $scope.invalidHardware = false;
            }
            if ($scope.sensors.length === 0) {
              $scope.sensorIncomplete = true;
            } else {
              $scope.sensorIncomplete = false;
            }
            if (senseboxForm.$valid) {
              WizardHandler.wizard('RegistrationWizard').next();
            }
            break;
          case 4:
            $scope.completeRegistration();
            break;
        }
    }

    // check if valid json for ttn decodeOptions
    $scope.$watch('ttn.decodeOptions', function(newValue) {
      if (!newValue.length) {
        return $scope.invalidTTNconfig = false;
      }
      try {
        if (JSON.parse($scope.ttn.decodeOptions).constructor !== Array) {
          throw 'must be an array';
        }
        $scope.invalidTTNconfig = false;
      } catch (e) {
        $scope.invalidTTNconfig = true;
      }
    });

    $scope.$watch('modelSelected.id', function(newValue) {
      console.log('Selected ' + newValue);
      switch(newValue) {
        case 'homeEthernet':
          $scope.modelSelected.name = 'senseBox Home Ethernet';
          $scope.sensors = [];
          $scope.sensorSetup = $scope.modelSelected.id;
          break;
        case 'homeWifi':
          $scope.modelSelected.name = 'senseBox Home Wifi';
          $scope.sensors = [];
          $scope.sensorSetup = $scope.modelSelected.id;
          break;
        case 'luftdaten_sds011':
          $scope.modelSelected.name = 'Luftdaten.info Feinstaubsensor ohne Temperatur/Feuchtesensor';
          $scope.sensors = [];
          $scope.sensorSetup = $scope.modelSelected.id;
          break;
        case 'luftdaten_sds011_dht11':
          $scope.modelSelected.name = 'Luftdaten.info Feinstaubsensor mit DHT11';
          $scope.sensors = [];
          $scope.sensorSetup = $scope.modelSelected.id;
          break;
        case 'luftdaten_sds011_dht22':
          $scope.modelSelected.name = 'Luftdaten.info Feinstaubsensor mit DHT22';
          $scope.sensors = [];
          $scope.sensorSetup = $scope.modelSelected.id;
          break;
        case 'luftdaten_sds011_bmp180':
          $scope.modelSelected.name = 'Luftdaten.info Feinstaubsensor mit BMP180';
          $scope.sensors = [];
          $scope.sensorSetup = $scope.modelSelected.id;
          break;
        case 'luftdaten_sds011_bme280':
          $scope.modelSelected.name = 'Luftdaten.info Feinstaubsensor mit BME280';
          $scope.sensors = [];
          $scope.sensorSetup = $scope.modelSelected.id;
          break;
        case 'custom':
          $scope.modelSelected.name = 'senseBox manuelle Konfiguration';
          $scope.models = {
            home: false,
            basic: false,
            custom: true,
            wifi: false,
            ethernet: false
          };
          $scope.sensorSetup = '';
          break;
        default:
          $scope.modelSelected.name = false;
          break;
      }
      $scope.invalidHardware = false;
    });

    $scope.defaults = {
      minZoom: 2,
      maxZoom: 18,
      tileLayer: '@@OPENSENSEMAP_MAPTILES_URL',
      tileLayerOptions: {
        subdomains: 'abc',
        attribution: '&copy; <a href="http://osm.org/copyright" target="_blank">OpenStreetMap</a> contributors | Tiles &copy; <a href="http://www.mapbox.com/" target="_blank">Mapbox</a>',
        detectRetina: true,
        reuseTiles: true,
        maxZoom: 18,
      },
      worldCopyJump: true,
      scrollWheelZoom: true,
      center: {
        lat: 51.04139389812637,
        lng: 10.21728515625,
        zoom: 5
      },
      attributionControl: false
    };
    angular.extend($scope, {
      center: {
        autoDiscover: true
      },
      events: {
        map: {
          enable: ['click', 'locationfound', 'locationerror'],
          logic: 'emit'
        }
      }
    });

    $scope.edit = function (index) {
      $scope.editing[index]=true;
    };

    $scope.remove = function (index) {
      $scope.sensors.splice(index,1);
      $scope.isCustom[index]=false;
      $scope.editing[index]=false;
      for(var i=0; i < $scope.sensors.length; i++){
        $scope.sensors[i].id=i;
      }
      if ( $scope.sensors.length === 0) {
        $scope.sensorSetup = '';
        $scope.sensorIncomplete = true;
      } else {
        $scope.sensorSetup = JSON.stringify($scope.sensors);
      }
    };

    $scope.makeCustom = function(title, index) {
      if(title==='Anderer'){
        $scope.isCustom[index]=true;
      } else {
        return false;
      }
    };

    $scope.add = function () {
      var sensor = {
        id: $scope.sensors.length,
        icon: '',
        title: '',
        unit: '',
        sensorType: ''
      };
      $scope.sensors.push(sensor);
      $scope.sensorSetup = JSON.stringify($scope.sensors);
      this.edit(sensor.id);
      $scope.sensorIncomplete = false;
    };

    $scope.setSensorIcon = function(sensor,newIcon) {
      sensor.icon = newIcon.name;
    };

    $scope.fixedBox = true;
    $scope.change = function () {
      $scope.fixedBox = !$scope.fixedBox;
    };
    $scope.sensors = [];

    $scope.generateID = function () {
      var timestamp = (new Date().getTime() / 1000 | 0).toString(16);
      var objectid = timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, function() {
        return (Math.random() * 16 | 0).toString(16);
      }).toLowerCase();
      $scope.newSenseBox.orderID = objectid;
    };

    $scope.fallback = function(copy) {
      window.prompt('Press cmd+c to copy the text below.', copy);
    };

    $scope.showMap = false;
    $scope.$watch('showMap', function(value) {
      if (value === true) {
        leafletData.getMap('map_register').then(function(map) {
          map.invalidateSize();
        });
      }
    });

    $scope.open = {
      collapse1: true,
      collapse2: false,
      collapse3: false
    };

    $scope.$watchCollection('open.collapse3',function (newValue) {
      if (newValue) {
        $scope.modelSelected.id = 'custom';
      }
    });

    $scope.goToMap = function() {
      $timeout(function() {
        leafletData.getMap('map_register').then(function(map) {
          $scope.$watch('$viewContentLoaded', function() {
            map.invalidateSize();
          });
        });
      }, 100);
    };

    $scope.$on('leafletDirectiveMarker.map_register.dragend', function(e, args) {
      $scope.markers[args.modelName].lat = parseFloat(args.model.lat.toFixed(6));
      $scope.markers[args.modelName].lng = parseFloat(args.model.lng.toFixed(6));
      $scope.editMarkerInput =  angular.copy($scope.markers);
    });

    $scope.$on('leafletDirectiveMap.map_register.click', function(e, args) {
      if (Object.keys($scope.markers).length === 0) {
        $scope.markers.box = {
          'lat': parseFloat(args.leafletEvent.latlng.lat.toFixed(6)),
          'lng': parseFloat(args.leafletEvent.latlng.lng.toFixed(6)),
          'draggable': true
        };
      } else {
        $scope.markers.box.lat = parseFloat(args.leafletEvent.latlng.lat.toFixed(6));
        $scope.markers.box.lng = parseFloat(args.leafletEvent.latlng.lng.toFixed(6));
        $scope.markers.box.draggable = true;
      }
      $scope.editMarkerInput =  angular.copy($scope.markers);
    });

    $scope.$on('leafletDirectiveMap.map_register.locationfound', function(e, args){
      if (Object.keys($scope.markers).length === 0) {
        $scope.markers.box = {
          'lat': parseFloat(args.leafletEvent.latlng.lat.toFixed(6)),
          'lng': parseFloat(args.leafletEvent.latlng.lng.toFixed(6)),
          'draggable': true
        };
      } else {
        $scope.markers.box.lat = parseFloat(args.leafletEvent.latlng.lat.toFixed(6));
        $scope.markers.box.lng = parseFloat(args.leafletEvent.latlng.lng.toFixed(6));
        $scope.markers.box.draggable = true;
      }
      leafletData.getMap('map_register').then(function(map) {
        map.setView([args.leafletEvent.latlng.lat,args.leafletEvent.latlng.lng],16);
      });
      $scope.editMarkerInput =  angular.copy($scope.markers);
    });

    $scope.$on('leafletDirectiveMap.map_register.locationerror', function(event){
      //TODO set alert
      console.log(event);
    });

    $scope.goToBox = function () {
      $state.go('explore.map.boxdetails', { id: $scope.newSenseBox.id });
    };

    var downloadArduino = function () {
      var boxid = $scope.newSenseBox.id;
      var apikey = $scope.newSenseBox.apikey;
      $http.get($scope.osemapi.url+'/boxes/'+boxid+'/script', { headers: { 'X-ApiKey': apikey } })
        .success(function(data){
          $scope.boxScript = data;
        }).error(function(){
          // todo: display an error message
      });
    };

    var loadSensors = function () {
      var boxid = $scope.newSenseBox.id;
      $http.get($scope.osemapi.url+'/boxes/'+boxid, {})
        .success(function(data){
          $scope.registeredSensors = data['sensors'];
        }).error(function(){
          // todo: display an error message
      });
    };

    $scope.completeRegistration = function () {
      $scope.alerts = [];
      $scope.newSenseBox.apikey = $scope.newSenseBox.orderID;
      $scope.newSenseBox.user = $scope.user;
      $scope.newSenseBox.mqtt = $scope.mqtt;
      $scope.newSenseBox.ttn = $scope.ttn;
      $scope.newSenseBox.ttn.decodeOptions = JSON.parse($scope.ttn.decodeOptions);
      $scope.newSenseBox.loc[0].geometry.coordinates.push($scope.markers.box.lng);
      $scope.newSenseBox.loc[0].geometry.coordinates.push($scope.markers.box.lat);
      $scope.registering = true;
      if ($translate.proposedLanguage() !== undefined) {
        $scope.newSenseBox.user['lang'] = $translate.proposedLanguage();
      }
      if ($scope.modelSelected.id === 'custom') {
        for (var i = 0; i < $scope.sensors.length; i++) {
          $scope.newSenseBox.sensors = $scope.sensors;
        }
      } else {
        $scope.newSenseBox.model = $scope.modelSelected.id;
      }

      $http.post($scope.osemapi.url+'/boxes', $scope.newSenseBox)
        .success( function (data) {
          $scope.newSenseBox.id = data.boxes[0];
          WizardHandler.wizard('RegistrationWizard').next();
          $scope.registering = false;
          $translate('REGISTRATION_SUCCESS').then(function (msg) {
            var alert = {
              type: 'success',
              msg: msg
            };
            $scope.alerts.push(alert);
            $scope.regSuccess = true;
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
            $scope.alerts.push(alert);
          });
          $scope.registering = false;
        });
    };
}]);
