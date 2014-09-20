'use strict';

var app = angular.module('app');

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when('/main',
        {
            controller: 'MainCtrl',
            templateUrl: 'views/main.html',
            publicAccess: true
        })
        .otherwise({redirectTo: '/main'});
}]);


app.directive("scroll", function ($window) {
    return function(scope, element, attrs) {
        angular.element($window).bind("scroll", function() {
            if (this.pageYOffset >= document.getElementById('quartett-board').offsetHeight) {
                scope.boolChangeClass = true;
            } else {
                scope.boolChangeClass = false;
            }
            scope.$apply();
        });
    };
});
/*

app.run(function($rootScope, $location, $anchorScroll, $routeParams) {
    //when the route is changed scroll to the proper element.
    $rootScope.$on('$routeChangeSuccess', function(newRoute, oldRoute) {
        $location.hash($routeParams.scrollTo);
        $anchorScroll();
    });
});*/
