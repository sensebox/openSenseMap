var app = angular.module("app", ["ngRoute","leaflet-directive"]);

app.config(function($routeProvider) {
    $routeProvider
    	.when('/',
      	{
        	templateUrl: "views/app.html",
        	controller: "AppCtrl"
      	})
      	.when('/explore', {
        	templateUrl: "views/explore.html",
        	controller: "ExploreCtrl"
      	})
      	.when('/upload', {
        	templateUrl: "views/upload.html",
        	controller: "UploadCtrl"
      	})
      	.when('/about', {
        	templateUrl: "views/about.html",
        	controller: "AboutCtrl"
      	})
      	.otherwise({
        	template: "This doesn't exist!"
      	})
});

app.factory('Avengers', function() {
    var Avengers = {};
    Avengers.cast = [
      {
        name: "Robert Downey Jr.",
        character: "Tony Stark / Iron Man"
      },
      {
        name: "Chris Evans",
        character: "Steve Rogers / Captain America"
      },
      {
        name: "Mark Ruffalo",
        character: "Bruce Banner / The Hulk"
      },
      {
        name: "Chris Hemsworth",
        character: "Thor"
      },
      {
        name: "Scarlett Johansson",
        character: "Natasha Romanoff / Black Widow"
      },
      {
        name: "Jeremy Renner",
        character: "Clint Barton / Hawkeye"
      },
      {
        name: "Tom Hiddleston",
        character: "Loki"
      },
      {
        name: "Clark Gregg",
        character: "Agent Phil Coulson"
      },
      {
        name: "Cobie Smulders",
        character: "Agent Maria Hill"
      },
      {
        name: "Stellan Skarsgard",
        character: "Selvig"
      },
      {
        name: "Samuel L. Jackson",
        character: "Nick Fury"
      },
      {
        name: "Gwyneth Paltrow",
        character: "Pepper Potts"
      },
      {
        name: "Paul Bettany",
        character: "Jarvis (voice)"
      },
      {
        name: "Alexis Denisof",
        character: "The Other"
      },
      {
        name: "Tina Benko",
        character: "NASA Scientist"
      }
    ];
    return Avengers;
})

app.controller("AppCtrl", function($scope) {
    
});

app.controller("ExploreCtrl", function($scope) {
    $scope.model = {
        message: "Explore Tab !!!"
    }
});

app.controller('MapCtrl', function ($scope) {
	
});

app.controller('UploadCtrl', function ($scope) {
	$scope.Avengers = {};
    $scope.Avengers.cast = [
      {
        name: "Robert Downey Jr.",
        character: "Tony Stark / Iron Man"
      },
      {
        name: "Chris Evans",
        character: "Steve Rogers / Captain America"
      },
      {
        name: "Mark Ruffalo",
        character: "Bruce Banner / The Hulk"
      },
      {
        name: "Chris Hemsworth",
        character: "Thor"
      },
      {
        name: "Scarlett Johansson",
        character: "Natasha Romanoff / Black Widow"
      },
      {
        name: "Jeremy Renner",
        character: "Clint Barton / Hawkeye"
      },
      {
        name: "Tom Hiddleston",
        character: "Loki"
      },
      {
        name: "Clark Gregg",
        character: "Agent Phil Coulson"
      },
      {
        name: "Cobie Smulders",
        character: "Agent Maria Hill"
      },
      {
        name: "Stellan Skarsgard",
        character: "Selvig"
      },
      {
        name: "Samuel L. Jackson",
        character: "Nick Fury"
      },
      {
        name: "Gwyneth Paltrow",
        character: "Pepper Potts"
      },
      {
        name: "Paul Bettany",
        character: "Jarvis (voice)"
      },
      {
        name: "Alexis Denisof",
        character: "The Other"
      },
      {
        name: "Tina Benko",
        character: "NASA Scientist"
      }
    ];
    $scope.model = {
    	message: $scope.Avengers
    }	
});

app.controller('AboutCtrl', function ($scope) {
	
});