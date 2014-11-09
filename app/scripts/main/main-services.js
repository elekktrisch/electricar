'use strict';

var app = angular.module('app');

app.factory('Cars', function ($resource) {
    return $resource('scripts/data/cars.json');
});

app.factory('Plugs', function ($resource) {
    return $resource('scripts/data/plugs.json');
});

app.factory('Circles', function () {
    return {
        createCircle: function (center, color) {
            return new google.maps.Circle({
                id: 'circle',
                name: 'circle',
                fillColor: color,
                strokeColor: color,
                strokeOpacity: '0.8',
                strokeWeight: '2',
                center: center,
                radius: 1,
                editable: false
            });
        }
    }
});