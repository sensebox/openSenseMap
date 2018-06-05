(function () {
  'use strict';

  angular
    .module('osemFilters')
    .filter('phenomenon', PhenomenonFilter);

  PhenomenonFilter.$inject = ['$q', '$timeout'];
  function PhenomenonFilter ($q, $timeout) {
    return phenomenonFilter;

    ////////////////

    function phenomenonFilter (markers, input) {
      var deferred = $q.defer();
      var promise = deferred.promise;
      var searchText = input || '';

      $timeout(function () {
        var results = [];
        angular.forEach(markers, function (marker) {
          var comp = marker.station.sensors.some(function (sensor) {
            if (searchText === '') {
              return true;
            }

            return sensor.hasOwnProperty('title') && angular.equals(sensor.title.toLowerCase(), searchText.toLowerCase());
          });
          if (comp) {
            results.push(marker);
          }
        });
        deferred.resolve(results);
      });

      return promise;
    }
  }
})();
