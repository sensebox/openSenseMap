(function () {
  'use strict'

  angular
    .module('openSenseMapApp')
    .controller('InterpolationController', InterpolationController)

  InterpolationController.$inject = ['$http', 'OpenSenseMapData', 'OpenSenseBoxAPI', 'leafletData', 'moment']

  function InterpolationController ($http, OpenSenseMapData, OpenSenseBoxAPI, leafletData, moment) {
    var vm = this
    vm.map
    vm.calculating = false
    vm.legendTitle = ''
    vm.legendEntries = []
    vm.alerts = []
    vm.idwPower = 3
    vm.cellWidth = 1
    vm.exposure = 'outdoor'
    vm.layerGroup
    vm.selectedPhenomenon = ''
    vm.boxes = OpenSenseMapData.boxes

    vm.interpolationPicker = {
      date: moment().toDate(),
      open: false,
      buttonBar: {
        show: false
      },
      timepickerOptions: {
        readonlyInput: false,
        showMeridian: false,
        max: moment().toDate()
      }
    }

    vm.closeAlert = closeAlert
    vm.calculateInterpolation = calculateInterpolation
    vm.showRemoveInterpolation = showRemoveInterpolation
    vm.removeInterpolation = removeInterpolation
    vm.openCalendar = openCalendar
    vm.selectExposure = selectExposure
    vm.closeSidebar = closeSidebar
    vm.getBoxes = getBoxes

    activate()

    //

    function activate () {
      L.LayerGroup.include({
        customGetLayer: function (id) {
          for (var i in this._layers) {
            if (this._layers[i].id === id) {
              return this._layers[i]
            }
          }
        }
      })

      leafletData.getMap('map_main').then(function (map) {
        vm.map = map
        map.eachLayer(function (layer) {
          if (layer instanceof L.LayerGroup) {
            var layerGroup = layer.customGetLayer('interpolation')
            if (angular.isDefined(layerGroup)) {
              vm.layerGroup = layerGroup
            }
          }
        })
      })
    }

    function closeAlert (index) {
      vm.alerts.splice(index, 1)
    }

    function getBoxes () {
      return OpenSenseMapData.boxes
    }

    function calculateInterpolation () {
      vm.calculating = true
      vm.alerts.length = 0
      vm.legendEntries.length = 0
      vm.legendTitle = ''

      leafletData.getMap('map_main').then(function (map) {
        if (angular.isDefined(vm.layerGroup)) {
          vm.layerGroup.clearLayers()
        }
        vm.map = map
        return map.getBounds().toBBoxString()
      }).then(function (bbox) {
        $http.get(OpenSenseBoxAPI.url + '/statistics/idw', {
          params: {
            'phenomenon': vm.selectedPhenomenon,
            'from-date': moment(vm.interpolationPicker.date).subtract(5, 'm').toISOString(),
            'to-date': moment(vm.interpolationPicker.date).toISOString(),
            'exposure': vm.exposure,
            'cellWidth': vm.cellWidth,
            'power': vm.idwPower,
            'numClasses': 6,
            'bbox': bbox,
            'numTimeSteps': 1
          }
        })
        .then(function (response) {
          var colors = '#A2F689,#B1E36F,#BCD05B,#C4BD4C,#C8AA44,#C99840'.split(',')
          if (response.data.code === 'NotFoundError') {
            return response
          }

          var breaks = response.data.data.breaks

          // Set legend title
          switch (vm.selectedPhenomenon) {
            case 'Temperatur':
              vm.legendTitle = vm.selectedPhenomenon + ' in °C'
              break
            case 'rel. Luftfeuchte':
              vm.legendTitle = vm.selectedPhenomenon + ' in %'
              break
            case 'Luftdruck':
              vm.legendTitle = vm.selectedPhenomenon + ' in hPa'
              break
            case 'Beleuchtungsstärke':
              vm.legendTitle = vm.selectedPhenomenon + ' in lx'
              break
            case 'UV-Intensität':
              vm.legendTitle = vm.selectedPhenomenon + ' in μW/cm²'
              break
          }

          // Generate legend
          for (var j = 0; j < breaks.length; j++) {
            var caption = ''
            if (j === breaks.length - 1) {
              caption = '> ' + breaks[j].toFixed(2)
            } else {
              caption = breaks[j].toFixed(2) + ' - ' + breaks[j + 1].toFixed(2)
            }
            vm.legendEntries.push({
              caption: caption,
              style: {
                'background': colors[j]
              }
            })
          }

          // Create IDW Layer
          var idwLayer = L.geoJson(response.data.data.featureCollection, {
            style: function (feature) {
              var props = feature.properties
              for (var key in props) {
                var z = props[key]
                if (!Number.isNaN(z)) {
                  var fillColor = colors[0]
                  for (var i = 0; i < breaks.length; i++) {
                    if (z >= breaks[i]) {
                      fillColor = colors[i]
                    } else {
                      break
                    }
                  }
                  return {
                    weight: 0.1,
                    fillOpacity: 0.6,
                    fillColor: fillColor
                  }
                }
                return {
                  weight: 0,
                  fillColor: 'red',
                  fillOpacity: 1
                }
              }
            }
          })
          vm.layerGroup = L.layerGroup([idwLayer])
          vm.layerGroup.eachLayer(function (layer) {
            layer.id = 'interpolation'
          })
          vm.map.addLayer(vm.layerGroup)
          return
        }, function (error) {
          return error
        })
        .then(function (error) {
          if (angular.isUndefined(error)) {
            return
          }

          switch (error.data.message) {
            case 'planned computation too expensive ((area in square kilometers / cellWidth) > 2500)':
              vm.alerts.push({msg: 'Der gewählte Kartenausschnitt ist zu groß!'})
              break
            case 'Invalid time frame specified: to-date is in the future':
              vm.alerts.push({msg: 'Das gewählte Datum darf nicht in der Zukunft liegen!'})
              break
            case 'no senseBoxes found':
              vm.alerts.push({msg: 'Es konnten keine senseBoxen für die Filtereinstellungen gefunden werden!'})
              break
            case 'no measurements found':
              vm.alerts.push({msg: 'Es wurden keine Messungen für den angegebenen Zeitpunkt gefunden!'})
              break
            default:
              vm.alerts.push({msg: 'Bei der Interpolation ist ein unbekannter Fehler aufgetreten! Bitte überprüfe die Filtereinstellungen.'})
              break
          }
        })
        .finally(function () {
          vm.calculating = false
        })
      })
    }

    function removeInterpolation () {
      if (angular.isDefined(vm.map) && angular.isDefined(vm.layerGroup)) {
        vm.layerGroup.clearLayers()
      }
    }

    function showRemoveInterpolation () {
      if (angular.isDefined(vm.map) && angular.isDefined(vm.layerGroup)) {
        if (vm.layerGroup.toGeoJSON().features.length > 0) {
          return true
        }
      }
      return false
    }

    function openCalendar (e, picker) {
      e.preventDefault()
      e.stopPropagation()
      vm.interpolationPicker.open = true
      vm.interpolationPicker.timepickerOptions.max = moment().toDate()
    };

    function selectExposure (exposure) {
      vm.exposure = exposure
    }

    function closeSidebar () {
      if (angular.isDefined(vm.map) && angular.isDefined(vm.layerGroup)) {
        vm.layerGroup.clearLayers()
      }
    }
  }
})()
