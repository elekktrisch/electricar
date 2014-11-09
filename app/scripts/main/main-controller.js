'use strict';

angular.module('main')
    .controller('MainCtrl', function ($scope, $window, $location, Cars) {

        Cars.query(function (result) {
            $scope.cars = result;
        }, function (reason) {
            console.log('failed to load cars: ' + JSON.stringify(reason));
        });

        $scope.select = function (car) {
            $location.path('/car/' + car.id)
        };
    });

