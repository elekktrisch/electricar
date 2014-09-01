'use strict';

angular.module('main')
    .controller('MainCtrl', function ($scope) {
        var i = 0;
        $scope.cars = [
            {
                id: i++,
                name: 'BMW i3',
                range: '190',
                image: 'bmwi3.jpg'
            },
            {
                id: i++,
                name: 'Ford Focus',
                range: '162',
                image: 'ford_focus.jpg'
            },
            {
                id: i++,
                name: 'Mitsubishi iMiEV',
                range: '150',
                image: 'mitsubishi_imiev.jpg'
            },
            {
                id: i++,
                name: 'Nissan Leaf',
                range: '199',
                image: 'nissan_leaf.jpg'
            },
            {
                id: i++,
                name: 'Renault Kangoo Z.E.',
                range: '120',
                image: 'renault_kangoo.jpg'
            },
            {
                id: i++,
                name: 'Renault ZOE',
                range: '210',
                image: 'renault_zoe.jpg'
            },
            {
                id: i++,
                name: 'Tesla Model S',
                range: '502',
                image: 'tesla_model_s.jpg'
            },
            {
                id: i++,
                name: 'VW e-Golf',
                range: '190',
                image: 'vw_egolf.jpg'
            },
            {
                id: i++,
                name: 'VW e-Up',
                range: '160',
                image: 'vw_eup.jpg'
            }
        ];

        $scope.rangeCircle = new google.maps.Circle({
            id: "circle",
            name: "circle",
            strokeColor: "#FF0000",
            strokeOpacity: "0.8",
            strokeWeight: "2",
            center: {lat:47.3182,lng:8.7956},
            radius: 1,
            editable: false
        });

        $scope.returnCircle = new google.maps.Circle({
            id: "circle",
            name: "circle",
            strokeColor: "#0000ff",
            strokeOpacity: "0.8",
            strokeWeight: "2",
            center: {lat:47.3182,lng:8.7956},
            radius: 1,
            editable: false
        });

        $scope.select = function (car) {
            $scope.selectedCar = car;
            $scope.rangeCircle.setRadius(car.range * 1000 * 0.6);
            $scope.returnCircle.setRadius(car.range * 500 * 0.6);
            $scope.rangeCircle.setMap($scope.map);
            $scope.returnCircle.setMap($scope.map);
        };
    });