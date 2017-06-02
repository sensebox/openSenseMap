angular.module('osemFilters', [])
.filter('phenomenons', function() {
  'use strict';
  return function(markers, input) {
    var searchText = input || '';
    var boxes = [];
    angular.forEach(markers, function(marker) {
      var comp = marker.station.sensors.some(function(sensor){
        return sensor.hasOwnProperty('title') && angular.equals(sensor.title.toLowerCase(), searchText.toLowerCase());
      });
      if(comp) {
        boxes.push(marker);
      }
    });
    return boxes;
  };
})

/*
  Filters the marker array by name
*/
.filter('marker', function() {
  'use strict';
  return function(markers, input) {
    var searchText = input || '';
    angular.forEach(markers, function(value) {
      var comp = value.station.name.toLowerCase().indexOf(searchText.toLowerCase()) !== -1;
      return comp && value;
    });
  };
})

/*
  Returns a list of unique phenomenons/sensor types from the markers array
*/
.filter('uniquePhenomenons', function() {
  'use strict';
  return function(markers) {
    var phenoms = [];
    angular.forEach(markers, function(marker) {
      angular.forEach(marker.station.sensors, function(sensor) {
        if(phenoms.indexOf(sensor.title) === -1) {
          phenoms.push(sensor.title);
        }
      });
    });
    return phenoms;
  };
})

/*
  Returns a list of unique group tags from the markers array
*/
.filter('uniqueGrouptags', function() {
  'use strict';
  return function(markers) {
    var grouptags = [];
    angular.forEach(markers, function(marker) {
      if (angular.isDefined(marker.station.grouptag) && marker.station.grouptag !== '') {
        if(grouptags.indexOf(marker.station.grouptag) === -1) {
          grouptags.push(marker.station.grouptag);
        }
      }
    });
    return grouptags;
  };
})

.filter('box', ['filterFilter', function(filterFilter) {
  'use strict';
  return function(markers, expression) {
    var results = [];
    angular.forEach(markers, function(marker) {
      var a = filterFilter([marker], expression);
      if(a.length>0) {
        results.push(marker);
      }
    });
    return results;
  };
}]);
