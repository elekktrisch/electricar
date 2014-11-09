'use strict';

var app = angular.module('app');

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when('/main',
        {
            controller: 'MainCtrl',
            templateUrl: 'scripts/main/main.html',
            publicAccess: true
        })
        .when('/car/:id',
        {
            controller: 'CarCtrl',
            templateUrl: 'scripts/car/car.html',
            publicAccess: true
        })
        .otherwise({redirectTo: '/main'});
}]);