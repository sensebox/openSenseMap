(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .controller('HeaderController', HeaderController);

  HeaderController.$inject = ['$state', '$http', '$document', 'ngDialog', 'leafletData', 'OpenSenseMapData', 'OpenSenseBoxAPI', 'FilterActiveService', 'AccountService', 'SignupLoginService', 'LanguageService'];

  function HeaderController ($state, $http, $document, ngDialog, leafletData, OpenSenseMapData, OpenSenseBoxAPI, FilterActiveService, AccountService, SignupLoginService, LanguageService) {
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

    vm.isAuthed = isAuthed;
    vm.logout = logout;
    vm.searchStringChanged = searchStringChanged;
    vm.clearSearch = clearSearch;
    vm.open = open;
    vm.getLocations = getLocations;
    vm.getBoxes = getBoxes;
    vm.selectBox = selectBox;
    vm.changeLang = changeLang;

    activate();

    ////

    function activate () {
      console.info('Header is activated!');
      AccountService.getUserDetails()
        .then(function (data) {
          vm.key = data.data.me.language.split('_')[0];
          LanguageService.change(data.data.me.language);
        })
        .catch(function (error) {
          console.info('Set language to default');
          vm.key = 'de';
          LanguageService.change('de_DE');
        });

      // LanguageService.change('de_DE');
      $http.get(OpenSenseBoxAPI.url+'/stats')
       .success(function(data){
          vm.counts.boxes = data[0];
          vm.counts.measurements = data[1];
          vm.counts.mPerMin = data[2];
        }).error(function(){
      });
    };

    function changeLang (key) {
      LanguageService.change(key);
    }

    function searchStringChanged () {
      if (vm.searchString !== '') {
        vm.showClearSearch = true;
      } else {
        vm.showClearSearch = false;
      }
    };

    function clearSearch () {
      vm.searchString = '';
      vm.searchStringChanged();
      $document[0].getElementById('searchField').focus();
    };

    function open () {
      vm.launchTemp = ngDialog.open({
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

    function getLocations (searchstring) {
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

    function getBoxes () {
      var boxes = OpenSenseMapData.boxes;
      return boxes;
    };

    // centers a latlng (marker) on the map while reserving space for the sidebar
    function centerLatLng (latlng) {
      leafletData.getMap('map_main').then(function(map) {
        map.fitBounds([[latlng[0],latlng[2]], [latlng[1],latlng[3]]], {
          paddingTopLeft: [0,0],
          animate: false,
          zoom: 20
        });
      });
    };

    function selectBox ($item) {
      if ($item.boundingbox === undefined) {
        $state.go('explore.map.boxdetails', { id: $item.boxId });
      } else {
        this.centerLatLng($item.boundingbox);
      }
    };
  }
})();
