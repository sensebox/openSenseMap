(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .factory('SensorIcons', SensorIcons);

  function SensorIcons () {
    var icons = [
      { name: 'osem-moisture' },
      { name: 'osem-temperature-celsius' },
      { name: 'osem-temperature-fahrenheit' },
      { name: 'osem-thermometer' },
      { name: 'osem-windspeed' },
      { name: 'osem-sprinkles' },
      { name: 'osem-brightness' },
      { name: 'osem-barometer' },
      { name: 'osem-humidity' },
      { name: 'osem-not-available' },
      { name: 'osem-gauge' },
      { name: 'osem-umbrella' },
      { name: 'osem-clock' },
      { name: 'osem-shock' },
      { name: 'osem-fire' },
      { name: 'osem-volume-up' },
      { name: 'osem-cloud' },
      { name: 'osem-dashboard' },
      { name: 'osem-particulate-matter' },
      { name: 'osem-signal' },
      { name: 'osem-microphone' },
      { name: 'osem-wifi' },
      { name: 'osem-battery' },
      { name: 'osem-radioactive' },
      { name: 'osem-co2' }
    ];

    return icons;
  }
})();
