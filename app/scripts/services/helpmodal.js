(function () {
  'use strict';

  angular
    .module('app.services')
    .factory('HelpModalService', HelpModalService);

  HelpModalService.$inject = ['ngDialog', '$cookies'];

  var cookieId = 'dontShowHelpAgain';

  function HelpModalService (ngDialog, $cookies) {
    var vm = this;
    vm.open = open;
    vm.setDontShowAgain = setDontShowAgain;
    vm.onStartup = onStartup;

    return vm;

    function open () {
      ngDialog.open({
        template: '../../views/help.html',
        className: 'ngdialog-theme-default',
        appendClassName: 'help-modal',
        showClose: true,
        closeByDocument: false,
        controller: 'HelpController',
        controllerAs: 'help'
      });
    }

    function setDontShowAgain (value) {
      if (value) {
        $cookies.put(cookieId, 'true');
      } else {
        $cookies.remove(cookieId);
      }
    }

    function onStartup () {
      var cookie = $cookies.get(cookieId);

      if (!cookie) {
        vm.open();
      }
    }
  }
})();
