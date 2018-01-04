(function () {
  'use strict';

  angular
    .module('app.services')
    .factory('LanguageService', LanguageService);

  LanguageService.$inject = ['$q', '$translate', 'amMoment', 'tmhDynamicLocale'];

  function LanguageService ($q, $translate, amMoment, tmhDynamicLocale) {
    var language = '';

    return {
      change: change,
      getLanguage: getLanguage,
      clientLocale: clientLocale
    };

    function getLanguage () {
      return language;
    }

    function change (key) {
      var deferred = $q.defer();
      $translate.use(key).then(function (key) {
        console.info('Sprache zu '+ key +' gewechselt.');
        amMoment.changeLocale(key.split('_')[0]);
        tmhDynamicLocale.set(key.split('_')[0]);
        language = key.split('_')[0];
        deferred.resolve('Sprache zu ' + key + 'gewechselt');
      }, function (key) {
        amMoment.changeLocale(key.split('_')[0]);
        console.error('Fehler beim wechseln zur Sprache ' + key);
        deferred.reject('Fehler beim wechseln zur Sprache: ' + key);
      });

      return deferred.promise;
    }

    function clientLocale ()
    {
      return $translate.resolveClientLocale();
    }
  }
})();
