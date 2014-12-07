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
        createCircle: function (id, name, center, color) {
            return {
                id: id,
                name: name,
                center: center,
                radius: 500000,
                stroke: {
                    color: color,
                    weight: 2,
                    opacity: 1
                },
                fill: {
                    color: color,
                    opacity: 0.2
                },
                geodesic: true, // optional: defaults to false
                draggable: true, // optional: defaults to false
                clickable: true, // optional: defaults to true
                editable: true, // optional: defaults to false
                visible: true // optional: defaults to true
            };
        }
    }
});