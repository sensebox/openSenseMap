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
  .config(function ($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/');

    //$routeProvider
    /*$urlRouterProvider
      .when('/', {
        templateUrl: 'views/explore.html',
        controller: 'ExploreCtrl'
      })
      .when('/register', {
        templateUrl: 'views/register.html',
        controller: 'RegisterCtrl'
      })
      .when('/explore', {
        templateUrl: 'views/explore.html',
        controller: 'ExploreCtrl',
      })
      .when('/launch', {
        templateUrl: 'views/explore.html',
         controller: 'ExploreCtrl'
      })
      .when('/getid', {
        templateUrl: 'views/getid.html',
        controller: 'GetIdCtrl'
      })
      .when('/explore/:boxid', {
        templateUrl: 'views/explore.html',
        controller: 'ExploreCtrl',
      })
      .when('/download', {
        templateUrl: 'views/explore.html',
        controller: 'ExploreCtrl'
      })
      .when('/download/:boxid', {
        templateUrl: 'views/explore.html',
        controller: 'ExploreCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });*/

    $stateProvider
      .state('explore', {
        url: '/',
        views: {
          '': {
            controller: 'ExploreCtrl',
            templateUrl: 'views/explore2.html'
          },
          // using @ to access the nested views within the "explore" state in explore2.html
          'map@explore': {
            controller: 'MapCtrl',
            templateUrl: 'views/explore2.map.html'
          },
          'sidebar@explore': {
            controller: 'SidebarCtrl',
            templateUrl: 'views/explore2.sidebar.html'
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

  .run(['$route', '$rootScope', '$location', function ($route, $rootScope, $location) {
    $rootScope.$on("$stateChangeError", console.log.bind(console)); // TODO: remove

    var original = $location.path;
    $rootScope.selectedBox = false;
    $location.path = function (path, reload) {
      if (reload === false) {
        var lastRoute = $route.current;
        var un = $rootScope.$on('$locationChangeSuccess', function () {
          $route.current = lastRoute;
          un();
        });
      }
      return original.apply($location, [path]);
    };
  }]);

