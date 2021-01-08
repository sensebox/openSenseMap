(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .controller('HelpController', HelpController);

  HelpController.$inject = ['LanguageService', 'HelpModalService', '$sce'];

  function HelpController (LanguageService, HelpModalService, $sce) {
    var vm = this;
    var language = LanguageService.getLanguage() === 'de' ? '' : 'en.';
    vm.iframeSrc = $sce.trustAsResourceUrl('https://' + language + 'docs.sensebox.de/opensensemap-faq/');

    //COOKIE FUNCTIONALITY DISABLED FOR NOW
    // vm.onClose = onClose;
    // vm.dontshowagain = HelpModalService.hasCookie();

    // function onClose () {
    //   HelpModalService.setDontShowAgain(vm.dontshowagain);
    // }
  }
})();
