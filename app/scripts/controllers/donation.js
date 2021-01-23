(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .controller('DonationController', DonationController);

  DonationController.$inject = ['LanguageService', '$sce', 'DonationModalService'];

  function DonationController (LanguageService, $sce, DonationModalService) {
    var vm = this;

    vm.onCheck = onCheck;
    vm.dontshowagain = DonationModalService.hasCookie();

    function onCheck () {
      DonationModalService.setDontShowAgain(vm.dontshowagain);
    }
  }
})();
