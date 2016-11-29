(function () {
  'use strict'

  angular
    .module('openSenseMapApp')
    .controller('HeaderController', HeaderController)

  HeaderController.$inject = ['$state', '$translate', '$http', 'OpenSenseBoxAPI', 'OpenSenseMapData', 'leafletData', 'amMoment', 'tmhDynamicLocale']

  function HeaderController ($state, $translate, $http, OpenSenseBoxAPI, OpenSenseMapData, leafletData, amMoment, tmhDynamicLocale) {
    var vm = this

    vm.key = ''
    vm.counts = {
      boxes: '',
      measurements: ''
    }
    vm.modelOptions = {
      debounce: {
        default: 300,
        blur: 250
      },
      getterSetter: true
    }

    vm.changeLanguage = changeLanguage
    vm.getBoxes = getBoxes
    vm.selectBox = selectBox
    vm.getLocations = getLocations

    activate()

    //

    function changeLanguage (key) {
      $translate.use(key).then(function (key) {
        vm.key = key.split('_')[0]
        amMoment.changeLocale(vm.key)
        tmhDynamicLocale.set(vm.key)
      }, function (key) {
      })
    }

    function activate () {
      changeLanguage('de_DE')
      return $http.get(OpenSenseBoxAPI.url + '/stats')
        .success(function (data) {
          vm.counts.boxes = data[0]
          vm.counts.measurements = data[1]
          return vm.counts
        }).error(function () {
        })
    }

    function getBoxes () {
      return OpenSenseMapData.boxes
    }

    function selectBox (item) {
      if (item.boundingbox === angular.isUndefinded) {
        $state.go('explore.map.boxdetails', { id: item.boxId })
      } else {
        centerLatLng(item.boundingbox)
      }
    }

    function centerLatLng (latlng) {
      leafletData.getMap('map_main').then(function (map) {
        map.fitBounds([[latlng[0], latlng[2]], [latlng[1], latlng[3]]], {
          paddingTopLeft: [0, 0],
          animate: false,
          zoom: 20
        })
      })
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
      }).then(function (response) {
        var results = response.data.map(function (item) {
          return item
        })
        var boxresults = 0
        OpenSenseMapData.boxes.filter(function (value) {
          if (boxresults === 4) {
            return
          }
          if (value.station.name.match(new RegExp(searchstring, 'i'))) {
            boxresults++
            var newStructured = {
              'display_name': value.station.name,
              'boxId': value.station.id
            }
            results.unshift(newStructured)
          }
        })
        return results
      })
    }
  }
})()
