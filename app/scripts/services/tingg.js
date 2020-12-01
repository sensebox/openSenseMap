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

    TinggService.$inject = ['$http', '$window', 'app','$q','TinggAuthenticationService'];

    function TinggService($http, $window, app,$q,TinggAuthenticationService) {
        var service = {
            login: login,
            refreshToken: refreshToken,
            verifyModem: verifyModem,
            createThingType: createThingType,
            createThing: createThing,
            linkModem: linkModem
        };

        return service;

        function failed(error) {
            console.log(error)
            return $q.reject(error.data);
        }

        function success(response){
            console.log('saving token',response);
            TinggAuthenticationService.saveToken(response.data.token)
        }

        /**
         * logs into tingg developer account
         * @param {"email":"email","password":"password"} data 
         */
        function login(data) {
            console.log("logging in to tingg", data);
            return $http.post(app.TINGG_URL + '/auth/login', data)
                .then(success)
                .catch(failed)
        }
        /**
         * gets new token based on old one
         * @param {"token":token} data 
         */
        function refreshToken() {
            var data = {token: TinggAuthenticationService.getAccessToken()};
            return $http.post(app.TINGG_URL + '/auth/token-refresh', data)
                .then(function (response) {
                    console.log("refresh token", response)
                    TinggAuthenticationService.saveToken(response.data.token)
                })
                .catch(failed)
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

        /*
          calls POST https://api.tingg.io/v1/thing-types to create thing types 
          should be called right after verifyModem()
          input: sensors, box , name (look pdf for body example)
          output: thing_type_id
        */
        function createThingType(data,boxid,name) {
            const body = buildThingTypeBody(data,boxid,name);
            return $http.post(app.TINGG_URL + '/thing-types', body, { tinggAuth: true })
                .then(function (response) {
                    console.log("creating thing now");
                    return response.data
                })
                .catch(failed)

        }

        /*
          calls POST https://api.tingg.io/v1/things to create a thing
          input: thing_type_id from previous request
          output: thing_id

          data = {
            "name": "Some name, maybe senseBoxId",
            "thing_type_id": "80fe09c5-bd02-43b7-9947-ea6ad458181b"
            }
        
        */
        function createThing(data) {
            return $http.post(app.TINGG_URL + '/things', data, { tinggAuth: true })
                .then(function (response) {
                    console.log("thing created!",response)
                    //linkModem({})
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
            return $http.post(app.TINGG_URL + '/modems/' + data.imsi + '/link', data.thing_id, { tinggAuth: true })
                .then(function (response) {
                    console.log(response)
                })
                .catch(failed)
        }

        /**Helper function to build the data accordingly from the sensor array
         *  needs name and box id
         * @param {sensor array from registration} data 
         */
        function buildThingTypeBody(sensordata,boxid,name){
            let resources = []
            if(sensordata){
                sensordata.map((sensor)=>{
                    let toAdd = {
                        "topic":`/osm/${boxid}/${sensor._id}`,
                        "method":"pub",
                        "type":"number" 
                    }
                    resources.push(toAdd); 
                })
            }
            let body = {
                "name":name,
                "description":"some basic desccription",
                "resources":resources
            }
            return body;
        }


    }
})();