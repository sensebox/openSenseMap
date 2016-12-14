(function () {
  'use strict'

  angular
    .module('openSenseMapApp')
    .controller('MapController', MapController)

  MapController.$inject = ['$scope', '$state', 'OpenSenseBoxes', 'leafletData', '$templateRequest', '$compile', 'OpenSenseMapData']

  function MapController ($scope, $state, OpenSenseBoxes, leafletData, $templateRequest, $compile, OpenSenseMapData) {
    var vm = this

    vm.markers = {}
    vm.filtered = {}
    vm.controls = {
      custom: []
    }
    vm.watchOptions = {
      markers: {
        type: null,
        individual: {
          type: null
        }
      }
    }
    vm.center = {
      lat: 51.04139389812637,
      lng: 10.21728515625,
      zoom: 6
    }

    vm.hoverlabel = {
      left: 0,
      top: 0,
      name: ''
    }

    vm.defaults = {
      minZoom: 2,
      maxZoom: 22,
      tileLayer: 'OPENSENSEMAP_MAPTILES_URL',
      tileLayerOptions: {
        subdomains: 'abc',
        detectRetina: true,
        reuseTiles: true,
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors | Tiles &copy; <a href="http://www.mapbox.com/" target="_blank">Mapbox</a>',
        maxZoom: 22
      },
      scrollWheelZoom: true,
      worldCopyJump: true
    }

    vm.layers = {
      baselayers: {
        mapbox: {
          name: 'Mapbox Streets',
          type: 'xyz',
          url: 'OPENSENSEMAP_MAPTILES_URL',
          layerOptions: {
            subdomains: ['a', 'b', 'c'],
            detectRetina: true,
            reuseTiles: true,
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors | Tiles &copy; <a href="http://www.mapbox.com/" target="_blank">Mapbox</a>',
            showOnSelector: false,
            maxZoom: 22
          }
        }
      },
      overlays: {
        activeMarker: {
          type: 'group',
          name: 'activeMarker',
          visible: true
        },
        inactiveMarker: {
          type: 'group',
          name: 'inactiveMarker',
          visible: true
        },
        oldMarker: {
          type: 'group',
          name: 'oldMarker',
          visible: true
        },
        // create inivisible markers for filtering/sorting because of a bug in angular-directive: need to keep the marker ordering in the array
        // https://github.com/tombatossals/angular-leaflet-directive/issues/512
        // https://github.com/tombatossals/angular-leaflet-directive/issues/1041
        hiddenMarker: {
          type: 'group',
          name: 'hiddenMarker',
          visible: false
        }
      }
    }

    vm.events = {
      map: {
        enable: ['click', 'load', 'zoomstart'],
        logic: 'broadcast'
      }
    }

    $scope.$on('leafletDirectiveMarker.map_main.mouseover', function (e, args) {
      var markerBounds = args.leafletEvent.target._icon.getBoundingClientRect()
      vm.hoverlabel = {
        left: markerBounds.left,
        top: markerBounds.top,
        name: args.leafletEvent.target.options.station.name
      }
    })

    $scope.$on('leafletDirectiveMarker.map_main.mouseout', function () {
      vm.hoverlabel = {
        left: 0,
        top: 0,
        name: ''
      }
    })

    $scope.$on('leafletDirectiveMarker.map_main.click', function (e, args) {
      // Args will contain the marker name and other relevant information
      $state.go('explore.map.boxdetails', { id: args.leafletEvent.target.options.station.id })
    })

    activate()

    //

    function activate () {
      fetchMarkers('', '')
    }

    // Icons for map markers: For active and inactive boxes
    var icons = {
      iconRed: {
        type: 'awesomeMarker',
        prefix: 'fa',
        icon: 'cube',
        markerColor: 'red'
      },
      iconGreen: {
        type: 'awesomeMarker',
        prefix: 'fa',
        icon: 'cube',
        markerColor: 'green'
      },
      iconDarkGreen: {
        type: 'awesomeMarker',
        prefix: 'fa',
        icon: 'cube',
        markerColor: 'darkgreen'
      },
      iconGray: {
        type: 'awesomeMarker',
        prefix: 'fa',
        icon: 'cube',
        markerColor: 'lightgray'
      }
    }

    var MARKER_STATE_OPTS = {
      'hidden': { layer: 'hiddenMarker', marker: icons.iconGray, opacity: 0, zIndexOffset: 300 },
      'old': { layer: 'oldMarker', marker: icons.iconGray, opacity: 0.5, zIndexOffset: 0 },
      'inactive': { layer: 'inactiveMarker', marker: icons.iconDarkGreen, opacity: 0.65, zIndexOffset: 100 },
      'active': { layer: 'activeMarker', marker: icons.iconGreen, opacity: 1, zIndexOffset: 200 }
    }

    var ONE_DAY = 1000 * 60 * 60 * 24
    var SEVEN_DAYS = ONE_DAY * 7
    var THIRTY_DAYS = ONE_DAY * 30

    function hiddenFunc (obj) {
      var markerOpts = MARKER_STATE_OPTS['hidden']
      var marker = {
        layer: markerOpts.layer,
        icon: markerOpts.marker,
        lng: obj.lng,
        lat: obj.lat,
        opacity: markerOpts.opacity,
        riseOnHover: true,
        station: {
          id: obj.station.id,
          name: obj.station.name,
          exposure: obj.station.exposure,
          grouptag: obj.station.grouptag,
          sensors: obj.station.sensors
        },
        zIndexOffset: markerOpts.zIndexOffset
      }
      return marker
    }

    var insertFunc = function (obj) {
      for (var key in vm.markers) {
        var box = vm.markers[key]
        if (box.station.id === obj.station.id) {
          box.layer = obj.layer
          box.icon = obj.icon
          box.opacity = obj.opacity
          return
        }
      }
    }

    function filterFunc (obj) {
      // decide wheter a box is active, inactive or "dead" by looking at the most recent last measurement's date
      var now = Date.now()
      var markerOpts = obj.sensors.reduceRight(function (previous, sensor, index) {
        if (sensor.lastMeasurement && sensor.lastMeasurement.createdAt) {
          var createdAt = Date.parse(sensor.lastMeasurement.createdAt)

          // if its 'old' try to determine if other sensors are newer..
          if (previous === 'old' && (now - createdAt < THIRTY_DAYS)) {
            previous = 'inactive'
          }

          // if its 'inactive' try to determine if other sensors are newer..
          if (previous === 'inactive' && (now - createdAt < SEVEN_DAYS)) {
            previous = 'active'
          }
        }

        if (index === 0) { // finally return the correct options
          return MARKER_STATE_OPTS[previous]
        } else { // else just return the state of the previous sensor
          return previous
        }
      }, 'old')

      var marker = {
        layer: markerOpts.layer,
        icon: markerOpts.marker,
        lng: obj.loc[0].geometry.coordinates[0],
        lat: obj.loc[0].geometry.coordinates[1],
        opacity: markerOpts.opacity,
        riseOnHover: true,
        station: {
          id: obj._id,
          name: obj.name,
          exposure: obj.exposure,
          grouptag: obj.grouptag,
          sensors: obj.sensors
        },
        zIndexOffset: markerOpts.zIndexOffset
      }
      return marker
    }

    function fetchMarkers (date, phenomenon, filteredOnly) {
      filteredOnly = filteredOnly || false

      vm.loading = true
      if (date !== '' && angular.isArray(date)) {
        date = date.join(',')
      }
      vm.markersFiltered = {}
      if (!filteredOnly) {
        vm.markers = {}
      } else {
        vm.filtered = {}
      }
      OpenSenseBoxes.query({ date: date, phenomenon: phenomenon }, function (response) {
        OpenSenseMapData.boxes = []
        vm.markersFiltered = {}
        if (!filteredOnly) {
          angular.extend(vm.markers, response.map(filterFunc))
          vm.markersFiltered = angular.copy(vm.markers)
        } else {
          // Hack for https://github.com/sensebox/openSenseMap/issues/112
          // 1. Copy all markers
          var markersTemp = []
          angular.extend(markersTemp, vm.markers)
          // 2. Hide all markers
          markersTemp = markersTemp.map(hiddenFunc)
          angular.extend(vm.markers, markersTemp)
          // 3. Classify filtered markers and insert them in $scope.markers
          var markersClassified = response.map(filterFunc)
          markersClassified.map(insertFunc)
          vm.markersFiltered = angular.copy(vm.markers)
        }
        vm.loading = false
        for (var key in vm.markers) {
          var box = vm.markers[key]
          OpenSenseMapData.boxes.push(box)
        }
      })
    }

    /*
      Custom legend control
    */
    leafletData.getMap('map_main').then(function (map) {
      var info = L.control({ position: 'bottomleft' })
      info.onAdd = function () {
        var _div = L.DomUtil.create('div', 'info sensebox-legend') // create a div with a class "info"
        vm._div = _div
        $templateRequest('views/explore2.map.legend.html').then(function (html) {
          var template = angular.element(html)
          var infoDiv = angular.element(_div)
          var infoContainer = angular.element(info._container)
          infoDiv.append(template)
          infoContainer.append(template)
          $compile(template)($scope)
        })
        return vm._div
      }
      map.addControl(info)
    })
  }
})()
