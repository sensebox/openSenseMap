(function () {
    'use strict';
  
    angular
      .module('openSenseMapApp')
      .controller('AccountNotificationCreateController', AccountNotificationCreateController);
  
    AccountNotificationCreateController.$inject = ['AccountService', '$stateParams', 'LocalStorageService', '$scope'];
  
    function AccountNotificationCreateController (AccountService,stateParams, LocalStorageService, $scope) {
        var vm = this;
        vm.boxes = [];
        vm.selectedBox = [];
        vm.selectedBoxId;
        vm.selectBox = selectBox;
        vm.createRule = createRule;
        vm.notificationRule = {active: false};
        if(stateParams.id){
            AccountService.getNotificationRule(stateParams.id)
                .then(function(rule){
                    console.log(rule);
                    vm.notificationRule = rule;
                })
        }
        getUsersNotifcationRules();

        stateParams.id

        function getUsersNotifcationRules() {
            vm.boxes = [];
      
            return AccountService.getUsersBoxes()
              .then(function (boxes) {
                vm.boxes = boxes;
            });
        }

        function selectBox() {
            vm.boxes.forEach(box => {
                if(box._id === vm.notificationRule.boxId){
                    vm.selectedBox = box;
                    return;
                }
            })
        }

        function createRule(){
            //add missing parameters for now until api is extended
            var rule = {
                ...vm.notificationRule,
                sensors: [ vm.notificationRule.sensors],
                activationTrigger: 'any',
                notificationChannel: [{ channel: 'email', email: 'xxx@ccsad.her' }]
            }
            AccountService.addNotificationRule(rule)
                .then(function (data) {
                    console.log('done', data);

                })
                .catch(function(e) {
                    console.log(e);
                });
        }
    }
  })();
  