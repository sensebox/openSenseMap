'use strict';

angular.module('openSenseMapApp')
  .controller('RegisterCtrl', ['$scope', '$q', '$timeout', '$filter', 'leafletData',
    function($scope, $q, $timeout, $filter, leafletData){

      $scope.editing = false;
      $scope.tmpSensor = {};
      $scope.edit = function(index) {
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
        email: '',
        firstname: '',
        lastname: ''
      }

      $scope.fixedBox = true;
      $scope.change = function () {
        $scope.fixedBox = !$scope.fixedBox;
      }

      $scope.sensors = [
        {
          id: 1,
          title: 1,
          unit: '°C',
          sensorType: 'BMP085'
        },
        {
          id: 2,
          title: 2,
          unit: '%',
          sensorType: 'DHT11'
        },
        {
          id: 3,
          title: 3,
          unit: 'Pa',
          sensorType: 'BMP085'
        },
        {
          id: 4,
          title: 4,
          unit: 'Pegel',
          sensorType: 'LM386'
        },
        {
          id: 5,
          title: 6,
          unit: 'lx',
          sensorType: 'TSL2561'
        },
        {
          id: 6,
          title: 7,
          unit: 'UV-Index',
          sensorType: 'GUVA-S12D'
        }
      ];

      $scope.phenomenoms = [
        {value: 1, text: 'Temperatur', unit:'°C', type:'BMP085'},
        {value: 2, text: 'Luftfeuchtigkeit', unit:'%', type:'DHT11'},
        {value: 3, text: 'Luftdruck', unit:'Pa', type:'BMP085'},
        {value: 4, text: 'Schall', unit:'Pegel', type:'LM386'},
        {value: 5, text: 'Licht', unit:'Pegel', type:'GL5528'},
        {value: 6, text: 'Licht (digital)', unit: 'lx', type: 'TSL2561'},
        {value: 7, text: 'UV', unit: 'UV-Index', type: 'GUVA-S12D'},
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
          $scope.markers.box = {'lat':args.leafletEvent.latlng.lat,'lng':args.leafletEvent.latlng.lng};
        } else {
          $scope.markers.box.lat = args.leafletEvent.latlng.lat;
          $scope.markers.box.lng = args.leafletEvent.latlng.lng;
        }
      });

      $scope.center = {
        autoDiscover: true,
      };

      $scope.markers = {};

      $scope.$on('leafletDirectiveMap.locationfound', function(e, args){
        if (Object.keys($scope.markers).length === 0) {
          $scope.markers.box = {'lat':args.leafletEvent.latlng.lat,'lng':args.leafletEvent.latlng.lng};
        } else {
          $scope.markers.box.lat = args.leafletEvent.latlng.lat;
          $scope.markers.box.lng = args.leafletEvent.latlng.lng;
        }
        leafletData.getMap().then(function(map) {
          map.setView([args.leafletEvent.latlng.lat,args.leafletEvent.latlng.lng],18);
        });
      });

      $scope.$on('leafletDirectiveMap.locationerror', function(event){
        //TODO set alert
      });

      $scope.completeWizard = function() {
        alert('Completed!');
      }
    }]);