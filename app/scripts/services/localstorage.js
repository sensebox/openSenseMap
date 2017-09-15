(function () {
  'use strict';

  angular
    .module('app.services')
    .factory('LocalStorageService', LocalStorageService);

  LocalStorageService.$inject = ['$window'];

  function LocalStorageService ($window) {
    var service = {
      getValue: getValue,
      setValue: setValue
    };

    return service;

    ////

    function getValue (key) {
      return $window.localStorage[key];
    }

    function setValue(key, value) {
      $window.localStorage[key] = value;
    }
  }
})();
