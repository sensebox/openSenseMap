'use strict';

angular.module('openSenseMapApp')
  .controller('RegisterCtrl', ['$scope', '$http', '$q', '$timeout', '$filter', '$location', 'leafletData', 'OpenSenseBoxAPI',
    function($scope, $http, $q, $timeout, $filter, $location, leafletData, OpenSenseBoxAPI){
      $scope.osemapi = OpenSenseBoxAPI;

      $scope.alerts = [];
      $scope.editing = false;
      $scope.tmpSensor = {};
      $scope.models = {
        v2014: false,
        v2015: true,
        wifi: false,
        ethernet: false,
        custom: false
      };
      $scope.modelSelected = "SenseBox Home 2015";
      $scope.selectModel = function (model) {
        switch(model) {
          case '2014':
            $scope.modelSelected = "SenseBox Home 2014";
            $scope.models = {
              v2014: true,
              v2015: false,
              wifi: false,
              ethernet: false,
              custom: false
            };
            break;
          case '2015':
            $scope.modelSelected = "SenseBox Home 2015";
            $scope.models = {
              v2014: false,
              v2015: true,
              wifi: false,
              ethernet: false,
              custom: false
            };
            break;
          case 'wifi':
            $scope.modelSelected = "SenseBox Photonik Wifi";
            $scope.models = {
              v2014: false,
              v2015: false,
              wifi: true,
              ethernet: false,
              custom: false
            };
            break;
          case 'ethernet':
            $scope.modelSelected = "SenseBox Photonik Ethernet";
            $scope.models = {
              v2014: false,
              v2015: false,
              wifi: false,
              ethernet: true,
              custom: false
            };
            break;
          case 'custom':
            $scope.modelSelected = "SenseBox manuelle Konfiguration";
            $scope.models = {
              v2014: false,
              v2015: false,
              wifi: false,
              ethernet: false,
              custom: true
            };
            break;
          default:
            $scope.modelSelected = false;
            break;
        }
      }

      $scope.defaults = {
        tileLayer: "http://otile{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpeg", // Mapquest Open
        tileLayerOptions: {
          subdomains: "1234",
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
      }

      //adds the controls to our map
      $scope.controls = {
        custom: [ geoCoderControl ]
      };

      $scope.edit = function (index) {
        $scope.tmpSensor = angular.copy($scope.sensors[index]);
      }

      $scope.save = function (index) {
        $scope.sensors[index] = angular.copy($scope.tmpSensor);
        $scope.tmpSensor = {};
      }

      $scope.delete = function (index) {
        $scope.sensors.splice(index,1);
      }

      $scope.cancel = function(index) {
        if ($scope.editing !== false) {
          $scope.editing = false;
        }
        $scope.tmpSensor = {};
      }

      $scope.add = function () {
        var sensor = {
          id: $scope.sensors.length + 1,
          title: '',
          unit: '',
          sensorType: ''
        };
        $scope.sensors.push(sensor);
      }

      //new user object
      $scope.user = {
        firstname: '',
        lastname: '',
        email: ''
      }

      $scope.fixedBox = true;
      $scope.change = function () {
        $scope.fixedBox = !$scope.fixedBox;
      }
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

      $scope.phenomenoms = [
        {value: 1, text: 'Temperatur', unit:'°C', type:'BMP085'},
        {value: 2, text: 'Luftfeuchtigkeit', unit:'%', type:'DHT11'},
        {value: 3, text: 'Luftdruck', unit:'Pa', type:'BMP085'},
        {value: 4, text: 'Schall', unit:'Pegel', type:'LM386'},
        {value: 5, text: 'Licht', unit:'Pegel', type:'GL5528'},
        {value: 6, text: 'Licht (digital)', unit: 'lx', type: 'TSL2561'},
        {value: 7, text: 'UV', unit: 'µW/cm²', type: 'GUVA-S12D'},
        {value: 8, text: 'Kamera', unit: '', type: ''},
      ];

      $scope.showPhenomenom = function(sensor) {
        var selected = [];
        if(sensor.title) {
          selected = $filter('filter')($scope.phenomenoms, {value: sensor.title});
        }

        return selected.length ? selected[0].text : 'Not set';
      };

      $scope.generateID = function () {
        var timestamp = (new Date().getTime() / 1000 | 0).toString(16);
        var objectid = timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, function() {
          return (Math.random() * 16 | 0).toString(16);
        }).toLowerCase();
        $scope.newSenseBox.orderID = objectid;
      }

      $scope.fallback = function(copy) {
        window.prompt('Press cmd+c to copy the text below.', copy);
      };

      //new sensebox object
      $scope.newSenseBox = {
        name: '',
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
      $scope.$watch("showMap", function(value) {
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
      }

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
      });

      $scope.completeRegistration = function () {
        $scope.newSenseBox.apikey = $scope.newSenseBox.orderID;
        $scope.newSenseBox.user = $scope.user;
        // $scope.newSenseBox.sensors = $scope.sensors;
        $scope.newSenseBox.loc[0].geometry.coordinates.push($scope.markers.box.lng);
        $scope.newSenseBox.loc[0].geometry.coordinates.push($scope.markers.box.lat);

        if ($scope.models.custom) {
          for (var i = 0; i < $scope.sensors.length; i++) {
            $scope.newSenseBox.sensors = $scope.sensors;
            $scope.sensors[i].title = $scope.phenomenoms[$scope.sensors[i].title-1].text;
          }
        } else {
          if ($scope.models.v2014) {
            $scope.newSenseBox.model = "senseboxhome2014";
          } else if ($scope.models.v2015) {
            $scope.newSenseBox.model = "senseboxhome2015";
          } else if ($scope.models.wifi) {
            $scope.newSenseBox.model = "senseboxphotonikwifi";
          } else if ($scope.models.ethernet) {
            $scope.newSenseBox.model = "senseboxphotonikethernet";
          }
        }

        $http.post($scope.osemapi.url+'/boxes', $scope.newSenseBox)
          .success( function (data) {
            var alert = {
              type: 'success',
              msg: 'SenseBox wurde erfolgreich angelegt. Du wirst in 5 Sekunden auf die Erkunden-Seite weitergeleitet!'
            };
            $scope.alerts.push(alert);
            $timeout( function () {
              $location.path('/explore');
            },5000);
          })
          .error( function (err) {
            var alert = {
              type: 'danger',
              msg: 'Beim speichern ist ein Fehler aufgetreten. Bitte versuch nochmal deine SenseBox zu speichern.'
            };
            $scope.alerts.push(alert);
          });
      }
    }]);