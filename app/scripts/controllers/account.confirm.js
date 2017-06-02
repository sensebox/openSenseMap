(function () {
  'user strict';

  angular
    .module('openSenseMapApp')
    .controller('ConfirmEmailController', ConfirmEmailController);

  ConfirmEmailController.$inject = ['$state', 'AccountService'];

  function ConfirmEmailController ($state, AccountService) {
    var vm = this;
    vm.alerts = [];

    activate();

    ////

    function activate () {
      var email = $state.params.email;
      var token = $state.params.token;
      return confirmEmail(email,token)
        .then(function () {
          console.info('Activated Confirm Email View');
        });
    }

    function confirmEmail (email, token) {
      var params = {
        email: email,
        token: token
      };
      return AccountService.confirmEmail(params)
        .then(function (data) {
          vm.alerts.push({type: 'success', msg: data.message});
        })
        .catch(function (error) {
          vm.alerts.push({type: 'danger', msg: error.message});
        });
    }
  }
})();
