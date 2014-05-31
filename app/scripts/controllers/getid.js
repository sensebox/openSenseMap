'use strict';

angular.module('openSenseMapApp')
  .controller('GetIdCtrl', function ($scope) {
    $scope.id = {};

    // function to submit the form after all validation has occurred            
    $scope.submitForm = function(isValid) {

        // check to make sure the form is completely valid
        if (isValid) { 
            alert('our form is amazing');
        }

    };
  });
