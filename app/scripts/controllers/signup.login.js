(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .controller('SignupLoginController', SignupLoginController);

  SignupLoginController.$inject = [];

  function SignupLoginController () {
    var vm = this;

    vm.signup = {
      name: '',
      email: '',
      password: {
        type: 'password',
        value: ''
      },
      confirm: {
        type: 'password',
        value: ''
      }
    };
    vm.login = {
      email: '',
      password: {
        type: 'password',
        value: ''
      },
    }

    vm.showPassword = showPassword;

    ////

    function showPassword (element) {
      switch (element) {
        case 'login-password':
          vm.login.password.type = (vm.login.password.type === 'password') ? vm.login.password.type = 'text' : vm.login.password.type = 'password';
          break;
        case 'signup-password':
          vm.signup.password.type = (vm.signup.password.type === 'password') ? vm.signup.password.type = 'text': vm.signup.password.type = 'password';
          break;
        case 'signup-password-confirm':
          vm.signup.confirm.type = (vm.signup.confirm.type === 'password') ? vm.signup.confirm.type = 'text': vm.signup.confirm.type = 'password';
          break;
      }
    }
  }
})();
