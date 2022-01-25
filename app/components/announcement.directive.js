(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .directive('osemAnnouncement', osemAnnouncement);

  osemAnnouncement.$inject = [];

  function osemAnnouncement () {
    var directive = {
      templateUrl: 'components/announcement.directive.html',
      link: link,
      // eslint-disable-next-line angular/directive-restrict
      restrict: 'EA',
      transclude: true,
      controller: AnnouncementController,
      controllerAs: 'announcement',
      bindToController: true, // because the scope is isolated
      scope: {},
    };

    return directive;

    ////

    function link (scope, element, attrs) {}
  }

  AnnouncementController.$inject = ['$scope', 'DirectusService'];

  function AnnouncementController ($scope, DirectusService) {
    var vm = this;
    var variantPrefix = 'alert-';

    vm.$onInit = onInit;
    vm.$onDestroy = onDestroy;

    vm.show = true;
    vm.variant = 'alert-warning';
    vm.markdown = '';

    vm.close = close;

    ////

    function onInit () {
      activate();
    }

    function onDestroy () {
      // $timeout.cancel(vm.prom);
      // resetTimer();
    }

    function activate () {
      // fetch CMS endpoint
      return DirectusService.getAnnouncement()
        .then(function (response) {
          if (!response.data.text) {
            close();

            return;
          }
          vm.variant = variantPrefix + response.data.variant;
          vm.markdown = response.data.text;
        })
        .catch(function () {
          // no need to catch errors
          // instead hide announcment
          close();
        });
    }

    function close () {
      vm.show = false;

      $scope.$emit('osemAnnouncementClosed', {});
    }

    ////

  }
})();
