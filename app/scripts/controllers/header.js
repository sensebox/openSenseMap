'use strict';

angular.module('openSenseMapApp')
  .controller('HeaderCtrl', ['$scope', '$rootScope', '$translate', 'OpenSenseBoxAPI', '$http', 'FilterActiveService', 'amMoment', 'tmhDynamicLocale', 'OpenSenseMapData', '$state', function ($scope, $rootScope, $translate, OpenSenseBoxAPI, $http, FilterActiveService, amMoment, tmhDynamicLocale, OpenSenseMapData, $state) {
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

    $scope.selectBox = function ($item) {
      console.log($item);
      $state.go('explore.map.boxdetails', { id: $item.station.id });
    };
}]);
