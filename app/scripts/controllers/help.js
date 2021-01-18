(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .controller('HelpController', HelpController);

  HelpController.$inject = ['LanguageService', '$sce'];

  function HelpController (LanguageService, $sce) {
    var vm = this;
    var language = LanguageService.getLanguage() === 'de' ? '' : 'en.';
    vm.iframeSrc = $sce.trustAsResourceUrl('https://' + language + 'docs.sensebox.de/opensensemap-faq/');
  }
})();
