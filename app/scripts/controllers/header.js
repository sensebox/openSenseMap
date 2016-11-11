'use strict';

angular.module('openSenseMapApp')
  .controller('HeaderCtrl', ['$scope', '$rootScope', '$translate', 'OpenSenseBoxAPI', '$http', 'FilterActiveService', 'amMoment', 'tmhDynamicLocale', 'OpenSenseMapData', '$state', 'leafletData', function ($scope, $rootScope, $translate, OpenSenseBoxAPI, $http, FilterActiveService, amMoment, tmhDynamicLocale, OpenSenseMapData, $state, leafletData) {
  	$scope.osemapi = OpenSenseBoxAPI;

    $scope.selected = undefined;

    $scope.changeLang = function (key) {
      $translate.use(key).then(function (key) {
        console.log('Sprache zu '+ key +' gewechselt.');
        $scope.key = key.split('_')[0];
        amMoment.changeLocale($scope.key);
        tmhDynamicLocale.set($scope.key);
      }, function (key) {
        console.log('Fehler beim wechseln zur Sprache ' + key);
      });
    };
    $scope.changeLang('de_DE');

  	$scope.counts = {
  		boxes: '',
  		measurements : ''
  	};
  	$http.get($scope.osemapi.url+'/stats')
  	 .success(function(data){
  		  $scope.counts.boxes = data[0];
  		  $scope.counts.measurements = data[1];
      }).error(function(){
  	});
    $scope.filterActive = FilterActiveService;

    $scope.getBoxes = function(val) {
      var boxes = OpenSenseMapData.boxes;
      return boxes;
    };

    // centers a latlng (marker) on the map while reserving space for the sidebar
    $scope.centerLatLng = function(latlng) {
      leafletData.getMap('map_main').then(function(map) {
        // var padding = 450; // sidebar width: 450px
        // // consider smaller devices (250px min map-width + 450px sidebar-width)
        // if (document.body.clientWidth <= 700) padding = 0;

        map.fitBounds([[latlng[0],latlng[2]], [latlng[1],latlng[3]]], {
          paddingTopLeft: [0,0],
          animate: false
        });
      });
    };

    $scope.modelOptions = {
      debounce: {
        default: 500,
        blur: 250
      },
      getterSetter: true
    };

    $scope.getLocations = function (val) {
      return $http.get('//locationiq.org/v1/search.php', {
        params: {
          format: 'json',
          key: '23e12b10d8c3aad04e8e',
          addressdetails: 1,
          limit: 5,
          q: val
        }
      }).then(function(response){
        return response.data.map(function (item) {
          return item;
        });
      });
    };

    $scope.selectBox = function ($item) {
      console.log($item);
      // $state.go('explore.map.boxdetails', { id: $item.station.id });
      this.centerLatLng($item.boundingbox);
    };
}]);
