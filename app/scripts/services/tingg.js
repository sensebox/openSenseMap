(function () {
    'use strict';

    /**
       * - verifys modem
       * @author Eric
     */
    angular
        .module('app.services')
        .factory('TinggService', TinggService);

    TinggService.$inject = ['$http', '$window', 'app', '$q'];

    function TinggService ($http, $window, app, $q) {
        var service = {
            verifyModem: verifyModem,
            deactivateModem: deactivateModem,
            init: init,
            updateTingg: updateTingg,
            deleteTingg: deleteTingg
        };

        return service;

        function failed (error) {
            return $q.reject(error.data);
        }
        function success (response) {
        }
        /**  calls   GET https://api.tingg.io/v1/modems/:imsi/verify?code=:code to verify imsi and secret code
         *  input: imsi and secret code from register ui
         *    output:200/400 status code
         * @param {*} data {"imsi":imsi,"secret_code":secret_code}
         */
        function init (data) {
            return $http({
                method: 'POST',
                url: app.MICROADAPTER_TINGG_URL + '/init',
                data: data
            })
                .then(function (response) {
                    return response;
                })
                .catch(failed);
        }

        function updateTingg (data) {
            return $http({
                method: 'POST',
                url: app.MICROADAPTER_TINGG_URL + '/update',
                data: data
            })
                .then(function (response) {
                    return response;
                })
                .catch(failed);
        }

        function deleteTingg (data) {
            return $http({
                method: 'POST',
                url: app.MICROADAPTER_TINGG_URL + '/delete',
                data: data.integrations.gsm.imsi
            })
                .then(function (response) {
                    return response;
                })
                .catch(failed);
        }

        function verifyModem (data) {
            return $http({
                method: 'POST',
                url: app.MICROADAPTER_TINGG_URL + '/verify/',
                data: { 'imsi': data.imsi, 'secret_code': data.secret_code }
            })
                .then(function (response) {
                    return response;
                })
                .catch(failed);
        }

        function deactivateModem (data) {
            return $http.get(app.API_URL + '/users/deactivateModem/' + data.integrations.gsm.imsi, { auth: true })
                .then(function (response) {
                })
                .catch(failed);
        }
    }
})();
