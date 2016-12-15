(function () {
  'use strict'

  angular
    .module('openSenseMapApp')
    .controller('RegistrationController', RegistrationController)

  RegistrationController.$inject = ['$scope', '$state', '$http', '$translate', '$timeout', 'leafletData', 'OpenSenseBoxAPI', 'SensorIcons']

  function RegistrationController ($scope, $state, $http, $translate, $timeout, leafletData, OpenSenseBoxAPI, SensorIcons) {
    var vm = this
    vm.sensors = []
    vm.showMap = false
    vm.invalidHardware = false
    vm.fixedBox = true
    vm.open = {
      collapse1: true,
      collapse2: false,
      collapse3: false
    }

    vm.icons = SensorIcons
    vm.alerts = []
    vm.editing = {}
    vm.isCustom = {}
    vm.sensorSetup = ''
    vm.models = {
      home: false,
      basic: false,
      custom: false,

      wifi: false,
      ethernet: false
    }

    vm.modelSelected = {
      id: false,
      name: false
    }

    vm.markers = {}

    // new user object
    vm.user = {
      firstname: '',
      lastname: '',
      email: '',
      lang: 'de_DE'
    }

    // new sensebox object
    vm.newSenseBox = {
      id: '',
      name: '',
      model: '',
      boxType: 'fixed',
      sensors: [],
      tag: '',
      exposure: '',
      orderID: '',
      loc: [{
        'type': 'feature',
        'geometry': {
          'type': 'Point',
          'coordinates': []
        }
      }]
    }

    vm.mqtt = {
      enabled: false,
      url: '',
      topic: '',
      messageFormat: '',
      decodeOptions: '',
      connectionOptions: ''
    }

    vm.defaults = {
      minZoom: 2,
      maxZoom: 22,
      tileLayer: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      tileLayerOptions: {
        subdomains: 'abc',
        attribution: '&copy; <a href="http://osm.org/copyright" target="_blank">OpenStreetMap</a> contributors | Tiles &copy; <a href="http://www.mapbox.com/" target="_blank">Mapbox</a>',
        detectRetina: true,
        reuseTiles: true,
        maxZoom: 22
      },
      worldCopyJump: true,
      scrollWheelZoom: true,
      center: {
        lat: 51.04139389812637,
        lng: 10.21728515625,
        zoom: 5
      }
    }

    vm.enterEvent = enterEvent
    vm.submit = submit
    vm.remove = remove
    vm.add = add
    vm.setSensorIcon = setSensorIcon
    vm.change = change
    vm.goToBox = goToBox
    vm.completeRegistration = completeRegistration

    activate()

    //

    function activate () {
      vm.editMarkerInput = angular.copy(vm.markers)

      angular.extend(vm, {
        center: {
          autoDiscover: true
        },
        events: {
          map: {
            enable: ['click', 'locationfound', 'locationerror'],
            logic: 'emit'
          }
        }
      })
    }

    function enterEvent (keyEvent) {
      if (keyEvent.which === 13) {
        if ($scope.rc.sampleWizard.currentIndex === 0) {
          $scope.rc.sampleWizard.forward()
        } else if ($scope.rc.sampleWizard.currentIndex === 1) {
          generateID()
          goToMap()
        } else if ($scope.rc.sampleWizard.currentIndex === 2) {
          if (vm.modelSelected.id === false) {
            vm.invalidHardware = true
          } else {
            vm.invalidHardware = false
          }

          if (vm.sensors.length === 0) {
            vm.sensorIncomplete = true
          } else {
            vm.sensorIncomplete = false
          }
        } else if ($scope.rc.sampleWizard.currentIndex === 3) {
          completeRegistration()
        }
      }
    }

    function submit () {
      if ($scope.rc.sampleWizard.currentIndex === 1) {
        generateID()
        goToMap()
      } else if ($scope.rc.sampleWizard.currentIndex === 2) {
        if (vm.modelSelected.id === false) {
          vm.invalidHardware = true
        } else {
          vm.invalidHardware = false
        }

        if (vm.sensors.length === 0) {
          vm.sensorIncomplete = true
        } else {
          vm.sensorIncomplete = false
        }
      }
      $scope.rc.sampleWizard.forward()
    }

    function goToMap () {
      $timeout(function () {
        leafletData.getMap('map_register').then(function (map) {
          $scope.$watch('$viewContentLoaded', function () {
            map.invalidateSize()
          })
        })
      }, 100)
    }

    function edit (index) {
      vm.editing[index] = true
    }

    function remove (index) {
      vm.sensors.splice(index, 1)
      vm.isCustom[index] = false
      vm.editing[index] = false
      for (var i = 0; i < vm.sensors.length; i++) {
        vm.sensors[i].id = i
      }
      if (vm.sensors.length === 0) {
        vm.sensorSetup = ''
        vm.sensorIncomplete = true
      } else {
        vm.sensorSetup = angular.toJson(vm.sensors)
      }
    }

    function add () {
      var sensor = {
        id: vm.sensors.length,
        icon: '',
        title: '',
        unit: '',
        sensorType: ''
      }
      vm.sensors.push(sensor)
      vm.sensorSetup = angular.toJson(vm.sensors)
      edit(sensor.id)
      vm.sensorIncomplete = false
    }

    function setSensorIcon (sensor, newIcon) {
      sensor.icon = newIcon.name
    }

    function change () {
      vm.fixedBox = !vm.fixedBox
    }

    function generateID () {
      var timestamp = (new Date().getTime() / 1000 | 0).toString(16)
      var objectid = timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, function () {
        return (Math.random() * 16 | 0).toString(16)
      }).toLowerCase()
      vm.newSenseBox.orderID = objectid
    }

    function goToBox () {
      $state.go('explore.map.boxdetails', { id: vm.newSenseBox.id })
    }

    function downloadArduino () {
      var boxid = vm.newSenseBox.id
      var apikey = vm.newSenseBox.apikey
      $http.get(OpenSenseBoxAPI.url + '/boxes/' + boxid + '/script', { headers: { 'X-ApiKey': apikey } })
        .success(function (data) {
          vm.boxScript = data
        }).error(function () {
          // todo: display an error message
        })
    }

    function loadSensors () {
      var boxid = vm.newSenseBox.id
      $http.get(OpenSenseBoxAPI.url + '/boxes/' + boxid, {})
        .success(function (data) {
          vm.registeredSensors = data['sensors']
        }).error(function () {
          // todo: display an error message
        })
    }

    function completeRegistration () {
      vm.alerts = []
      vm.newSenseBox.apikey = vm.newSenseBox.orderID
      vm.newSenseBox.user = vm.user
      vm.newSenseBox.mqtt = vm.mqtt
      vm.newSenseBox.loc[0].geometry.coordinates.push(vm.markers.box.lng)
      vm.newSenseBox.loc[0].geometry.coordinates.push(vm.markers.box.lat)
      if (angular.isDefined($translate.proposedLanguage())) {
        vm.newSenseBox.user['lang'] = $translate.proposedLanguage()
      }
      if (vm.modelSelected.id === 'custom') {
        for (var i = 0; i < vm.sensors.length; i++) {
          vm.newSenseBox.sensors = vm.sensors
        }
      } else {
        vm.newSenseBox.model = vm.modelSelected.id
      }

      $http.post(OpenSenseBoxAPI.url + '/boxes', vm.newSenseBox)
        .success(function (data) {
          vm.newSenseBox.id = data.boxes[0]
          $scope.rc.sampleWizard.forward()
          $translate('REGISTRATION_SUCCESS').then(function (msg) {
            var alert = {
              type: 'success',
              msg: msg
            }
            vm.alerts.push(alert)
            vm.regSuccess = true
          })
          downloadArduino()
          loadSensors()
        })
        .error(function () {
          $translate('REGISTRATION_FAIL').then(function (msg) {
            var alert = {
              type: 'danger',
              msg: msg
            }
            vm.alerts.push(alert)
          })
        })
    }

    //

    $scope.$watch('register.showMap', function (value) {
      if (value === true) {
        leafletData.getMap('map_register').then(function (map) {
          map.invalidateSize()
        })
      }
    })

    $scope.$watch('register.modelSelected.id', function (newValue) {
      switch (newValue) {
        case 'homeEthernet':
          vm.modelSelected.name = 'senseBox Home Ethernet'
          vm.models = {
            home: true,
            basic: false,
            custom: false,
            wifi: false,
            ethernet: true
          }
          vm.sensors = []
          vm.sensorSetup = vm.modelSelected.id
          break
        case 'homeWifi':
          vm.modelSelected.name = 'senseBox Home Wifi'
          vm.models = {
            home: true,
            basic: false,
            custom: false,
            wifi: true,
            ethernet: false
          }
          vm.sensors = []
          vm.sensorSetup = vm.modelSelected.id
          break
        case 'basicEthernet':
          vm.modelSelected.name = 'senseBox Basic Ethernet'
          vm.models = {
            home: false,
            basic: true,
            custom: false,
            wifi: false,
            ethernet: true
          }
          vm.sensors = []
          vm.sensorSetup = vm.modelSelected.id
          break
        case 'basicWifi':
          vm.modelSelected.name = 'senseBox Basic Wifi'
          vm.models = {
            home: false,
            basic: true,
            custom: false,
            wifi: true,
            ethernet: false
          }
          vm.sensors = []
          vm.sensorSetup = vm.modelSelected.id
          break
        case 'custom':
          vm.modelSelected.name = 'senseBox manuelle Konfiguration'
          vm.models = {
            home: false,
            basic: false,
            custom: true,
            wifi: false,
            ethernet: false
          }
          vm.sensorSetup = ''
          break
        default:
          vm.modelSelected.name = false
          break
      }
      vm.invalidHardware = false
    })

    $scope.$watchCollection('editMarkerInput.box', function (newValue) {
      if (newValue && newValue.lat && newValue.lng) {
        if (angular.isUndefined(vm.markers.box)) {
          vm.markers.box = {}
        }
        vm.markers.box.lng = newValue.lng
        vm.markers.box.lat = newValue.lat
      }
    })

    $scope.$watchCollection('open.collapse2', function (newValue) {
      if (newValue) {
        vm.modelSelected.id = 'custom'
      }
    })

    $scope.$on('leafletDirectiveMarker.map_register.dragend', function (e, args) {
      vm.markers[args.modelName].lat = parseFloat(args.model.lat.toFixed(6))
      vm.markers[args.modelName].lng = parseFloat(args.model.lng.toFixed(6))
      vm.editMarkerInput = angular.copy(vm.markers)
    })

    $scope.$on('leafletDirectiveMap.map_register.click', function (e, args) {
      if (Object.keys(vm.markers).length === 0) {
        vm.markers.box = {
          'lat': parseFloat(args.leafletEvent.latlng.lat.toFixed(6)),
          'lng': parseFloat(args.leafletEvent.latlng.lng.toFixed(6)),
          'draggable': true
        }
      } else {
        vm.markers.box.lat = parseFloat(args.leafletEvent.latlng.lat.toFixed(6))
        vm.markers.box.lng = parseFloat(args.leafletEvent.latlng.lng.toFixed(6))
        vm.markers.box.draggable = true
      }
      vm.editMarkerInput = angular.copy(vm.markers)
    })

    $scope.$on('leafletDirectiveMap.map_register.locationfound', function (e, args) {
      if (Object.keys(vm.markers).length === 0) {
        vm.markers.box = {
          'lat': parseFloat(args.leafletEvent.latlng.lat.toFixed(6)),
          'lng': parseFloat(args.leafletEvent.latlng.lng.toFixed(6)),
          'draggable': true
        }
      } else {
        vm.markers.box.lat = parseFloat(args.leafletEvent.latlng.lat.toFixed(6))
        vm.markers.box.lng = parseFloat(args.leafletEvent.latlng.lng.toFixed(6))
        vm.markers.box.draggable = true
      }
      leafletData.getMap('map_register').then(function (map) {
        map.setView([args.leafletEvent.latlng.lat, args.leafletEvent.latlng.lng], 16)
      })
      vm.editMarkerInput = angular.copy(vm.markers)
    })

    $scope.$on('leafletDirectiveMap.map_register.locationerror', function (event) {
      // TODO set alert
      // console.log(event)
    })
  }
})()
