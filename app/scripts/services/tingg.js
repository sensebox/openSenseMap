(function () {
    'use strict';

    /**
     * it .. 
     *  - verifys modem 
     * 
     * @author Eric
     * 
     */
    angular
        .module('app.services')
        .factory('TinggService', TinggService);

    TinggService.$inject = ['$http', '$window', 'app','$q'];

    function TinggService($http, $window, app,$q) {
        var service = {
            verifyModem: verifyModem,
            deactivateModem:deactivateModem
        };

        return service;

        function failed(error) {
            console.log(error)
            return $q.reject(error.data);
        }

        function success(response){
            console.log('saving token',response);
        }
        /**  calls   GET https://api.tingg.io/v1/modems/:imsi/verify?code=:code to verify imsi and secret code
         *  
         *  input: imsi and secret code from register ui
         *    output:200/400 status code
         * 
         * @param {*} data {"imsi":imsi,"secret_code":secret_code}
         */


        function verifyModem(data) {
            console.log("verifyModem", data);
            return $http.get(app.API_URL + '/users/verifyTinggModem/' + data.imsi + '/' + data.secret_code,{auth:true}) 
                .then(function (response) {
                    return response;
                })
                .catch(failed)
        }

        //
        function deactivateModem(data){
            return $http.get(app.API_URL + '/users/deactivateModem/'+data.integrations.gsm.imsi,{auth:true})
              .then(function(response){
                console.log("success")
              })
          }



    }
})();