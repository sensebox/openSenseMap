'use strict';

/**
 * @ngdoc service
 * @name openSenseMapApp.OpenSenseMapAPIConfig
 * @description Defines the settings for the OpenSenseBox API such as the URL
 */
angular.module('openSenseMapApp')
	.factory('OpenSenseMapAPIConfig', function () {
		var api = {
			url: '@@OPENSENSEMAP_API_URL'
		};
		return api;
	});
