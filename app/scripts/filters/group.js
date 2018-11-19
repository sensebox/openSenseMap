(function () {
  'use strict';

  angular
    .module('osemFilters')
    .filter('uniqueGrouptags', GroupFilter);

  function GroupFilter () {
    return groupFilter;

    ////////////////

    function groupFilter (markers) {
      var grouptags = [];
      angular.forEach(markers, function (marker) {
        if (angular.isDefined(marker.station.grouptag) && marker.station.grouptag !== '') {
          if (grouptags.indexOf(marker.station.grouptag) === -1) {
            grouptags.push(marker.station.grouptag);
          }
        }
      });

      return grouptags;
    }
  }
})();
