import angular from 'angular';
import "../styles/styles";
import "angular-route";
import "highcharts";
import "highcharts-ng";
import introModule from "./intro/intro-module";
import aboutModule from "./about/about-module";
import knowhowModule from "./knowhow/knowhow-module";
import mainModule from "./main/main-module";
import carModule from "./car/car-module";

export default angular.module('app', [
    'ngRoute',
    'highcharts-ng',

    introModule.name,
    aboutModule.name,
    knowhowModule.name,
    mainModule.name,
    carModule.name
])
    .directive("scroll", function ($window) {
        return function (scope, element, attrs) {
            angular.element($window).bind("scroll", function() {
                if (this.pageYOffset >= 100) {
                    scope.boolChangeClass = true;
                } else {
                    scope.boolChangeClass = false;
                }
                scope.$apply();
            });
        };
    })
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/intro',
                {
                    controller: 'IntroCtrl',
                    template: require('./intro/intro.tpl.html'),
                    publicAccess: true
                })
            .when('/main',
                {
                    controller: 'MainCtrl',
                    template: require('./main/main.tpl.html'),
                    publicAccess: true
                })
            .when('/car/:id',
                {
                    controller: 'CarCtrl',
                    template: require('./car/car.tpl.html'),
                    publicAccess: true
                })
            .when('/about',
                {
                    controller: 'AboutCtrl',
                    template: require('./about/about.tpl.html'),
                    publicAccess: true
                })
            .when('/knowhow',
                {
                    controller: 'KnowhowCtrl',
                    template: require('./knowhow/knowhow.tpl.html'),
                    publicAccess: true
                })
            .when('/knowhow/:term',
                {
                    controller: 'KnowhowCtrl',
                    template: require('./knowhow/knowhow.tpl.html'),
                    publicAccess: true
                })
            .otherwise({redirectTo: '/intro'});
    }]);