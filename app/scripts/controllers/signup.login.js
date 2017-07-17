(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .controller('SignupLoginController', SignupLoginController);

  SignupLoginController.$inject = ['$rootScope', '$scope', '$state', '$window', '$document', '$q', 'AccountService'];

  function SignupLoginController ($rootScope, $scope, $state, $window, $document, $q, AccountService) {
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
    };
    vm.reset = {
      email: '',
      active: false
    };

    vm.errors = [];

    vm.submit = submit;
    vm.showPassword = showPassword;
    vm.resetPassword = resetPassword;

    activate();

    ////

    function activate () {}

    function submit (form, registration) {
      vm.errors = [];

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
          .then(function (response) {
            $rootScope.$emit('loggedIn', response);
            if (angular.isDefined(registration)) {
              $state.go('account.register');
            } else {
              $scope.closeThisDialog(response);
              $state.go('account.dashboard');
            }
          })
          .catch(requestFailed);
      } else if (form === 'login') {
        var data = {
          email: vm.login.email,
          password: vm.login.password.value
        };

        login(data)
          .then(function (response) {
            $rootScope.$emit('loggedIn', response);
            if (angular.isDefined(registration)) {
              $state.go('explore.map');
            } else {
              $scope.closeThisDialog(response);
              $state.go('account.dashboard');
            }
          })
          .catch(function (error) {
            vm.errors.push({
              error: 'User and or password not valid!'
            });
          });
      } else if (form === 'reset') {
        var data = {
          email: vm.reset.email
        };

        requestReset(data)
          .then(function () {
            vm.errors.push({
              error: 'Mail with reset instructions sent!'
            });
          });
      }
    }

    function requestFailed (error) {
      if (angular.isUndefined(error.message)) {
        console.log(error);
        return $q.reject(error);
      }

      vm.errors.push({
        error: error.message
      });
    }

    function requestSuccess (response) {
      return response;
    }

    function passwordMatching (model) {
      return model.password.value === model.confirm.value;
    }

    function signup (data) {
      return AccountService.signup(data)
        .then(requestSuccess)
        .catch(requestFailed);
    }

    function login (data) {
      return AccountService.login(data)
        .then(requestSuccess)
        .catch(requestFailed);
    }

    function requestReset (data) {
      return AccountService.requestReset(data)
        .then(requestSuccess)
        .catch(requestFailed);
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
      vm.errors = [];
      vm.reset.active = !vm.reset.active;
    }
  }
})();
