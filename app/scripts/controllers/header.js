'use strict';

angular.module('openSenseMapApp')
  .controller('HeaderCtrl', ['$scope', '$rootScope', '$translate', '$document', 'OpenSenseBoxAPI', '$http', 'FilterActiveService', 'amMoment', 'tmhDynamicLocale', 'OpenSenseMapData', '$state', 'leafletData', 'ngDialog', 'SignupLoginService', function ($scope, $rootScope, $translate, $document, OpenSenseBoxAPI, $http, FilterActiveService, amMoment, tmhDynamicLocale, OpenSenseMapData, $state, leafletData, ngDialog, SignupLoginService) {
  	$scope.osemapi = OpenSenseBoxAPI;
    $scope.isNavCollapsed = true;
    $scope.open = open;
    $scope.isAuthed = isAuthed;
    $scope.logout = logout;
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
    $scope.searchString = '';
    $scope.showClearSearch = false;
  	$scope.counts = {
  		boxes: '',
  		measurements : ''
  	};
  	$http.get($scope.osemapi.url+'/stats')
  	 .success(function(data){
  		  $scope.counts.boxes = data[0];
  		  $scope.counts.measurements = data[1];
  		  $scope.counts.mPerMin = data[2];
      }).error(function(){
  	});
    $scope.filterActive = FilterActiveService;

    $scope.searchStringChanged = function () {
      if ($scope.searchString !== '') {
        $scope.showClearSearch = true;
      } else {
        $scope.showClearSearch = false;
      }
    };

    $scope.clearSearch = function () {
      $scope.searchString = '';
      $scope.searchStringChanged();
      $document[0].getElementById('searchField').focus();
    };

    $scope.getBoxes = function() {
      var boxes = OpenSenseMapData.boxes;
      return boxes;
    };

    // centers a latlng (marker) on the map while reserving space for the sidebar
    $scope.centerLatLng = function(latlng) {
      leafletData.getMap('map_main').then(function(map) {
        map.fitBounds([[latlng[0],latlng[2]], [latlng[1],latlng[3]]], {
          paddingTopLeft: [0,0],
          animate: false,
          zoom: 20
        });
      });
    };

    $scope.modelOptions = {
      debounce: {
        default: 300,
        blur: 250
      },
      getterSetter: true
    };

    $scope.getLocations = function (searchstring) {
      return $http.get('//locationiq.org/v1/search.php', {
        params: {
          format: 'json',
          key: '23e12b10d8c3aad04e8e',
          addressdetails: 1,
          limit: 4,
          q: searchstring
        }
      }).then(function(response){
        var results = response.data.map(function (item) {
          return item;
        });
        var boxresults = 0;
        OpenSenseMapData.boxes.filter(function (value) {
          if (boxresults === 4) {
            return;
          }
          if (value.station.name.match(new RegExp(searchstring, 'i'))) {
            boxresults++;
            var newStructured = {
              'display_name': value.station.name,
              'boxId': value.station.id
            };
            results.unshift(newStructured);
          }
        });
        return results;
      });
    };

    $scope.selectBox = function ($item) {
      if ($item.boundingbox === undefined) {
        $state.go('explore.map.boxdetails', { id: $item.boxId });
      } else {
        this.centerLatLng($item.boundingbox);
      }
    };

    function open () {
      $scope.launchTemp = ngDialog.open({
        template: '../../views/signup.login.html',
        className: 'ngdialog-theme-default',
        showClose: true,
        closeByDocument: false,
        controller: 'SignupLoginController',
        controllerAs: 'account'
      });
    }

    function isAuthed () {
      return SignupLoginService.isAuthed ? SignupLoginService.isAuthed() : false;
    }

    function logout () {
      SignupLoginService.logout && SignupLoginService.logout();
      $state.go('explore.map');
    }
}]);
