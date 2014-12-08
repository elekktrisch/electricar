'use strict';

angular.module('knowhow')
    .controller('KnowhowCtrl', function ($scope, $routeParams) {
        $scope.term = $routeParams.term;
    });

