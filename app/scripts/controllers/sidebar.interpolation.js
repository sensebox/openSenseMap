'use strict';

angular.module('openSenseMapApp')
.controller('InterpolationCtrl',
	["$scope", "$stateParams", "$http", "OpenSenseBoxAPI", "leafletData", "$timeout", "moment", function($scope, $stateParams, $http, OpenSenseBoxAPI, leafletData, $timeout, moment){

    $scope.calculating = false;
    $scope.interpolationPickerStart = {
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
    };
    $scope.interpolationPickerEnd = {
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
    };

    $scope.visible = false;
    var dates = [];
    $scope.selectedTimeStep = Date.now();
    $scope.slider = {
      options: {
        stepsArray: dates,
        showTicks: true,
        hidePointerLabels: true,
        hideLimitLabels: true,
        onChange: function(id, value) {
          changeSlider(value);
        }
      }
    }

    var changeSlider = function (value) {
      $scope.selectedTimeStep = value;
      $scope.map.removeLayer($scope.layer);
      for (var i = 0; i < dates.length; i++) {
        if (dates[i].toISOString() === value.toISOString()) {
          $scope.layer = createGeoJsonLayer(featureCollections[i], breaks);
          $scope.map.addLayer($scope.layer);
          break;
        }
      }
    }

    $scope.refreshSlider = function () {
      $timeout(function () {
        $scope.$broadcast('rzSliderForceRender');
      });
    };

    $scope.legendTitle = '';
    $scope.legendEntries = [];

    $scope.alerts = [];
    $scope.closeAlert = function(index) {
      $scope.alerts.splice(index, 1);
    };

    $scope.idwPower = 3;
    $scope.cellWidth = 1;
    $scope.numTimeSteps = 1;
    $scope.exposure = "outdoor";
    $scope.layerGroup;
    $scope.selectedPhenomenon = "";
    $scope.map;

    $scope.minIDWPower = 1;
    $scope.maxIDWPower = 9;

    $scope.changeIDWPower = function(number) {
      var newValue = $scope.idwPower + number;
      if (newValue >= $scope.minIDWPower && newValue <= $scope.maxIDWPower) {
        $scope.idwPower += number;
      }
    }

    $scope.minNumTimeSteps = 1;
    $scope.maxNumTimeSteps = 9;

    $scope.changeNumTimeSteps = function(number) {
      var newValue = $scope.numTimeSteps + number;
      if (newValue >= $scope.minNumTimeSteps && newValue <= $scope.maxNumTimeSteps) {
        $scope.numTimeSteps += number;
      }
    }

    $scope.layer;
    var colors = "#A2F689,#B1E36F,#BCD05B,#C4BD4C,#C8AA44,#C99840".split(",");
    var breaks = [];
    var idwLayers = [];
    var featureCollections = [];
    $scope.calculateInterpolation = function () {
      clearInterpolation();
      $scope.calculating = true;

      leafletData.getMap('map_main').then(function (map) {
        if (!angular.isUndefined($scope.layer)) {
          $scope.map.removeLayer($scope.layer);
        }
        $scope.map = map;
        return map.getBounds().toBBoxString();
      }).then(function (bbox) {
        $http.get(OpenSenseBoxAPI.url+'/statistics/idw', {
          params: {
            'phenomenon': $scope.selectedPhenomenon,
            'from-date': moment($scope.interpolationPickerStart.date).toISOString(),
            'to-date': moment($scope.interpolationPickerEnd.date).toISOString(),
            'exposure': $scope.exposure,
            'cellWidth': $scope.cellWidth,
            'power': $scope.idwPower,
            'numClasses': 6,
            'bbox': bbox,
            'numTimeSteps': $scope.numTimeSteps
          }
        })
        .then(function (response) {
          if (response.data.code === 'NotFoundError') {
            return response;
          }

          dates = [];
          response.data.data.timesteps.forEach(function (element, index) {
            dates.push(new Date(element));
            featureCollections.push({type: "FeatureCollection", features: []});
          });

          $scope.slider.value = dates[0];
          $scope.slider.options.stepsArray = dates;
          $scope.selectedTimeStep = dates[0];

          breaks = response.data.data.breaks;

          // Set legend title
          switch ($scope.selectedPhenomenon) {
            case 'Temperatur':
              $scope.legendTitle = $scope.selectedPhenomenon + " in °C"
              break;
            case 'rel. Luftfeuchte':
              $scope.legendTitle = $scope.selectedPhenomenon + " in %"
              break;
            case 'Luftdruck':
              $scope.legendTitle = $scope.selectedPhenomenon + " in hPa"
              break;
            case 'Beleuchtungsstärke':
              $scope.legendTitle = $scope.selectedPhenomenon + " in lx"
              break;
            case 'UV-Intensität':
              $scope.legendTitle = $scope.selectedPhenomenon + " in μW/cm²"
              break;
          }

          // Generate legend
          for (var j = 0; j < breaks.length; j++) {
            var caption = "";
            if (j === breaks.length-1) {
              caption = "> " + breaks[j].toFixed(2);
            } else {
              caption = breaks[j].toFixed(2) +' - '+ breaks[j+1].toFixed(2);
            }
            $scope.legendEntries.push({
              caption: caption,
              style:{
                'background': colors[j]
              }
            });
          }

          response.data.data.featureCollection.features.map(function (feature) {
            for (var i = 0; i < feature.properties.idwValues.length; i++) {
              var newFeature = {};
              angular.copy(feature, newFeature);
              newFeature.properties.idwValues = [];
              var value = feature.properties.idwValues[i];
              newFeature.properties.idwValues.push(value);
              featureCollections[i].features.push(newFeature);
            }
          });

          $scope.layer = createGeoJsonLayer(featureCollections[0], breaks);
          $scope.map.addLayer($scope.layer);

          if (featureCollections.length > 1) {
            $scope.visible = true;
          }
          $scope.refreshSlider();

          return;
        }, function(error) {
          return error;
        })
        .then(function (error) {
          if (angular.isUndefined(error)) {
            return;
          }

          switch (error.data.message) {
            case "planned computation too expensive ((area in square kilometers / cellWidth) > 2500)":
              $scope.alerts.push({msg: 'Der gewählte Kartenausschnitt ist zu groß!'});
              break;
            case "Invalid time frame specified: to-date is in the future":
              $scope.alerts.push({msg: 'Das gewählte Datum darf nicht in der Zukunft liegen!'});
              break;
            case "no senseBoxes found":
              $scope.alerts.push({msg: 'Es konnten keine senseBoxen für die Filtereinstellungen gefunden werden!'});
              break;
            case "no measurements found":
              $scope.alerts.push({msg: 'Es wurden keine Messungen für den angegebenen Zeitpunkt gefunden!'});
              break;
            default:
              $scope.alerts.push({msg: 'Bei der Interpolation ist ein unbekannter Fehler aufgetreten! Bitte überprüfe die Filtereinstellungen.'});
              break;
          }
        })
        .finally(function () {
          $scope.calculating = false;
        });
      });
    };

    $scope.prom;
    var delay = 5000;
    $scope.isPlaying = false;
    $scope.playInterpolation = function () {
      $scope.isPlaying = true;
      $scope.prom = $timeout($scope.playInterpolation, delay);
      var value = 0;
      var nextIndex = dates.indexOf($scope.selectedTimeStep)+1;
      if (angular.isUndefined(dates[nextIndex])) {
        value = dates[0];
      } else {
        value = dates[nextIndex];
      }
      $scope.selectedTimeStep = value;
      $scope.slider.value = value;
      changeSlider(value);
    }

    $scope.stopInterpolation = function () {
      $scope.isPlaying = false;
      $timeout.cancel($scope.prom);
    }

    function createGeoJsonLayer (featureCollection, breaks) {
      var idwLayer = L.geoJson(featureCollection, {
        style: function (feature) {
          var props = feature.properties;
          for (var key in props) {
            var z = props[key];
            if (!Number.isNaN(z)) {
              var fillColor = colors[0];
              for (var i = 0; i < breaks.length; i++) {
                if (z >= breaks[i]) {
                  fillColor = colors[i];
                } else {
                  break;
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
              fillColor: "red",
              fillOpacity: 1
            };
          }
        }
      });
      return idwLayer;
    }

    function clearInterpolation () {
      $scope.isPlaying = false;
      $scope.alerts.length = 0;
      $scope.legendEntries.length = 0;
      $scope.legendTitle = '';
      $timeout.cancel($scope.prom);
      idwLayers = [];
      featureCollections = [];
      breaks = [];
      if (!angular.isUndefined($scope.map) && !angular.isUndefined($scope.layer)) {
        $scope.map.removeLayer($scope.layer);
        delete $scope.layer;
        $scope.visible = false;
      }
    }

    $scope.removeInterpolation = function () {
      clearInterpolation();
    }

    $scope.showRemoveInterpolation = function () {
      if (!angular.isUndefined($scope.map) && !angular.isUndefined($scope.layer)) {
        return true;
      }
      return false;
    }

    $scope.openCalendar = function(e, picker) {
      e.preventDefault();
      e.stopPropagation();
      switch(picker) {
        case 'interpolationPickerStart':
          $scope.interpolationPickerStart.open = true;
          // $scope.interpolationPickerStart.timepickerOptions.max = moment($scope.interpolationPickerEnd.date).toISOString();
          break;
        case 'interpolationPickerEnd':
          $scope.interpolationPickerEnd.open = true;
          $scope.interpolationPickerEnd.datepickerOptions.maxDate = moment().toDate();
          $scope.interpolationPickerEnd.datepickerOptions.minDate = $scope.interpolationPickerStart.date;
          $scope.interpolationPickerEnd.timepickerOptions.max = moment().toDate();
          $scope.interpolationPickerEnd.timepickerOptions.min = $scope.interpolationPickerStart.timepickerOptions.max;
          $timeout(function () {
            angular.element('#interpolationPickerEnd').parent()[0].children[1].style.right = "0px";
            angular.element('#interpolationPickerEnd').parent()[0].children[1].style.left = "auto";
          });
          break;
      }
    }

    // watch min and max dates to calculate difference
    var unwatchMinMaxValues = $scope.$watch(function() {
      return [$scope.interpolationPickerStart, $scope.interpolationPickerEnd];
    }, function() {
      // min max dates
      $scope.interpolationPickerStart.datepickerOptions.maxDate = $scope.interpolationPickerEnd.date;
      $scope.interpolationPickerEnd.datepickerOptions.minDate = $scope.interpolationPickerStart.date;

      // min max times
      $scope.interpolationPickerStart.timepickerOptions.max = $scope.interpolationPickerEnd.date;
      $scope.interpolationPickerEnd.timepickerOptions.min = $scope.interpolationPickerStart.date;
    }, true);

    // destroy watcher
    $scope.$on('$destroy', function() {
      unwatchMinMaxValues();
      clearInterpolation();
    });

    $scope.selectExposure = function (exposure) {
      $scope.exposure = exposure;
    };

    $scope.closeSidebar = function () {
      if (!angular.isUndefined($scope.map) && !angular.isUndefined($scope.layer)) {
        clearInterpolation()
      }
    }
}]);
