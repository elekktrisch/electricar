'use strict';

angular.module('app', [
    'ngRoute',
    'ngMap',
    'highcharts-ng',
    'ui.slider',
    'ui.bootstrap',
    'uiGmapgoogle-maps',

    'about',
    'main',
    'car'
])
    .config(['uiGmapGoogleMapApiProvider', function (uiGmapGoogleMapApiProvider) {
        uiGmapGoogleMapApiProvider.configure({
            key: 'AIzaSyCG3Tz0Eg27w_f1yg8Rem2MSKZpLeNQ7R0',
            v: '3.17',
            libraries: 'weather,geometry,visualization'
        });
    }]);