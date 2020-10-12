(function () {
    'use strict';
  
    angular
      .module('openSenseMapApp')
      .controller('EditBoxSecurityController', EditBoxSecurityController);
  
    EditBoxSecurityController.$inject = ['$document', 'notifications', 'boxData', 'AccountService'];
  
    function EditBoxSecurityController ($document, notifications, boxData, AccountService)  {
      var vm = this;
  
      vm.access_token = "";
      vm.useAuth = false;
      vm.refreshAccessToken = false;

      vm.revealPassword = revealPassword;
      vm.generateNewToken = generateNewToken;
      vm.save = save;
  
      activate();
  
      ////
  
      function activate () {
        vm.access_token = boxData.access_token;
        vm.useAuth = boxData.useAuth;
      }

      function revealPassword() {
        var passField = document.getElementById('password-field')
        if(passField.type === 'password'){
            passField.type = "text";
        } else {
            passField.type = "password";
        }
      }

      function generateNewToken(){
        return AccountService.updateBox(boxData._id, { generate_access_token: true })
          .then(function (response) {
            angular.copy(response.data, boxData);
            vm.access_token = boxData.access_token;
            notifications.addAlert('info', 'NOTIFICATION_BOX_UPDATE_SUCCESS');
          })
          .catch(function () {
            notifications.addAlert('danger', 'NOTIFICATION_BOX_UPDATE_FAILED');
          });

      }
  
      function save () {
        console.log(vm.useAuth)
        return AccountService.updateBox(boxData._id, { useAuth: vm.useAuth === true ? true : 'false', refreshAccessToken: vm.refreshAccessToken })
          .then(function (response) {
            angular.copy(response.data, boxData);
            notifications.addAlert('info', 'NOTIFICATION_BOX_UPDATE_SUCCESS');
          })
          .catch(function () {
            notifications.addAlert('danger', 'NOTIFICATION_BOX_UPDATE_FAILED');
          });
      }
    }
})();
  