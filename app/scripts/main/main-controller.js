'use strict';

angular.module('main')
    .controller('MainCtrl', function ($scope) {
        var i = 0;
        $scope.realityFactor = 0.7;
        $scope.cars = [
            {
                id: i++,
                name: 'BMW i3',
                range: 190,
                battery: 18.8,
                chargePower: 50,
                plugs: ['type2', 'ccs'],
                image: 'bmwi3.jpg'
            },
            {
                id: i++,
                name: 'Ford Focus Electric',
                range: 162,
                battery: 23,
                chargePower: 5,
                plugs: ['type1'],
                image: 'ford_focus.jpg'
            },
            {
                id: i++,
                name: 'Mitsubishi iMiEV',
                range: 150,
                battery: 16,
                chargePower: 50,
                plugs: ['type1', 'chademo'],
                image: 'mitsubishi_imiev.jpg'
            },
            {
                id: i++,
                name: 'Nissan Leaf',
                range: 199,
                battery: 24,
                chargePower: 50,
                plugs: ['type1', 'chademo'],
                image: 'nissan_leaf.jpg'
            },
            {
                id: i++,
                name: 'Renault Kangoo Z.E.',
                range: 120,
                battery: 22,
                chargePower: 5,
                plugs: ['type1'],
                image: 'renault_kangoo.jpg'
            },
            {
                id: i++,
                name: 'Renault ZOE',
                range: 210,
                battery: 22,
                chargePower: 43,
                plugs: ['type2'],
                image: 'renault_zoe.jpg'
            },
            {
                id: i++,
                name: 'Tesla Model S',
                range: 502,
                battery: 85,
                chargePower: 135,
                plugs: ['type2', 'supercharger'],
                image: 'tesla_model_s.jpg'
            },
            {
                id: i++,
                name: 'VW e-Golf',
                range: 190,
                battery: 24.2,
                chargePower: 50,
                plugs: ['type2', 'ccs'],
                image: 'vw_egolf.jpg'
            },
            {
                id: i++,
                name: 'VW e-Up',
                range: 160,
                battery: 18.7,
                chargePower: 50,
                plugs: ['type2', 'ccs'],
                image: 'vw_eup.jpg'
            }
        ];

        $scope.rangeCircle = new google.maps.Circle({
            id: "circle",
            name: "circle",
            fillColor: '#0000ff',
            strokeColor: "#0000ff",
            strokeOpacity: "0.8",
            strokeWeight: "2",
            center: {lat: 47.3182, lng: 8.7956},
            radius: 1,
            editable: false
        });

        $scope.returnCircle = new google.maps.Circle({
            id: "circle",
            name: "circle",
            fillColor: '#000000',
            strokeColor: "#000000",
            strokeOpacity: "0.8",
            strokeWeight: "2",
            center: {lat: 47.3182, lng: 8.7956},
            radius: 1,
            editable: false
        });

        $scope.dayRangeCircle = new google.maps.Circle({
            id: "circle",
            name: "circle",
            fillColor: '#00FFff',
            strokeColor: "#00FFff",
            strokeOpacity: "0.8",
            strokeWeight: "2",
            center: {lat: 47.3182, lng: 8.7956},
            radius: 1,
            editable: false
        });

        $scope.maxHoursPerDay = 10;
        $scope.speedKmh = 120;
        $scope.numCharges = 0;
        $scope.stopDuration = 0;
        var calcDayRadius = function(car)
        {
            var realRange = car.range * $scope.realityFactor
            //maxHoursPerDay = ((car.range * numDepletions) / speedKmh) + ((car.range * (numDepletions - 1)) / car.chargingPerHour);
            $scope.stopDuration = car.battery / car.chargePower;
            var chargingPerHour = car.range / $scope.stopDuration * $scope.realityFactor;
            var v1 = $scope.maxHoursPerDay*chargingPerHour;
            var v2 = realRange + v1;
            var zaehler = ($scope.speedKmh*v2);
            var nenner = (realRange*(chargingPerHour+($scope.speedKmh*1)));
            $scope.numCharges = zaehler / nenner;
            var dayRadius = $scope.numCharges * realRange;
            $scope.numStops = Math.max(Math.ceil($scope.numCharges) - 1, 0);
            if($scope.numCharges > 1) {
                $scope.lastStopDuration = -1 * ($scope.numStops - $scope.numCharges) * $scope.stopDuration;
            } else {
                $scope.lastStopDuration = -1;
            }

            return dayRadius;
        }

        $scope.select = function (car) {
            $scope.selectedCar = car;
            $scope.calculatedRange = car.range * $scope.realityFactor;
            $scope.calculatedReturnRange = car.range * $scope.realityFactor / 2;
            $scope.calculatedDayRange = calcDayRadius(car);
            $scope.rangeCircle.setRadius($scope.calculatedRange * 1000);
            $scope.returnCircle.setRadius($scope.calculatedReturnRange * 1000);
            $scope.dayRangeCircle.setRadius($scope.calculatedDayRange * 1000);
            $scope.rangeCircle.setMap($scope.map);
            $scope.returnCircle.setMap($scope.map);
            $scope.dayRangeCircle.setMap($scope.map);
        };
    });