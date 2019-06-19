(function () {
    'use strict';
  
    angular
      .module('openSenseMapApp')
      .controller('AccountNotificationController', AccountNotificationController);
  
    AccountNotificationController.$inject = ['notificationRules'];
  
    function AccountNotificationController (notificationRules) {
        var vm = this
        vm.notificationRules = notificationRules;
        vm.listStyle = 'tiles';
        vm.orderByProperty = 'createdAt';

        vm.toggleNotification = function(rule) {
          if(rule.showNotifications){
            rule.showNotifications = false;
          } else {
            rule.showNotifications = true
          }
        }
    }
  })();
  