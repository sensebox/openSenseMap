(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .controller('InterpolationController', InterpolationController);

  InterpolationController.$inject = ['$scope', '$timeout', 'moment', 'OpenSenseMapAPI', 'OpenSenseMapData', 'osemMapData'];

  function InterpolationController ($scope, $timeout, moment, OpenSenseMapAPI, OpenSenseMapData, osemMapData) {
    var vm = this;
    vm.markers = {};
    vm.calculating = false;
    vm.prom;
    vm.delay = 5000;
    vm.isPlaying = false;
    vm.legendTitle = '';
    vm.legendEntries = [];
    vm.settings = {
      idwPower : 3,
      cellWidth : 1,
      numTimeSteps : 1,
      exposure : 'outdoor',
      layerGroup: undefined,
      selectedPhenomenon : '',
      minIDWPower : 1,
      maxIDWPower : 9,
      minNumTimeSteps : 1,
      maxNumTimeSteps : 9,
      interpolationPickerStart: {
        date: moment().subtract(5, 'm').toDate(),
        open: false,
        buttonBar: {
          show: false
        },
        timepickerOptions: {
          readonlyInput: false,
          showMeridian: false,
          max: null,
          min: null
        },
        datepickerOptions: {
          minDate: null
        }
      },
      interpolationPickerEnd: {
        date: moment().toDate(),
        open: false,
        buttonBar: {
          show: false
        },
        timepickerOptions: {
          readonlyInput: false,
          showMeridian: false,
          max: null,
          min: null
        },
        datepickerOptions: {
          maxDate: null
        }
      }
    };
    vm.visible = false;
    vm.dates = [];
    vm.selectedTimeStep = Date.now();
    vm.slider = {
      options: {
        stepsArray: vm.dates,
        showTicks: true,
        hidePointerLabels: true,
        hideLimitLabels: true,
        onChange: function(id, value) {
          changeSlider(value);
        }
      }
    };
    vm.colors = '#A2F689,#B1E36F,#BCD05B,#C4BD4C,#C8AA44,#C99840'.split(',');
    vm.breaks = [];
    vm.idwLayers = [];
    vm.featureCollections = [];
    vm.alerts = [];

    vm.openCalendar = openCalendar;
    vm.changeIDWPower = changeIDWPower;
    vm.changeNumTimeSteps = changeNumTimeSteps;
    vm.selectExposure = selectExposure;
    vm.closeSidebar = closeSidebar;
    vm.closeAlert = closeAlert;
    vm.showRemoveInterpolation = showRemoveInterpolation;
    vm.removeInterpolation = removeInterpolation;
    vm.calculateInterpolation = calculateInterpolation;
    vm.refreshSlider = refreshSlider;
    vm.playInterpolation = playInterpolation;
    vm.stopInterpolation = stopInterpolation;

    activate();

    ////

    function activate () {
      vm.markers = OpenSenseMapData.getMarkers();
    }

    function changeSlider (value) {
      vm.selectedTimeStep = value;
      vm.map.removeLayer(vm.layer);
      for (var i = 0; i < vm.dates.length; i++) {
        if (vm.dates[i].toISOString() === value.toISOString()) {
          vm.layer = createGeoJsonLayer(vm.featureCollections[i], vm.breaks);
          vm.map.addLayer(vm.layer);
          break;
        }
      }
    }

    function openCalendar (e, picker) {
      e.preventDefault();
      e.stopPropagation();
      switch(picker) {
        case 'interpolationPickerStart':
          vm.settings.interpolationPickerStart.open = true;
          break;
        case 'interpolationPickerEnd':
          vm.settings.interpolationPickerEnd.open = true;
          vm.settings.interpolationPickerEnd.datepickerOptions.maxDate = moment().toDate();
          vm.settings.interpolationPickerEnd.datepickerOptions.minDate = vm.settings.interpolationPickerStart.date;
          vm.settings.interpolationPickerEnd.timepickerOptions.max = moment().toDate();
          vm.settings.interpolationPickerEnd.timepickerOptions.min = vm.settings.interpolationPickerStart.timepickerOptions.max;
          $timeout(function () {
            //TODO check jqLite
            // angular.element('#interpolationPickerEnd').parent()[0].children[1].style.right = "0px";
            // angular.element('#interpolationPickerEnd').parent()[0].children[1].style.left = "auto";
          });
          break;
      }
    }

    function closeAlert (index) {
      vm.alerts.splice(index, 1);
    }

    function changeIDWPower (number) {
      var newValue = vm.settings.idwPower + number;
      if (newValue >= vm.settings.minIDWPower && newValue <= vm.settings.maxIDWPower) {
        vm.settings.idwPower += number;
      }
    }

    function changeNumTimeSteps (number) {
      console.log(number);
      var newValue = vm.settings.numTimeSteps + number;
      if (newValue >= vm.settings.minNumTimeSteps && newValue <= vm.settings.maxNumTimeSteps) {
        vm.settings.numTimeSteps += number;
      }
    }

    function selectExposure (exposure) {
      vm.settings.exposure = exposure;
    }

    function clearInterpolation () {
      vm.isPlaying = false;
      vm.alerts.length = 0;
      vm.legendEntries.length = 0;
      vm.legendTitle = '';
      $timeout.cancel(vm.prom);
      vm.idwLayers = [];
      vm.featureCollections = [];
      vm.breaks = [];
      if (!angular.isUndefined(vm.map) && !angular.isUndefined(vm.layer)) {
        vm.map.removeLayer(vm.layer);
        delete vm.layer;
        vm.visible = false;
      }
    }

    function removeInterpolation () {
      clearInterpolation();
    }

    function showRemoveInterpolation () {
      if (!angular.isUndefined(vm.map) && !angular.isUndefined(vm.layer)) {
        return true;
      }
      return false;
    }

    function refreshSlider () {
      $timeout(function () {
        $scope.$broadcast('rzSliderForceRender');
      });
    }

    function calculateInterpolation () {
      clearInterpolation();
      vm.calculating = true;

      osemMapData.getMap('map_main').then(function (map) {
        if (!angular.isUndefined(vm.layer)) {
          vm.map.removeLayer(vm.layer);
        }
        vm.map = map;
        return map.getBounds().toBBoxString();
      }).then(function (bbox) {
        var data = {
          params: {
            'phenomenon': vm.settings.selectedPhenomenon,
            'from-date': moment(vm.settings.interpolationPickerStart.date).toISOString(),
            'to-date': moment(vm.settings.interpolationPickerEnd.date).toISOString(),
            'exposure': vm.settings.exposure,
            'cellWidth': vm.settings.cellWidth,
            'power': vm.settings.idwPower,
            'numClasses': 6,
            'bbox': bbox,
            'numTimeSteps': vm.settings.numTimeSteps
          }
        };
        OpenSenseMapAPI.idwInterpolation(data)
          .then(function (response) {
            if (response.code === 'NotFoundError') {
              return response;
            }

            vm.dates = [];
            response.data.timesteps.forEach(function (element, index) {
              vm.dates.push(new Date(element));
              vm.featureCollections.push({type: 'FeatureCollection', features: []});
            });

            vm.slider.value = vm.dates[0];
            vm.slider.options.stepsArray = vm.dates;
            vm.selectedTimeStep = vm.dates[0];

            vm.breaks = response.data.breaks;

            // Set legend title
            switch (vm.settings.selectedPhenomenon) {
              case 'Temperatur':
                vm.legendTitle = vm.settings.selectedPhenomenon + ' in °C';
                break;
              case 'rel. Luftfeuchte':
                vm.legendTitle = vm.settings.selectedPhenomenon + ' in %';
                break;
              case 'Luftdruck':
                vm.legendTitle = vm.settings.selectedPhenomenon + ' in hPa';
                break;
              case 'Beleuchtungsstärke':
                vm.legendTitle = vm.settings.selectedPhenomenon + ' in lx';
                break;
              case 'UV-Intensität':
                vm.legendTitle = vm.settings.selectedPhenomenon + ' in μW/cm²';
                break;
            }

            // Generate legend
            for (var j = 0; j < vm.breaks.length; j++) {
              var caption = '';
              if (j === vm.breaks.length-1) {
                caption = '> ' + vm.breaks[j].toFixed(2);
              } else {
                caption = vm.breaks[j].toFixed(2) +' - '+ vm.breaks[j+1].toFixed(2);
              }
              vm.legendEntries.push({
                caption: caption,
                style:{
                  'background': vm.colors[j]
                }
              });
            }

            response.data.featureCollection.features.map(function (feature) {
              for (var i = 0; i < feature.properties.idwValues.length; i++) {
                var newFeature = {};
                angular.copy(feature, newFeature);
                newFeature.properties.idwValues = [];
                var value = feature.properties.idwValues[i];
                newFeature.properties.idwValues.push(value);
                vm.featureCollections[i].features.push(newFeature);
              }
            });

            vm.layer = createGeoJsonLayer(vm.featureCollections[0], vm.breaks);
            vm.map.addLayer(vm.layer);

            if (vm.featureCollections.length > 1) {
              vm.visible = true;
            }
            refreshSlider();

            return;
          }, function(error) {
            return error;
          })
          .then(function (error) {
            if (angular.isUndefined(error)) {
              return;
            }

            switch (error.message) {
              case 'planned computation too expensive ((area in square kilometers / cellWidth) > 2500)':
                vm.alerts.push({msg: 'Der gewählte Kartenausschnitt ist zu groß!'});
                break;
              case 'Invalid time frame specified: to-date is in the future':
                vm.alerts.push({msg: 'Das gewählte Datum darf nicht in der Zukunft liegen!'});
                break;
              case 'no senseBoxes found':
                vm.alerts.push({msg: 'Es konnten keine senseBoxen für die Filtereinstellungen gefunden werden!'});
                break;
              case 'no measurements found':
                vm.alerts.push({msg: 'Es wurden keine Messungen für den angegebenen Zeitpunkt gefunden!'});
                break;
              default:
                vm.alerts.push({msg: 'Bei der Interpolation ist ein unbekannter Fehler aufgetreten! Bitte überprüfe die Filtereinstellungen.'});
                break;
            }
          })
          .finally(function () {
            vm.calculating = false;
          });
        });
    }

    function createGeoJsonLayer (featureCollection, breaks) {
      var idwLayer = L.geoJson(featureCollection, {
        style: function (feature) {
          var props = feature.properties;
          for (var key in props) {
            var z = props[key];
            if (!Number.isNaN(z)) {
              var fillColor = vm.colors[0];
              for (var i = 0; i < breaks.length; i++) {
                if (z >= breaks[i]) {
                  fillColor = vm.colors[i];
                } else {
                  break;
                }
              }
              return {
                weight: 0.1,
                fillOpacity: 0.6,
                fillColor: fillColor
              };
            }
            return {
              weight: 0,
              fillColor: 'red',
              fillOpacity: 1
            };
          }
        }
      });
      return idwLayer;
    }

    function playInterpolation () {
      vm.isPlaying = true;
      vm.prom = $timeout(vm.playInterpolation, vm.delay);
      var value = 0;
      var nextIndex = vm.dates.indexOf(vm.selectedTimeStep)+1;
      if (angular.isUndefined(vm.dates[nextIndex])) {
        value = vm.dates[0];
      } else {
        value = vm.dates[nextIndex];
      }
      vm.selectedTimeStep = value;
      vm.slider.value = value;
      changeSlider(value);
    }

    function stopInterpolation () {
      vm.isPlaying = false;
      $timeout.cancel(vm.prom);
    }

    function closeSidebar () {
      if (!angular.isUndefined(vm.map) && !angular.isUndefined(vm.layer)) {
        clearInterpolation();
      }
    }

    ////

    // watch min and max dates to calculate difference
    var unwatchMinMaxValues = $scope.$watch(function() {
      return [vm.settings.interpolationPickerStart, vm.settings.interpolationPickerEnd];
    }, function() {
      // min max dates
      vm.settings.interpolationPickerStart.datepickerOptions.maxDate = vm.settings.interpolationPickerEnd.date;
      vm.settings.interpolationPickerEnd.datepickerOptions.minDate = vm.settings.interpolationPickerStart.date;

      // min max times
      vm.settings.interpolationPickerStart.timepickerOptions.max = vm.settings.interpolationPickerEnd.date;
      vm.settings.interpolationPickerEnd.timepickerOptions.min = vm.settings.interpolationPickerStart.date;
    }, true);

    // destroy watcher
    $scope.$on('$destroy', function() {
      unwatchMinMaxValues();
      clearInterpolation();
    });
  }
})();
