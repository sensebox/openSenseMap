(function () {
  'use strict';

  angular
    .module('openSenseMapApp')
    .directive('autoFocus', autoFocus);

  autoFocus.$inject = ['$timeout'];
  function autoFocus ($timeout) {
    var directive = {
      link: link,
      restrict: 'A',
      scope: false
    };

    return directive;

    function link (scope, element, attrs) {
      scope.$watch(attrs.autoFocus, function (newValue) {
        if (newValue === undefined) {
          return;
        }
        $timeout(function () {
          element[0].focus();
        });
      });
    }
  }
})();
