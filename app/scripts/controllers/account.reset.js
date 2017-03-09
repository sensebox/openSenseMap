(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .controller('PasswordResetController', PasswordResetController);

  PasswordResetController.$inject = ['$state'];

  function PasswordResetController ($state) {
    console.log($state.params);
  }
})();
