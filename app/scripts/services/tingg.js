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
            login: login,
            refreshToken: refreshToken,
            verifyModem: verifyModem
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
            return $http.get(app.TINGG_URL + '/modems/' + data.imsi + "/verify?code=" + data.secret_code,{ tinggAuth: true }) 
                .then(function (response) {
                    console.log("verify success")
                    return true;
                })
                .catch(failed)
        }



    }
})();