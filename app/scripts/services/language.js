(function () {
  'use strict';

  angular
    .module('app.services')
    .factory('LanguageService', LanguageService);

  LanguageService.$inject = ['$translate', 'amMoment', 'tmhDynamicLocale'];

  function LanguageService ($translate, amMoment, tmhDynamicLocale) {
    return {
      change: change
    }

    function change (key) {
      $translate.use(key).then(function (key) {
        console.info('Sprache zu '+ key +' gewechselt.');
        amMoment.changeLocale(key.split('_')[0]);
        tmhDynamicLocale.set(key.split('_')[0]);
      }, function (key) {
        console.error('Fehler beim wechseln zur Sprache ' + key);
      });
    }
  }
})();
