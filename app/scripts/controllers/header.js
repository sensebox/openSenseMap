(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .controller('HeaderController', HeaderController);

  HeaderController.$inject = ['$rootScope', '$state', '$http', '$document', 'ngDialog', 'OpenSenseMapData', 'OpenSenseBoxAPI', 'FilterActiveService', 'AccountService', 'LanguageService', 'osemMapData', 'LocalStorageService'];

  function HeaderController ($rootScope, $state, $http, $document, ngDialog, OpenSenseMapData, OpenSenseBoxAPI, FilterActiveService, AccountService, LanguageService, osemMapData, LocalStorageService) {
    var vm = this;
    vm.key = 'de';
    vm.searchString = '';
    vm.showClearSearch = false;
    vm.isNavCollapsed = true;
    vm.filterActive = FilterActiveService;
    vm.counts = {
      boxes: '',
      measurements : ''
    };
    vm.modelOptions = {
      debounce: {
        default: 300,
        blur: 250
      },
      getterSetter: true
    };
    vm.username = '';

    vm.isAuthed = isAuthed;
    vm.logout = logout;
    vm.searchStringChanged = searchStringChanged;
    vm.clearSearch = clearSearch;
    vm.open = open;
    vm.getLocations = getLocations;
    vm.selectBox = selectBox;
    vm.changeLang = changeLang;

    activate();

    ////

    function activate () {
      console.log("Activate Header");
      // if (AccountService.isAuthed() || AccountService.refreshTokenExists()) {
      //   AccountService.getUserDetails()
      //     .then(function (data) {
      //       vm.key = data.data.me.language.split('_')[0];
      //       LanguageService.change(data.data.me.language);
      //       vm.username = data.data.me.name;
      //     });
      // } else {
      //   // if (LocalStorageService.getValue('osem_language')) {
      //   //   var languageKey = LocalStorageService.getValue('osem_language');
      //   //   LanguageService.change(languageKey);
      //   //   vm.key = languageKey.split('_')[0];
      //   // } else {
      //   //   var navigatorLanguage = LanguageService.clientLocale();
      //   //   console.info('Detected following navigator language: ', navigatorLanguage);
      //   //   vm.key = navigatorLanguage.split('_')[0];
      //   //   LanguageService.change(navigatorLanguage);
      //   // }
      // }

      $http.get(OpenSenseBoxAPI.url+'/stats')
       .success(function(data){
          vm.counts.boxes = data[0];
          vm.counts.measurements = data[1];
          vm.counts.mPerMin = data[2];
        }).error(function(){
      });
    }

    function changeLang (key) {
      LanguageService.change(key)
        .then(function (response) {
          vm.key = LanguageService.getLanguage();
          LocalStorageService.setValue('osem_language', key);
        })
        .catch(function (error) {
          console.log(error);
        });
    }

    function searchStringChanged () {
      if (vm.searchString !== '') {
        vm.showClearSearch = true;
      } else {
        vm.showClearSearch = false;
      }
    }

    function clearSearch () {
      vm.searchString = '';
      vm.searchStringChanged();
      $document[0].getElementById('searchField').focus();
    }

    function open () {
      var launchTemp = ngDialog.open({
        template: '../../views/signup.login.html',
        className: 'ngdialog-theme-default',
        showClose: true,
        closeByDocument: false,
        controller: 'SignupLoginController',
        controllerAs: 'account'
      });
    }

    function isAuthed () {
      if (AccountService.isAuthed) {
        if (AccountService.isAuthed()) {
          return true;
        } else {
          if (AccountService.refreshTokenExists()) {
            return true;
          } else {
            return false;
          }
        }
      } else {
        return false;
      }
    }

    function logout () {
      AccountService.logout && AccountService.logout();
      $state.go('explore.map');
    }

    function getLocations (searchstring) {
      var results = [];
      var boxresults = 0;

      // search for senseboxes with matching name
      var markers = OpenSenseMapData.getMarkers();
      Object.keys(markers).map(function (key) {
        if (boxresults === 4) {
          return;
        }
        var marker = markers[key];
        if (marker.station.name.match(new RegExp(searchstring, 'i'))) {
          boxresults++;
          var newStructured = {
            'display_name': marker.station.name,
            'boxId': marker.station._id
          };
          results.push(newStructured);
        }

      });

      return $http.get('//locationiq.org/v1/search.php', {
        params: {
          format: 'json',
          key: '23e12b10d8c3aad04e8e',
          addressdetails: 1,
          limit: 4,
          q: searchstring
        }
      })
      .then(function(response){
        return results.concat(response.data);
      })
      .catch(function (err) {
        console.error('error in geolocation lookup:', err);
        return results;
      });
    }

    // centers a latlng (marker) on the map while reserving space for the sidebar
    function centerLatLng (latlng) {
      osemMapData.getMap('map_main').then(function(map) {
        map.fitBounds([[latlng[0],latlng[2]], [latlng[1],latlng[3]]], {
          paddingTopLeft: [0,0],
          animate: false,
          zoom: 20
        });
      });
    }

    function selectBox ($item) {
      if ($item.boundingbox === undefined) {
        $state.go('explore.map.sidebar.boxdetails', { id: $item.boxId });
      } else {
        centerLatLng($item.boundingbox);
      }
    }

    ////

    $rootScope.$on('loggedIn', function (event, data) {
      vm.username = data.data.user.name;
      vm.key = data.data.user.language.split('_')[0];
      LanguageService.change(data.data.user.language);
    });
  }
})();
