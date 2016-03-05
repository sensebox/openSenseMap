'use strict';

angular
  .module('openSenseMapApp', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute',
    'ngDialog',
    'leaflet-directive',
    'ui.bootstrap',
    'ui.bootstrap.accordion',
    'nya.bootstrap.select',
    'osemFilters',
    'angular-underscore',
    'rcWizard',
    'rcForm',
    'ngClipboard',
    'flow',
    'ui.checkbox',
    'highcharts-ng',
    'pascalprecht.translate',
    'ui.router'
  ])
  .config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
    $locationProvider.html5Mode(true);

    $urlRouterProvider.otherwise('/');

    $stateProvider
      .state('explore', {
        url: '/',
        //templateUrl: 'views/explore2.html',
        abstract: true,
        controller: 'MapCtrl',
        templateUrl: 'views/explore2.html'
        
          // using @ to access the nested views within the "explore" state in explore2.html
          //'map': {
          //  controller: 'MapCtrl',
          //  templateUrl: 'views/explore2.map.html',
          //},
          //'sidebar@explore': {
          //  //controller: 'SidebarBoxDetailsCtrl',
          //  //templateUrl: 'views/explore2.sidebar.html',
          //},
          //'legend@explore': {
          //  templateUrl: 'views/explore2.map.legend.html'
          //}
        //}
      })
      .state('explore.map', {
        url: '',
        controller: 'MapCtrl',
        templateUrl: 'views/explore2.map.html'
      })
      .state('explore.map.boxdetails', {
        url: 'explore/:id', // no leading / because it is a child of the 'explore' state
        views: {
          'sidebar': {
            controller: 'SidebarBoxDetailsCtrl',
            templateUrl: 'views/explore2.sidebar.box.html'
          }
        }
      })
      .state('explore.map.filter', {
        views: {
          'sidebar': {
            controller: 'SidebarFilterCtrl',
            templateUrl: 'views/explore2.sidebar.filter.html'
          }
        }
      })
      .state('explore.map.download', {
        views: {
          'sidebar': {
            controller: function($scope) { $scope.thing = "DownloadCtrl"; },
            templateUrl: 'views/explore2.sidebar.download.html'
          }
        }
      })
      .state('explore.map.interpolation', {
        views: {
          'sidebar': {
            controller: function($scope){ $scope.thing = "InterpolationCtrl"; },
            templateUrl: 'views/explore2.sidebar.test.html',
          }
        }
      })
      .state('register', {
        url: '/register',
        templateUrl: 'views/register.html',
        controller: 'RegisterCtrl'
      });
  })

  .config(['ngClipProvider', function(ngClipProvider) {
      ngClipProvider.setPath("bower_components/zeroclipboard/dist/ZeroClipboard.swf");
  }])

  .config(function ($translateProvider){
    $translateProvider.useStaticFilesLoader({
        prefix: '../translations/',
        suffix: '.json'
      });
    $translateProvider.use('de_DE');
    $translateProvider.fallbackLanguage('de_DE');
    $translateProvider.preferredLanguage('de_DE');
    $translateProvider.determinePreferredLanguage();
    $translateProvider.useSanitizeValueStrategy('escaped');
  })

  .controller('HeaderCtrl', ['$scope', '$rootScope', '$translate', '$route', function ($scope, $rootScope, $translate, $route) {
    $scope.key="de";
    $scope.changeLang = function (key) {
      $translate.use(key).then(function (key) {
        console.log("Sprache zu "+ key +" gewechselt.");
        $scope.key = key.split("_")[0];
      }, function (key) {
        console.log("Irgendwas lief schief");
      });
      $scope.changeLang($translate.use());
    }

    $rootScope.$watch('selectedBox', function() {
      $scope.box = $rootScope.selectedBox;
      console.log("box changed to "+$rootScope.selectedBox);
    });
  }])
  
  .filter('unsafe', ['$sce', function($sce){
    return function (val) {
      return $sce.trustAsHtml(val);
    };
  }])
