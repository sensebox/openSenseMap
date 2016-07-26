'use strict';

angular.module('openSenseMapApp')
  .controller('RegisterCtrl', ['$scope', '$http', '$q', '$timeout', '$filter', '$location', 'leafletData', 'OpenSenseBoxAPI', '$translate', function($scope, $http, $q, $timeout, $filter, $location, leafletData, OpenSenseBoxAPI, $translate){
      $scope.osemapi = OpenSenseBoxAPI;

      $scope.alerts = [];
      $scope.editing = {};
      $scope.isCustom = {};
      $scope.models = {
        home: false,
        basic: false,
        custom: false,

        wifi: false,
        ethernet: false
      };

      $scope.modelSelected = {
        id: false,
        name: false
      };

      $scope.markers = {};

      //new user object
      $scope.user = {
        firstname: '',
        lastname: '',
        email: ''
      };

      //new sensebox object
      $scope.newSenseBox = {
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
      $scope.validateSetup = function() {
        if($scope.rc.sampleWizard.currentIndex !== 1){
          $scope.rc.sampleWizard.forward();
        } else if($scope.rc.sampleWizard.currentIndex === 1 &&
          (($scope.modelSelected.id !== false && $scope.modelSelected.id !== 'custom') || ($scope.modelSelected.id==='custom' && $scope.sensors.length > 0))){

          $scope.invalidHardware = false;
          $scope.sensorIncomplete = false;
          for(var i=0; i < $scope.sensors.length; i++){
            var sensor = $scope.sensors[i];
            if(sensor.unit === '' || sensor.sensorType === '' || sensor.title === ''){
              $scope.invalidHardware = true;
              $scope.sensorIncomplete = true;
            }
          }
          if (!$scope.invalidHardware) {
            $scope.rc.sampleWizard.forward();
          }
        } else {
          $scope.invalidHardware = true;
        }
      };

      $scope.submit = function() {
        if($scope.rc.sampleWizard.currentIndex !== 1) {
          this.generateID();
          this.goToMap();
        }
        $scope.rc.sampleWizard.forward();
      };

      $scope.goToMap = function() {
        $timeout(function() {
          leafletData.getMap().then(function(map) {
            $scope.$watch('$viewContentLoaded', function() {
              map.invalidateSize();
            });
          });
        }, 100);
      };

      $scope.$watch('modelSelected.id', function(newValue) {
        console.log('Selected ' + newValue);
        switch(newValue) {
          case 'homeEthernet':
            $scope.modelSelected.name = 'senseBox Home Ethernet';
            $scope.models = {
              home: true,
              basic: false,
              custom: false,
              wifi: false,
              ethernet: true
            };
            break;
          case 'homeWifi':
            $scope.modelSelected.name = 'senseBox Home Wifi';
            $scope.models = {
              home: true,
              basic: false,
              custom: false,
              wifi: true,
              ethernet: false
            };
            break;
          case 'basicEthernet':
            $scope.modelSelected.name = 'senseBox Basic Ethernet';
            $scope.models = {
              home: false,
              basic: true,
              custom: false,
              wifi: false,
              ethernet: true
            };
            break;
          case 'basicWifi':
            $scope.modelSelected.name = 'senseBox Basic Wifi';
            $scope.models = {
              home: false,
              basic: true,
              custom: false,
              wifi: true,
              ethernet: false
            };
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
            break;
          default:
            $scope.modelSelected.name = false;
            break;
        }
      });

      $scope.defaults = {
        minZoom: 2,
        maxZoom: 22,
        tileLayer: 'OPENSENSEMAP_MAPTILES_URL',
        tileLayerOptions: {
          subdomains: 'abc',
          attribution: '&copy; <a href="http://osm.org/copyright" target="_blank">OpenStreetMap</a> contributors | Tiles &copy; <a href="http://www.mapbox.com/" target="_blank">Mapbox</a>',
          detectRetina: true,
          reuseTiles: true,
          maxZoom: 22,
        },
        worldCopyJump: true,
        scrollWheelZoom: true,
        center: {
          lat: 51.04139389812637,
          lng: 10.21728515625,
          zoom: 5
        }
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

      $scope.save = function (index) {
        for(var i=0; i < $scope.sensors.length; i++){
          if($scope.sensors[i].id==index){
            var sensor = $scope.sensors[i];
            if(sensor.unit !== '' && sensor.sensorType !== '' && sensor.title !== ''){
              $scope.editing[sensor.id]=false;
              $scope.sensorIncomplete = false;
            } else {
              $scope.sensorIncomplete = true;
            }

          }
        }
      };

      $scope.remove = function (index) {
        $scope.sensors.splice(index,1);
        $scope.isCustom[index]=false;
        $scope.editing[index]=false;
        for(var i=0; i < $scope.sensors.length; i++){
          $scope.sensors[i].id=i;
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
          title: '',
          unit: '',
          sensorType: ''
        };
        $scope.sensors.push(sensor);
      };

      $scope.fixedBox = true;
      $scope.change = function () {
        $scope.fixedBox = !$scope.fixedBox;
      };
      $scope.sensors = [];

      // example sensor list used for custom setup
      $scope.phenomenoms = [
        {value: 1, text: 'Temperatur', unit:'°C', type:'BMP085'},
        {value: 2, text: 'Luftfeuchtigkeit', unit:'%', type:'DHT11'},
        {value: 3, text: 'Luftdruck', unit:'Pa', type:'BMP085'},
        {value: 4, text: 'Schall', unit:'Pegel', type:'LM386'},
        {value: 5, text: 'Licht', unit:'Pegel', type:'GL5528'},
        {value: 6, text: 'Licht (digital)', unit: 'lx', type: 'TSL2561'},
        {value: 7, text: 'UV-Intensität', unit: 'µW/cm²', type: 'GUVA-S12D'},
        {value: 8, text: 'Kamera', unit: '', type: ''},
        {value: 99, text: 'Anderer', unit: '', type: ''},
      ];

      $scope.showPhenomenom = function(sensor) {
        if(sensor.title.trim().length===0){
          return 'Not set';
        }
        var selected = [];
        if(sensor.title) {
          selected = $filter('filter')($scope.phenomenoms, {text: sensor.title});
        }

        return selected.length ? selected[0].text : sensor.title;
      };

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

      $scope.completeRegistration = function () {
        console.log($scope.newSenseBox);
        $scope.newSenseBox.apikey = $scope.newSenseBox.orderID;
        $scope.newSenseBox.user = $scope.user;
        $scope.newSenseBox.loc[0].geometry.coordinates.push($scope.markers.box.lng);
        $scope.newSenseBox.loc[0].geometry.coordinates.push($scope.markers.box.lat);

        if ($scope.modelSelected.id === 'custom') {
          for (var i = 0; i < $scope.sensors.length; i++) {
            $scope.newSenseBox.sensors = $scope.sensors;
          }
        } else {
          $scope.newSenseBox.model = $scope.modelSelected.id;
        }

        $http.post($scope.osemapi.url+'/boxes', $scope.newSenseBox)
          .success( function (data) {
            $translate('REGISTRATION_SUCCESS').then(function (msg) {
              var alert = {
                type: 'success',
                msg: msg
              };
              $scope.alerts.push(alert);
              $scope.regSuccess = true;
            });
          })
          .error( function (err) {
            $translate('REGISTRATION_FAIL').then(function (msg) {
              var alert = {
                type: 'danger',
                msg: msg
              };
              $scope.alerts.push(alert);
            });
          });
      };
}]);
