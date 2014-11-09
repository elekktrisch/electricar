'use strict';

angular.module('car')
    .controller('CarCtrl', function ($scope, $location, $routeParams, Circles, Cars, Plugs) {
        var i = 0;
        $scope.realityFactor = 0.7;

        $scope.carId = $routeParams.id;
        function queryCars() {
            return Cars.query(function (cars) {
                $scope.cars = cars;
                var car;
                for (var x = 0; x < cars.length; x++) {
                    if ($routeParams.id == cars[x].id) {
                        $scope.selectedCar = cars[x];
                    }
                }
                return cars;
            }).$promise;
        }

        function queryPlugs() {
            return Plugs.query(function (result) {
                $scope.plugs = result;
            }).$promise;
        }

        $scope.overview = function() {
          $location.path('/main');
        };

        $scope.select = function (car) {
            $location.path('/car/' + car.id)
        };
        $scope.trip = {
            fullCharges: {
                count: 0,
                minutesPerCharge: 0
            },
            lastChargeMinutes: 0
        };

        var center = {lat: 47.3182, lng: 8.7956};
        $scope.rangeCircle = Circles.createCircle(center, '#0000ff');
        $scope.returnCircle = Circles.createCircle(center, '#000000');
        $scope.dayRangeCircle = Circles.createCircle(center, '#00FFff');

        $scope.maxHoursPerDay = 10;
        $scope.speedKmh = 120;
        $scope.numCharges = 0;
        $scope.stopDuration = 0;
        var calcDayRadius = function (car) {
            if (!car.chargePower) {
                return 0;
            }
            var realRange = car.range * $scope.realityFactor
            $scope.trip.fullCharges.minutesPerCharge = car.battery / car.chargePower;
            var chargingPerHour = car.range / $scope.trip.fullCharges.minutesPerCharge * $scope.realityFactor;
            var v1 = $scope.maxHoursPerDay * chargingPerHour;
            var v2 = realRange + v1;
            var zaehler = ($scope.speedKmh * v2);
            var nenner = (realRange * (chargingPerHour + ($scope.speedKmh * 1)));
            $scope.trip.fullCharges.count = zaehler / nenner;
            var dayRadius = $scope.trip.fullCharges.count * realRange;
            $scope.numCharges = $scope.trip.fullCharges.count;
            $scope.numStops = Math.max(Math.ceil($scope.numCharges) - 1, 0);
            if ($scope.numCharges > 1) {
                $scope.lastStopDuration = -1 * ($scope.numStops - $scope.numCharges) * $scope.stopDuration;
            } else {
                $scope.lastStopDuration = -1;
            }

            $scope.stopsImages = [];
            for (var i = 0; i < $scope.numStops; i++) {
                $scope.stopsImages.push({});
            }

            return dayRadius;
        };


        $scope.setPower = function (plug, car) {
            car.chargePower = 0;
            for (var i = 0; i < plug.power.length; i++) {
                var p = plug.power[i];
                car.chargePower += (p.voltage * p.ampere);
            }
            if (!plug.continuous) {
                car.chargePower = car.chargePower * 0.8;
            }
            car.chargePower = Math.floor(car.chargePower / 100) / 10;
            $scope.selectedPlug = plug;
            $scope.recalcRange();
        };

        $scope.supportsPlug = function (plug, car) {
            for (var i = 0; i < car.plugs.length; i++) {
                if (car.plugs[i] === plug.id) {
                    return true;
                }
            }
            return false;
        };

        $scope.toggleDetails = function () {
            $scope.showDetails = !$scope.showDetails;
        };


        $scope.recalcRange = function() {
            var car = $scope.selectedCar;
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

        queryCars()
            .then(queryPlugs)
            .then($scope.recalcRange)
            .catch(function(reason){
                console.log('failed to query data: ' + JSON.stringify(reason));
            });





        $scope.chartConfig = {
            //This is not a highcharts object. It just looks a little like one!
            options: {
                //This is the Main Highcharts chart config. Any Highchart options are valid here.
                //will be ovverriden by values specified below.
                chart: {
                    type: 'line'
                },
                tooltip: {
                    style: {
                        padding: 10,
                        fontWeight: 'bold'
                    }
                }
            },

            //The below properties are watched separately for changes.

            //Series object (optional) - a list of series using normal highcharts series options.
            series: [{
                data: [10, 15, 12, 8, 7]
            }],
            //Title configuration (optional)
            title: {
                text: ''
            },
            //Whether to use HighStocks instead of HighCharts (optional). Defaults to false.
            useHighStocks: false,

            //function (optional)
            func: function (chart) {
                //setup some logic for the chart
            }

        };
    });