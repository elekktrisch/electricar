import angular from 'angular';
import "angular-route";
import "highcharts";
import "highcharts-ng";
import "angular-ui-bootstrap";
import "angular-ui-slider";
import introModule from "./intro/intro-module";
import aboutModule from "./about/about-module";
import knowhowModule from "./knowhow/knowhow-module";
import mainModule from "./main/main-module";
import carModule from "./car/car-module";


export default angular.module('app', [
    'ngRoute',
    'highcharts-ng',
    'ui.slider',
    'ui.bootstrap',

    introModule.name,
    aboutModule.name,
    knowhowModule.name,
    mainModule.name,
    carModule.name
])
    .config(['uiGmapGoogleMapApiProvider', function (uiGmapGoogleMapApiProvider) {
        uiGmapGoogleMapApiProvider.configure({
            key: 'AIzaSyCG3Tz0Eg27w_f1yg8Rem2MSKZpLeNQ7R0',
            v: '3.17',
            libraries: 'weather,geometry,visualization'
        });
    }])
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