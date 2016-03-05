angular.module('osemFilters', [])
.filter('filterPhenomenons', function() {
  'use strict';
  return function(markers, filterOption, searchText) {
    return markers.filter(function(marker) {

      if(searchText === '') {
          return true;
      } else {

        if (filterOption == 'Phänomen') {
          for(var i in marker.sensors){
            if(marker.sensors[i].title.toLowerCase().indexOf(searchText.toLowerCase()) != -1){
                return true;
            }
          }
        } else if(filterOption == 'Name') {
          if (marker.name.toLowerCase().indexOf(searchText.toLowerCase()) != -1) {
            return true;
          };
        };

        return false;
      }
    });
  };
})
.filter('marker', function() {
  'use strict';
  return function(markers, input) {
    var searchText = input || "";
    //console.log(markers);
    console.log(input);
    angular.forEach(markers, function (value, key) {
      var comp = value.station.name.toLowerCase().indexOf(searchText.toLowerCase()) !== -1;
      //console.log(comp);
      return comp && value;
    });
  };
});