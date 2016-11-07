'use strict';

/**
 * @ngdoc service
 * @name openSenseMapApp.SensorIcons
 * @description Defines the icons available for sensors
 * Factory in the openSenseMapApp.
 */
angular.module('openSenseMapApp')
  .factory('SensorIcons', function () {
    var icons = [
      { name: 'osem-moisture' },
      { name: 'osem-temperature-celsius'},
      { name: 'osem-temperature-fahrenheit'},
      { name: 'osem-thermometer'},
      { name: 'osem-windspeed'},
      { name: 'osem-sprinkles'},
      { name: 'osem-brightness'},
      { name: 'osem-barometer'},
      { name: 'osem-humidity'},
      { name: 'osem-not-available'},
      { name: 'osem-gauge'},
      { name: 'osem-umberella'},
      { name: 'osem-clock'},
      { name: 'osem-shock'},
      { name: 'osem-fire'},
      { name: 'osem-volume-up'},
      { name: 'osem-cloud'},
      { name: 'osem-dashboard'}
    ];
    return icons;
  });
