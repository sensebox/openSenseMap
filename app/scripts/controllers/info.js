(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .controller('InfoController', InfoController);

  InfoController.$inject = ['$rootScope', '$state', 'app'];
  function InfoController ($rootScope, $state, app) {
    var vm = this;
    vm.app = app;
    vm.tabActive = {
      about: true,
      imprint: false,
      privacy: false
    };

    vm.changeActiveTab = changeActiveTab;

    activate();

    ////////////////

    function activate () {
      $rootScope.$broadcast('osemLoaderVisibility', { visible: false });
      changeActiveTab($state.current.url.split('/')[1]);
    }

    function changeActiveTab (tab) {
      Object.keys(vm.tabActive).map(function (key) {
        vm.tabActive[key] = false;
      });
      switch (tab) {
      case 'about':
        vm.tabActive.about = true;
        break;
      case 'imprint':
        vm.tabActive.imprint = true;
        break;
      case 'privacy':
        vm.tabActive.privacy = true;
        break;
      }
    }
  }
})();
