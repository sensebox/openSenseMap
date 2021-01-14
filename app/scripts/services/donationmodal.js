(function () {
  'use strict';

  angular
    .module('app.services')
    .factory('DonationModalService', DonationModalService);

  DonationModalService.$inject = ['ngDialog', '$cookies'];

  //COOKIE FUNCTIONALITY DISABLED FOR NOW (add again later?)
  var cookieId = 'dontShowDonationAgain';

  function DonationModalService (ngDialog, $cookies) {
    var vm = this;
    vm.hasCookie = hasCookie;
    vm.onStartup = onStartup;
    vm.open = open;
    vm.setDontShowAgain = setDontShowAgain;

    return vm;

    function open () {
      console.log("OPEN")
      ngDialog.open({
        template: '../../views/donation.html',
        className: 'ngdialog-theme-default',
        appendClassName: 'donation-modal',
        showClose: true,
        closeByDocument: true,
        controller: 'DonationController',
        controllerAs: 'donation'
      });
    }

    function setDontShowAgain (value) {
      if (value) {
        var currentDate = new Date();
        $cookies.put(cookieId, 'true', { secure: true, expires: new Date(currentDate.setMonth(currentDate.getMonth()+1))});
      } else {
        $cookies.remove(cookieId);
      }
    }

    function hasCookie () {
      var cookie = $cookies.get(cookieId);

      return Boolean(cookie);
    }

    function onStartup () {
      if (!vm.hasCookie()) {
        vm.open();
      }
    }
  }
})();
