'use strict';

angular.module('openSenseMapApp')
.controller('InterpolationCtrl',
	["$scope", "$stateParams", "$http", "OpenSenseBoxAPI", "leafletData", "$timeout", "moment", function($scope, $stateParams, $http, OpenSenseBoxAPI, leafletData, $timeout, moment){

    $scope.calculating = false;
    $scope.interpolationPicker = {
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
    };

    $scope.legendTitle = '';
    $scope.legendEntries = [];

    $scope.alerts = [];
    $scope.closeAlert = function(index) {
      $scope.alerts.splice(index, 1);
    };
    $scope.idwPower = 3;
    $scope.cellWidth = 1;
    $scope.exposure = "outdoor";
    $scope.idwLayer;
    $scope.selectedPhenomenon = "";
    $scope.map;
    $scope.calculateInterpolation = function () {
      $scope.calculating = true;
      $scope.alerts.length = 0;
      $scope.legendEntries.length = 0;
      $scope.legendTitle = '';

      leafletData.getMap('map_main').then(function (map) {
        if (!angular.isUndefined($scope.idwLayer)) {
          map.removeLayer($scope.idwLayer);
        }
        $scope.map = map;
        return map.getBounds().toBBoxString();
      }).then(function (bbox) {
        $http.get(OpenSenseBoxAPI.url+'/statistics/idw', {
          params: {
            'phenomenon': $scope.selectedPhenomenon,
            'from-date': moment($scope.interpolationPicker.date).subtract(1, 'm').toISOString(),
            'to-date': moment($scope.interpolationPicker.date).toISOString(),
            'exposure': $scope.exposure,
            'cellWidth': $scope.cellWidth,
            'power': $scope.idwPower,
            'numClasses': 6,
            'bbox': bbox,
            'numTimeSteps': 1
          }
        })
        .then(function (response) {
          var colors = "#A2F689,#B1E36F,#BCD05B,#C4BD4C,#C8AA44,#C99840".split(",");
          if (response.data.code === 'NotFoundError') {
            return response;
          }

          var breaks = response.data.data.breaks;

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

          // Create IDW Layer
          $scope.idwLayer = L.geoJson(response.data.data.featureCollection, {
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
          $scope.map.addLayer($scope.idwLayer);
        })
        .then(function (error) {
          switch (error.data.message) {
            case "computation too expensive ((area in square kilometers / cellWidth) > 2500)":
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
              $scope.alerts.push({msg: 'Bei der Interpolation ist ein unbekannter Fehler aufgetreten! Bitte überprüfe'});
              break;
          }
        })
        .finally(function () {
          $scope.calculating = false;
        });
      });
    };

    $scope.openCalendar = function(e, picker) {
      e.preventDefault();
      e.stopPropagation();
      $scope.interpolationPicker.open = true;
      $scope.interpolationPicker.timepickerOptions.max = moment().toDate();
    };

    $scope.selectExposure = function (exposure) {
      $scope.exposure = exposure;
    };

    $scope.closeSidebar = function () {
      if (!angular.isUndefined($scope.map) && !angular.isUndefined($scope.idwLayer)) {
        $scope.map.removeLayer($scope.idwLayer);
      }
    }
}]);
