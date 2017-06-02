(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .controller('PasswordResetController', PasswordResetController);

  PasswordResetController.$inject = ['$state', 'AccountService'];

  function PasswordResetController ($state, AccountService) {
    var vm = this;
    vm.newData = {
      password: {
        type: 'password',
        value: ''
      },
      confirm: {
        type: 'password',
        value: ''
      },
      token: ''
    };

    vm.showPassword = showPassword;
    vm.submit = submit;

    vm.errors = [];

    activate();

    ////

    function activate () {
      vm.newData.token = $state.params.token
    }

    function showPassword (element) {
      switch (element) {
        case 'reset-password':
          vm.newData.password.type = (vm.newData.password.type === 'password') ? vm.newData.password.type = 'text': vm.newData.password.type = 'password';
          break;
        case 'reset-password-confirm':
          vm.newData.confirm.type = (vm.newData.confirm.type === 'password') ? vm.newData.confirm.type = 'text': vm.newData.confirm.type = 'password';
          break;
      }
    }

    function submit (form) {
      vm.errors = [];
      if (form === 'reset') {
        var data = {
          password: vm.newData.password.value,
          token: vm.newData.token
        };

        return reset(data)
          .then(function (response) {
            if (angular.isUndefined(response) || response.status > 400) {
              return response;
            }
          })
          .catch(function (error) {
            vm.errors.push({
              error: error.message
            });
          });
      }
    }

    function reset (data) {
      return AccountService.reset(data)
        .then(function (response) {
          return response;
        });
    }
  }
})();
