(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .controller('EditBoxTinggController', EditBoxTinggController);

  EditBoxTinggController.$inject = ['$scope', 'boxData', 'notifications', 'TinggService'];

  function EditBoxTinggController ($scope, boxData, notifications, TinggService) {
    var vm = this;
    let gsmverified = false;
    let errorText;
    activate();
    vm.deactivateModem = deactivateModem;
    vm.gsmverified = gsmverified
    vm.errorText = errorText
    ////

    function activate () {

      
    }

    function deactivateModem(){
      TinggService.deactivateModem(boxData).then((res)=>vm.gsmverified = true)
      .catch((error)=> {console.log(error) } )
    }

  }
})();
