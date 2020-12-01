(function () {
    'use strict';

    /**
     * This service takes care of all routing and verfifying being done when 
     * creating a box with gsm enabled 
     * it .. 
     *  - verifys modem 
     *  - create thing_type
     *  - create thing 
     *  - link modem & thing 
     * 
     * @author Eric
     * 
     */
    angular
        .module('app.services')
        .factory('TinggService', TinggService);

    TinggService.$inject = ['$http', '$window', 'app'];

    function TinggService($http, $window, app) {
        var service = {
            login:login,
            refreshToken:refreshToken,
            verifyModem: verifyModem,
            createThingType: createThingType,
            createThing: createThing,
            linkModem: linkModem
        };

        return service;

        function failed(error) {
            return $q.reject(error.data);
        }

        /**
         * logs into tingg developer account
         * @param {"email":"email","password":"password"} data 
         */
        function login(data){
            console.log("logging in",data);
            return $http.post(app.TINGG_URL + '/auth/login',data)
                .then(function(response){
                    console.log("login success",response)
                })
                .catch(failed)
        }
        /**
         * gets new token based on old one
         * @param {"token":token} data 
         */
        function refreshToken(data){
            console.log("refresh token");
            return $http.post(app.TINGG_URL + '/auth/token-refresh',data)
            .then(function(response){
                console.log("refresh token",response)
            })
            .catch(failed)
        }
        /* calls   GET https://api.tingg.io/v1/modems/:imsi/verify?code=:code to verify imsi and secret code
          input: imsi and secret code from register ui
          output:200/400 status code
        */
        function verifyModem(data) {
            console.log("verifyModem", data);
            return $http.get(app.TINGG_URL + '/modems/' + data.imsi + "/verify?code=" + data.secret_code), { auth: true }
                .then(function (response) {
                    console.log("link success")
                    return response
                })
                .catch(failed)
        }

        /*
          calls POST https://api.tingg.io/v1/thing-types to create thing types 
          should be called right after verifyModem()
          input: sensors, box , name (look pdf for body example)
          output: thing_type_id
        */
        function createThingType(data) {
            console.log("createthingtype", data)
            return $http.post(app.TINGG_URL + '/thing-types', data, { auth: true })
                .then(function (response) {
                    console.log(response)
                })
                .catch(failed)
        }

        /*
          calls POST https://api.tingg.io/v1/things to create a thing
          input: thing_type_id from previous request
          output: thing_id
        
        */
        function createThing(data) {
            console.log("createThing", data);
            return $http.post(app.TINGG_URL + '/things', data, { auth: true })
                .then(function (response) {
                    console.log(response)
                })
                .catch(failed)
        }
        /*
          calls POST https://api.tingg.io/v1/modems/:imsi/link to verify modem and thing id 
          input: imsi and thing_id 
          output:200/400 status code 
        */
        function linkModem(data) {
            console.log('link modem', data)
            return $http.post(app.TINGG_URL + '/modems/' + data.imsi + '/link', data.thing_id, { auth: true })
                .then(function (response) {
                    console.log(response)
                })
                .catch(failed)
        }



    }
})();