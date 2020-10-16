(function () {
  'use strict';

  angular
    .module('app.services')
    .factory('HelpModalService', HelpModalService);

  HelpModalService.$inject = ['ngDialog', '$cookies'];

  var cookieId = 'dontShowHelpAgain';

  function HelpModalService (ngDialog, $cookies) {
    var vm = this;
    vm.hasCookie = hasCookie;
    vm.onStartup = onStartup;
    vm.open = open;
    vm.setDontShowAgain = setDontShowAgain;

    return vm;

    function open () {
      ngDialog.open({
        template: '../../views/help.html',
        className: 'ngdialog-theme-default',
        appendClassName: 'help-modal',
        showClose: true,
        closeByDocument: true,
        controller: 'HelpController',
        controllerAs: 'help'
      });
    }

    function setDontShowAgain (value) {
      if (value) {
        $cookies.put(cookieId, 'true', { secure: true });
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
