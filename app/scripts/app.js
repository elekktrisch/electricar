'use strict';

angular.module('app')
    .config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when('/main',
        {
            controller: 'MainCtrl',
            templateUrl: 'views/main.html',
            publicAccess: true
        })
        .otherwise({redirectTo: '/main'});
}]);