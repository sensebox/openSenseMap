(function() {
  'use strict';

  angular
    .module('openSenseMapApp')
    .directive('autoFocus', autoFocus);

  autoFocus.$inject = [];
  function autoFocus() {
    var directive = {
      link: link,
      restrict: 'A',
      scope: false
    };
    return directive;

    function link(scope, element, attrs) {
      scope.$watch(attrs.autoFocus, function (newValue, oldValue) {
        if (newValue === undefined) {
          return;
        }
        setTimeout(function () {
          element[0].focus();
        });
      });
    }
  }
})();
