(function () {
  'use strict';

  angular
    .module('osemFilters')
    .filter('uniquePhenomenons', UniquePhenomenons);

  function UniquePhenomenons () {
    return uniquePhenomenons;

    ////////////////

    function uniquePhenomenons (markers) {
      var phenoms = [];
      angular.forEach(markers, function (marker) {
        angular.forEach(marker.station.sensors, function (sensor) {
          if (phenoms.indexOf(sensor.title) === -1) {
            phenoms.push(sensor.title);
          }
        });
      });

      return phenoms;
    }
  }
})();
