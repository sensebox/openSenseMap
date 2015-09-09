'use strict';

angular.module('openSenseMapApp')
  .controller('RegisterCtrl', ['$scope', '$http', '$q', '$timeout', '$filter', '$location', 'leafletData', 'OpenSenseBoxAPI',
    function($scope, $http, $q, $timeout, $filter, $location, leafletData, OpenSenseBoxAPI){
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
      
      $scope.validatThirdStep = function() {
        // disable the 'next' button on the 3rd step registration wizard conditionally
        return ($scope.modelSelected.id !== false && $scope.modelSelected.id !== 'custom') || ($scope.modelSelected.id==='custom' && $scope.sensors.length > 0);
      };

      $scope.$watch('modelSelected.id', function(newValue, oldValue) {
        console.log('Selected ' + newValue);
        switch(newValue) {
          case 'homeEthernet':
            $scope.modelSelected.name = 'SenseBox Home Ethernet';
            $scope.models = {
              home: true,
              basic: false,
              custom: false,
              wifi: false,
              ethernet: true
            };
            break;
          case 'homeWifi':
            $scope.modelSelected.name = 'SenseBox Home Wifi';
            $scope.models = {
              home: true,
              basic: false,
              custom: false,
              wifi: true,
              ethernet: false
            };
            break;
          case 'basicEthernet':
            $scope.modelSelected.name = 'SenseBox Basic Ethernet';
            $scope.models = {
              home: false,
              basic: true,
              custom: false,
              wifi: false,
              ethernet: true
            };
            break;
          case 'basicWifi':
            $scope.modelSelected.name = 'SenseBox Basic Wifi';
            $scope.models = {
              home: false,
              basic: true,
              custom: false,
              wifi: true,
              ethernet: false
            };
            break;
          case 'custom':
            $scope.modelSelected.name = 'SenseBox manuelle Konfiguration';
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
        tileLayer: 'http://otile{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpeg', // Mapquest Open
        tileLayerOptions: {
          subdomains: '1234',
          //attribution in info modal
          detectRetina: true,
          reuseTiles: true
        },
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
          }
      });

      var geoCoderControl = L.Control.geocoder({
        position: 'topleft',
        placeholder: 'Adresse suchen...'
      });

      geoCoderControl.markGeocode = function (result) {
        console.log(result);
        leafletData.getMap().then(function(map) {
          map.fitBounds(result.bbox);
          if (Object.keys($scope.markers).length === 0) {
            $scope.markers.box = {'lat':result.center.lat,'lng':result.center.lng};
          } else {
            $scope.markers.box.lat = result.center.lat;
            $scope.markers.box.lng = result.center.lng;
          }
        });
      };

      //adds the controls to our map
      $scope.controls = {
        custom: [ geoCoderControl ]
      };

      $scope.edit = function (index) {
        $scope.editing[index]=true;
      };

      $scope.save = function (index) {
        $scope.editing[index]=false;
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

      //new user object
      $scope.user = {
        firstname: '',
        lastname: '',
        email: ''
      };

      $scope.fixedBox = true;
      $scope.change = function () {
        $scope.fixedBox = !$scope.fixedBox;
      };
      $scope.sensors = [];
      // $scope.sensors = [
      //   {
      //     id: 1,
      //     title: 1,
      //     unit: '°C',
      //     sensorType: 'BMP085'
      //   },
      //   {
      //     id: 2,
      //     title: 2,
      //     unit: '%',
      //     sensorType: 'DHT11'
      //   },
      //   {
      //     id: 3,
      //     title: 3,
      //     unit: 'Pa',
      //     sensorType: 'BMP085'
      //   },
      //   {
      //     id: 4,
      //     title: 4,
      //     unit: 'Pegel',
      //     sensorType: 'LM386'
      //   },
      //   {
      //     id: 5,
      //     title: 6,
      //     unit: 'lx',
      //     sensorType: 'TSL2561'
      //   },
      //   {
      //     id: 6,
      //     title: 7,
      //     unit: 'UV-Index',
      //     sensorType: 'GUVA-S12D'
      //   }
      // ];

      // example sensor list used for custom setup
      $scope.phenomenoms = [
        {value: 1, text: 'Temperatur', unit:'°C', type:'BMP085'},
        {value: 2, text: 'Luftfeuchtigkeit', unit:'%', type:'DHT11'},
        {value: 3, text: 'Luftdruck', unit:'Pa', type:'BMP085'},
        {value: 4, text: 'Schall', unit:'Pegel', type:'LM386'},
        {value: 5, text: 'Licht', unit:'Pegel', type:'GL5528'},
        {value: 6, text: 'Licht (digital)', unit: 'lx', type: 'TSL2561'},
        {value: 7, text: 'UV-Index', unit: 'µW/cm²', type: 'GUVA-S12D'},
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

      $scope.showMap = false;
      $scope.$watch('showMap', function(value) {
        if (value === true) {
          leafletData.getMap().then(function(map) {
            map.invalidateSize();
          });
        }
      });

      $scope.goToMap = function() {
        $timeout(function() {
          leafletData.getMap().then(function(map) {
            $scope.$watch('$viewContentLoaded', function() {
              map.invalidateSize();
            });
          });
        }, 100);
      };

      $scope.$on('leafletDirectiveMap.click', function(e, args) {
        if (Object.keys($scope.markers).length === 0) {
          $scope.markers.box = {
            'lat': args.leafletEvent.latlng.lat,
            'lng': args.leafletEvent.latlng.lng,
            'draggable': true
          };
        } else {
          $scope.markers.box.lat = args.leafletEvent.latlng.lat;
          $scope.markers.box.lng = args.leafletEvent.latlng.lng;
          $scope.markers.box.draggable = true;
        }
      });

      $scope.markers = {};

      $scope.$on('leafletDirectiveMap.locationfound', function(e, args){
        if (Object.keys($scope.markers).length === 0) {
          $scope.markers.box = {
            'lat': args.leafletEvent.latlng.lat,
            'lng': args.leafletEvent.latlng.lng,
            'draggable': true
          };
        } else {
          $scope.markers.box.lat = args.leafletEvent.latlng.lat;
          $scope.markers.box.lng = args.leafletEvent.latlng.lng;
          $scope.markers.box.draggable = true;
        }
        leafletData.getMap().then(function(map) {
          map.setView([args.leafletEvent.latlng.lat,args.leafletEvent.latlng.lng],16);
        });
      });

      $scope.$on('leafletDirectiveMap.locationerror', function(event){
        //TODO set alert
        console.log(event);
      });

      $scope.completeRegistration = function () {
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
            var alert = {
              type: 'success',
              msg: 'SenseBox wurde erfolgreich angelegt und du erhälst gleich eine Email mit allen wichtigen Informationen. Du wirst in 10 Sekunden auf die Erkunden-Seite weitergeleitet!'
            };
            $scope.alerts.push(alert);
            $timeout( function () {
              $location.path('/explore');
            },10000);
          })
          .error( function (err) {
            var alert = {
              type: 'danger',
              msg: 'Beim speichern ist ein Fehler aufgetreten. Bitte versuch es zu einem späteren Zeitpunkt noch einmal.'
            };
            $scope.alerts.push(alert);
          });
      }
    }]);