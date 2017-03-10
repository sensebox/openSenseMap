(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .controller('SignupLoginController', SignupLoginController);

  SignupLoginController.$inject = ['$scope', '$state', 'SignupLoginService'];

  function SignupLoginController ($scope, $state, SignupLoginService) {
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
    vm.reset = {
      email: '',
      active: false
    };

    vm.errors = []

    vm.title = 'Sign in to openSenseMap'
    vm.submit = submit;
    vm.showPassword = showPassword;
    vm.resetPassword = resetPassword;

    ////

    function submit (form) {
      if (form === 'signup') {
        var data = {
          name: vm.signup.name,
          email: vm.signup.email,
          password: vm.signup.password.value
        };

        if (!passwordMatching(vm.signup)) {
          vm.errors.push({
            error: 'Password not matching!'
          });
          return;
        }

        signup(data)
          .then(function () {
            console.log('New Account created!');
            $state.go('account.dashboard');
          });
      } else if (form === 'login') {
        var data = {
          email: vm.login.email,
          password: vm.login.password.value
        };

        login(data)
          .then(function (response) {
            if (angular.isUndefined(response) || response.status > 400) {
              return '';
            }
            console.log('Successfully signed in!');
          })
          .then(function (error) {
            vm.errors.push({
              error: 'User or password wrong!'
            });
          });
      } else if (form === 'reset') {
        var data = {
          email: vm.reset.email
        }

        requestReset(data)
          .then(function () {
            console.log('Instructions send!')
          })
      }
    }

    function passwordMatching (model) {
      return model.password.value === model.confirm.value;
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
          return data;
        });
    }

    function requestReset (data) {
      return SignupLoginService.requestReset(data)
        .then(function (data) {
          return data;
        })
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

    function resetPassword () {
      vm.title = (!vm.reset.active) ? 'Recover Password' : 'Sign in to openSenseMap';
      vm.reset.active = !vm.reset.active;
    }
  }
})();
