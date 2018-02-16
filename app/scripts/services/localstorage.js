(function () {
  'use strict';

  angular
    .module('app.services')
    .factory('LocalStorageService', LocalStorageService);

  LocalStorageService.$inject = ['$window'];

  function LocalStorageService ($window) {
    var service = {
      getValue: getValue,
      setValue: setValue,
      removeValue: removeValue
    };

    return service;

    ////

    function getValue (key) {
      return $window.localStorage[key];
    }

    function setValue (key, value) {
      $window.localStorage[key] = value;
    }

    function removeValue (key) {
      $window.localStorage.removeItem(key);
    }
  }
})();
