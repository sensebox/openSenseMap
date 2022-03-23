(function () {
  'use strict';

  angular
    .module('app.services')
    .factory('DirectusService', DirectusService);

  DirectusService.$inject = ['$http', '$q', 'app'];

  function DirectusService ($http, $q, app) {
    var service = {
      getAnnouncement: getAnnouncement
    };

    return service;

    ////

    function success (response) {
      return response.data;
    }

    function failed (error) {
      return $q.reject(error.data);
    }

    function getAnnouncement () {
      return $http
        .get(app.CMS_URL + '/items/announcement')
        .then(success)
        .catch(failed);
    }
  }
})();
