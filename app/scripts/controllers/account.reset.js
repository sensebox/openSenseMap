(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .controller('PasswordResetController', PasswordResetController);

  PasswordResetController.$inject = ['$state', 'SignupLoginService'];

  function PasswordResetController ($state, SignupLoginService) {
    var vm = this;
    vm.newData = {
      email: '',
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
      if (form === 'reset') {
        var data = {
          email: vm.newData.email,
          password: vm.newData.password.value,
          token: vm.newData.token
        };

        return reset(data)
          .then(function () {
            console.log('Instructions send!')
          })
      }
    }

    function reset (data) {
      return SignupLoginService.reset(data)
        .then(function (response) {
          console.log(response);
          console.log('Successfull reset!');
        })
    }
  }
})();
