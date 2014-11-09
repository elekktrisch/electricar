'use strict';

angular.module('car')
    .controller('CarCtrl', function ($scope, $q, $location, $routeParams, Circles, Cars, Plugs) {
        var i = 0;
        $scope.batteryCapacityFactor = 0.8;

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

        $scope.overview = function () {
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

        function resolvePosition() {
            var deferred = $q.defer();
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function (position) {

                    var center = {lat: position.coords.latitude, lng: position.coords.longitude};
                    $scope.rangeCircle = Circles.createCircle(center, '#0000ff');
                    $scope.returnCircle = Circles.createCircle(center, '#000000');
                    $scope.dayRangeCircle = Circles.createCircle(center, '#00FFff');
                    deferred.resolve(position);
                });
            } else {
                deferred.reject('no navigator!');
            }
            return deferred.promise;
        }


        $scope.maxHoursPerDay = 10;
        $scope.speedKmh = 70;
        $scope.numCharges = 0;
        $scope.stopDuration = 0;


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


        $scope.recalcRange = function () {
            var distancePoints = [];
            var car = $scope.selectedCar;
            if ($scope.speedKmh > car.maxSpeed) {
                $scope.speedKmh = car.maxSpeed;
            }
            $scope.calculatedRange = car.range * $scope.batteryCapacityFactor;
            $scope.calculatedReturnRange = car.range * $scope.batteryCapacityFactor / 2;
            $scope.rangeCircle.setRadius($scope.calculatedRange * 1000);
            $scope.returnCircle.setRadius($scope.calculatedReturnRange * 1000);
            $scope.rangeCircle.setMap($scope.map);
            $scope.returnCircle.setMap($scope.map);

            if (!car.chargePower) {
                car.chargePower = 0;
            }

            var currentMinute;
            var maxMinutes = $scope.maxHoursPerDay * 60;
            var speedKmh = $scope.speedKmh;
            var chargeKW = car.chargePower;
            var capacityKWh = car.battery;
            var fillupPercent = $scope.batteryCapacityFactor * 100;
            var distanceKmPerMinute = speedKmh / 60;
            $scope.consumptionKWhPerKm = car.battery / car.range;
            if ($scope.speedKmh > 70) {
                var dragFactor = Math.pow(1.25, ($scope.speedKmh / 70));
                $scope.consumptionKWhPerKm = $scope.consumptionKWhPerKm * dragFactor;
            }
            $scope.numStops = 0;
            var energyConsumptionKWhPerMinute = $scope.consumptionKWhPerKm * distanceKmPerMinute;

            var tripSimulation = {
                minutes: [
                    {
                        mode: 'DRIVING',
                        distance: 0,
                        chargeKWh: capacityKWh * fillupPercent / 100,
                        minute: 0
                    }
                ]
            };
            var currentChargeLastsForMin = 0;

            for (currentMinute = 0; currentMinute < maxMinutes; currentMinute++) {
                var currentMinuteState = tripSimulation.minutes[currentMinute];
                var nextMinuteState = {};
                currentChargeLastsForMin = currentMinuteState.chargeKWh / energyConsumptionKWhPerMinute;
                nextMinuteState.minute = currentMinuteState.minute + 1;
                if (currentMinuteState.mode === 'DRIVING') {
                    nextMinuteState.distance = currentMinuteState.distance + distanceKmPerMinute;
                    nextMinuteState.chargeKWh = currentMinuteState.chargeKWh - energyConsumptionKWhPerMinute;
                    if (nextMinuteState.chargeKWh > 0) {
                        nextMinuteState.mode = 'DRIVING';
                    } else {
                        nextMinuteState.mode = 'CHARGING';
                        $scope.numStops++;
                    }
                } else {
                    nextMinuteState.distance = currentMinuteState.distance;
                    nextMinuteState.chargeKWh = currentMinuteState.chargeKWh + (chargeKW / 60);
                    if (nextMinuteState.chargeKWh >= (capacityKWh * fillupPercent / 100)
                        || currentChargeLastsForMin >= (maxMinutes - currentMinute)) {
                        nextMinuteState.mode = 'DRIVING';
                    } else {
                        nextMinuteState.mode = 'CHARGING';
                    }
                }
                //console.log(JSON.stringify(nextMinuteState));
                tripSimulation.minutes.push(nextMinuteState);
                distancePoints.push(nextMinuteState.distance);
            }
            $scope.calculatedDayRange = nextMinuteState.distance;
            $scope.dayRangeCircle.setRadius($scope.calculatedDayRange * 1000);
            $scope.dayRangeCircle.setMap($scope.map);

            $scope.chartConfig = {
                //This is not a highcharts object. It just looks a little like one!
                options: {
                    //This is the Main Highcharts chart config. Any Highchart options are valid here.
                    //will be ovverriden by values specified below.
                    chart: {
                        animation: false,
                        type: 'line',
                        backgroundColor: 'rgba(255,255,255,0.7)',
                        marginTop: 20,
                        marginRight: 30,
                        height: 380
                    },
                    tooltip: {
                        style: {
                            padding: 10,
                            fontWeight: 'bold'
                        }
                    },
                    yAxis: {
                        min: 0,
                        max: 1200,
                        tickInterval: 100,
                        title: {text: 'Distance [km]'}
                    },
                    xAxis: {
                        tickInterval: 60,
                        title: {text: 'Time [min]'}
                    },
                    legend: {
                        enabled: false
                    }
                },

                //The below properties are watched separately for changes.

                //Series object (optional) - a list of series using normal highcharts series options.
                series: [
                    {
                        data: distancePoints,
                        color: 'black',
                        animation: false
                    }
                ],
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
        };

        queryCars()
            .then(resolvePosition)
            .then(queryPlugs)
            .then($scope.recalcRange)
            .catch(function (reason) {
                console.log('failed to query data: ' + JSON.stringify(reason));
            });


    });