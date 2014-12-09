'use strict';

angular.module('knowhow')
    .controller('KnowhowCtrl', function ($scope, $location, $routeParams, $anchorScroll) {
        $scope.term = $routeParams.term;
        $anchorScroll.yOffset = 100;   // always scroll by extra pixels
        $location.hash($scope.term);
    });

