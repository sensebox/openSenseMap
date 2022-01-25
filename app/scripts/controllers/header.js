(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .controller('HeaderController', HeaderController);

  HeaderController.$inject = ['$rootScope', '$state', '$http', '$document', 'ngDialog', 'OpenSenseMapData', 'OpenSenseMapAPI', 'FilterActiveService', 'AccountService', 'LanguageService', 'osemMapData', 'LocalStorageService', 'DonationModalService'];

  function HeaderController ($rootScope, $state, $http, $document, ngDialog, OpenSenseMapData, OpenSenseMapAPI, FilterActiveService, AccountService, LanguageService, osemMapData, LocalStorageService, DonationModalService) {
    var vm = this;
    vm.key = 'de';
    vm.searchString = '';
    vm.showClearSearch = false;
    vm.isNavCollapsed = true;
    vm.showAnnouncment = true;
    vm.filterActive = FilterActiveService;
    vm.counts = {
      boxes: '',
      measurements: ''
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
    vm.openHelp = openHelp;
    vm.getLocations = getLocations;
    vm.selectBox = selectBox;
    vm.changeLang = changeLang;
    vm.closeNavbar = closeNavbar;

    activate();

    ////

    function activate () {
      vm.key = LanguageService.getLanguage();

      OpenSenseMapAPI.getStats()
        .then(function (data) {
          vm.counts.boxes = data[0];
          vm.counts.measurements = data[1];
          vm.counts.mPerMin = data[2];
        })
        .catch(function () {

        });

      if (isAuthed()) {
        return AccountService.getUserDetails()
          .then(function (data) {
            var newData = {
              data: {
                user: data.data.me
              }
            };
            $rootScope.$emit('loggedIn', newData);
          });
      }
    }

    function closeNavbar () {
      vm.isNavCollapsed = true;
    }

    function changeLang (key) {
      LanguageService.change(key)
        .then(function () {
          vm.key = LanguageService.getLanguage();
          LocalStorageService.setValue('osem_language', key);
          vm.isNavCollapsed = true;
        })
        .catch(function () {
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
      ngDialog.open({
        template: '../../views/signup.login.html',
        className: 'ngdialog-theme-default',
        showClose: true,
        closeByDocument: false,
        controller: 'SignupLoginController',
        controllerAs: 'account'
      });

      vm.isNavCollapsed = true;
    }

    function openHelp () {
      DonationModalService.open();
      vm.isNavCollapsed = true;
    }

    function isAuthed () {
      if (AccountService.isAuthed) {
        if (AccountService.isAuthed()) {
          return true;
        }
        if (AccountService.refreshTokenExists()) {
          return true;
        }

        return false;


      }

      return false;

    }

    function logout () {
      AccountService.logout && AccountService.logout();
      closeNavbar();
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
        .then(function (response) {
          return results.concat(response.data);
        })
        .catch(function () {
          return results;
        });
    }

    // centers a latlng (marker) on the map while reserving space for the sidebar
    function centerLatLng (latlng) {
      osemMapData.getMap('map_main').then(function (map) {
        map.fitBounds([[latlng[0], latlng[2]], [latlng[1], latlng[3]]], {
          paddingTopLeft: [0, 0],
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

    $rootScope.$on('osemAnnouncementClosed', function () {
      vm.showAnnouncment = false;
    });
  }
})();
