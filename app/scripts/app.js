'use strict';

var app = angular.module('app');

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when('/intro',
        {
            controller: 'IntroCtrl',
            templateUrl: 'scripts/intro/intro.tpl.html',
            publicAccess: true
        })
        .when('/main',
        {
            controller: 'MainCtrl',
            templateUrl: 'scripts/main/main.tpl.html',
            publicAccess: true
        })
        .when('/car/:id',
        {
            controller: 'CarCtrl',
            templateUrl: 'scripts/car/car.tpl.html',
            publicAccess: true
        })
        .when('/about',
        {
            controller: 'AboutCtrl',
            templateUrl: 'scripts/about/about.tpl.html',
            publicAccess: true
        })
        .when('/knowhow',
        {
            controller: 'KnowhowCtrl',
            templateUrl: 'scripts/knowhow/knowhow.tpl.html',
            publicAccess: true
        })
        .when('/knowhow/:term',
        {
            controller: 'KnowhowCtrl',
            templateUrl: 'scripts/knowhow/knowhow.tpl.html',
            publicAccess: true
        })
        .otherwise({redirectTo: '/intro'});
}]);