(function () {
  'use strict';

  angular
    .module('osemFilters')
    .filter('box', BoxFilter);

  BoxFilter.$inject = ['$q', '$timeout', 'filterFilter'];
  function BoxFilter ($q, $timeout, filterFilter) {
    return boxFilter;

    ////////////////

    function boxFilter (markers, expression) {
      var deferred = $q.defer();
      var promise = deferred.promise;

      $timeout(function () {
        var results = [];
        angular.forEach(markers, function (marker) {
          var a = filterFilter([marker], expression, function (actual, expected) {
            if (expected.toLowerCase() === '') {
              return true;
            }

            if (expected === undefined || actual === undefined) {
              return false;
            }

            if (actual.toLowerCase().includes(expected.toLowerCase())) {
              return true;
            }

            return false;
          });
          if (a.length > 0) {
            results.push(marker);
          }
        });
        deferred.resolve(results);
      });

      return promise;
    }
  }
})();
