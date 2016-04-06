// placeholder marker 
// create inivisible markers for filtering/sorting because of a bug in angular-directive: need to keep the marker ordering in the array
// https://github.com/tombatossals/angular-leaflet-directive/issues/512
// https://github.com/tombatossals/angular-leaflet-directive/issues/1041
var trash = {
  layer: 'temporary',
  icon: {},
  lng: 2000,
  lat: 2000,
  opacity: 0,
  riseOnHover: false,
  station: {
    id: '',
    name: '',
    exposure: '',
    grouptag: '',
    sensors: []
  }
};

angular.module('osemFilters', [])
.filter('phenomenons', function() {
  'use strict';
  return function(markers, input) {
    var searchText = input || "";
    var boxes = [];
    angular.forEach(markers, function(marker, key) {
      var comp = marker.station.sensors.some(function(sensor, index, array){
        return sensor.hasOwnProperty('title') && sensor.title.toLowerCase().indexOf(searchText.toLowerCase()) !== -1;
      });
      if(comp) {
        boxes.push(marker);
      } else {
        boxes.push(angular.copy(trash));
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
})

.filter('box', [ 'filterFilter', function(filterFilter) {
  'use strict';
  return function(markers, expression) {
    var results = [];
    angular.forEach(markers, function(marker, key) {
      var a = filterFilter([marker], expression);
      console.log("hello", a);
      if(a.length>0) {
        results.push(marker);
      } else {
        results.push(angular.copy(trash));
      }
    });
    return results;
  };
}]);