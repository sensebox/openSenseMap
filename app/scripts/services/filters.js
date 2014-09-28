angular.module('osemFilters', []).filter('filterPhenomenons', function() {
  return function(markers, searchText) {
    return markers.filter(function(marker) {
      if(searchText === '') {
          return true;
      } else {
        for(var i in marker.sensors){
          if(marker.sensors[i].title.toLowerCase().indexOf(searchText.toLowerCase()) != -1){
              return true;
          }
        }
        return false;
      }
    });
  };
});