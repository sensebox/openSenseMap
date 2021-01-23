(function () {
  'use strict';

  angular.module('openSenseMapApp').directive('osemClipboard', OsemClipboard);

  OsemClipboard.$inject = ['$window'];
  function OsemClipboard ($window) {
    // Usage:
    //
    // Creates:
    //
    var directive = {
      link: link,
      restrict: 'A',
      scope: {
        text: '='
      }
    };

    return directive;

    function link (scope, element) {
      element.on('click', function () {

        var isOS = $window.navigator.userAgent.match(/ipad|iphone/i);

        var textField = $window.document.createElement('textarea');
        // Place in top-left corner of screen regardless of scroll position.
        textField.style.position = 'fixed';
        textField.style.top = '0';
        textField.style.left = '0';
        textField.style.width = '2em';
        textField.style.height = '2em';
        textField.style.padding = '0';
        textField.style.border = 'none';
        textField.style.outline = 'none';
        textField.style.boxShadow = 'none';
        textField.style.background = 'transparent';
        textField.innerText = scope.text;
        $window.document.body.appendChild(textField);

        if (isOS) {
          var range, selection;
          range = $window.document.createRange();
          range.selectNodeContents(textField);
          selection = $window.getSelection();
          selection.removeAllRanges();
          selection.addRange(range);
          textField.setSelectionRange(0, 999999);
        } else {
          textField.select();
        }

        try {
          $window.document.execCommand('copy');
        } catch (err) {
          console.log('Oops, unable to cut');
        }
        $window.document.body.removeChild(textField);
      });
    }
  }
})();
