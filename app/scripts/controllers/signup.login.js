(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .controller('SignupLoginController', SignupLoginController);

  SignupLoginController.$inject = ['$scope', 'SignupLoginService'];

  function SignupLoginController ($scope, SignupLoginService) {
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

    vm.submit = submit;
    vm.showPassword = showPassword;

    ////

    function submit (form) {
      if (form === 'signup') {
        var data = {
          name: vm.signup.name,
          email: vm.signup.email,
          password: vm.signup.password.value
        };

        return signup(data)
          .then(function () {
            console.log('New Account created!');
          });
      } else if (form === 'login') {
        var data = {
          email: vm.login.email,
          password: vm.login.password.value
        };

        return login(data)
          .then(function () {
            console.log('Successfully signed in!');
          });
      }
    }

    function signup (data) {
      return SignupLoginService.signup(data)
        .then(function (data) {
          return data;
        });
    }

    function login (data) {
      return SignupLoginService.login(data)
        .then(function (data) {
          $scope.closeThisDialog();
          return data;
        });
    }

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
