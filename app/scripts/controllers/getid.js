'use strict';

angular.module('openSenseMapApp')
  .controller('GetIdCtrl', ['$scope', '$http', function ($scope, $http) {
    $scope.user = {};
    $scope.apikey = "";

    $scope.alerts = [
  ];

  $scope.closeAlert = function(index) {
    $scope.alerts.splice(index, 1);
  };

    // function to submit the form after all validation has occurred            
    $scope.submitForm = function(isValid) {

        $scope.alerts.length = 0;

        // check to make sure the form is completely valid
        if (isValid) { 
            $http.post("http://opensensemap.org:8000/users",$scope.user)
                .success(function(data) {
                    $scope.apikey = data.apikey;
                    $scope.alerts.push({type: 'success', msg: 'Deine SenseBox ID lautet: '+data.apikey+"! Du bekommst deine SenseBox ID zur Sicherheit per Mail zugeschickt."});
                })
                .error(function(data) {
                   $scope.alerts.push({type: 'danger', msg: 'Oh :( Irgendetwas ist bei der Generierung schiefgelaufen. Bitte versuch es noch einmal.' });
                });
        }
    };
  }]);
