angular.module('osemFilters', [])
.filter('phenomenons', function() {
  'use strict';
  return function(markers, input) {
    var searchText = input || "";
    var boxes = [];
    angular.forEach(markers, function(marker, key) {
      angular.forEach(marker.station.sensors, function(sensor, key) {
        var comp = sensor.title.toLowerCase().indexOf(searchText.toLowerCase()) !== -1;
        if(comp) boxes.push(marker);
      });
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
    var searchText = input || "";
    angular.forEach(markers, function(value, key) {
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
    angular.forEach(markers, function(marker, key) {
      angular.forEach(marker.station.sensors, function(sensor, key) {
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
    angular.forEach(markers, function(marker, key) {
      if(grouptags.indexOf(marker.station.grouptag) === -1) {
        grouptags.push(marker.station.grouptag);
      }
    });
    return grouptags;
  };
});