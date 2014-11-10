/*global _:false*/
'use strict';

angular.module('car')
    .controller('CarCtrl', function ($scope, $q, $log, $location, $routeParams, Circles, Cars, Plugs) {
        var i = 0;

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


                $scope.slider.reserveKm = {
                        range: false,
                        max: $scope.selectedCar.range
                    };
                return cars;
            }).$promise;
        }

        function queryPlugs() {
            return Plugs.query(function (result) {
                $scope.plugs = result;
                $scope.setPower(result[0], $scope.selectedCar);
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


        $scope.speedKmh = 70;
        $scope.numCharges = 0;
        $scope.stopDuration = 0;


        $scope.setPower = function (plug, car) {
            var chargePower = 0;
            for (var i = 0; i < plug.power.length; i++) {
                var p = plug.power[i];
                chargePower += (p.voltage * p.ampere);
            }
            if (!plug.continuous) {
                chargePower = chargePower * 0.8;
            }
            $scope.calcParams.chargingPower = Math.floor(chargePower / 100) / 10;
            plug.chargingPower = $scope.calcParams.chargingPower;
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


        function doRecalc() {
            $scope.totalDistance = $scope.calcParams.distanceToTravel;
            var distancePoints = [];
            var energyPoints = [];
            var powerPoints = [];
            var car = $scope.selectedCar;

            if ($scope.calcParams.drivingSpeed > car.maxSpeed) {
                $scope.calcParams.drivingSpeed = car.maxSpeed;
            }
            $scope.speedKmh = $scope.calcParams.drivingSpeed;

            $scope.calculatedRange = car.range;
            $scope.calculatedReturnRange = car.range / 2;
            if ($scope.rangeCircle && $scope.returnCircle) {
                $scope.rangeCircle.setRadius($scope.calculatedRange * 1000);
                $scope.returnCircle.setRadius($scope.calculatedReturnRange * 1000);
                $scope.rangeCircle.setMap($scope.map);
                $scope.returnCircle.setMap($scope.map);
            }

            if (!$scope.calcParams.chargingPower) {
                $scope.calcParams.chargingPower = 0;
            }

            var currentMinute;
            var speedKmh = $scope.calcParams.drivingSpeed;
            var chargeKW = $scope.calcParams.chargingPower;
            var capacityKWh = car.battery;
            var distanceKmPerMinute = speedKmh / 60;
            $scope.consumptionKWhPerKm = car.battery / car.range;
            if ($scope.speedKmh > 90) {
                var dragFactor = Math.pow(1.2, ($scope.speedKmh / 90));
                $scope.consumptionKWhPerKm = $scope.consumptionKWhPerKm * dragFactor;
            }
            $scope.numStops = 0;
            var energyConsumptionKWhPerMinute = $scope.consumptionKWhPerKm * distanceKmPerMinute;

            var tripSimulation = {
                minutes: [
                    {
                        mode: 'DRIVING',
                        distance: 0,
                        chargeKWh: capacityKWh * $scope.calcParams.firstCharge / 100,
                        minute: 0
                    }
                ]
            };
            var currentChargeLastsForKm = 0;
            var currentDistance = 0;
            var currentMinute = 0;
            var maxTimeMinutes = 60 * 24;

            var maxSOCToUsePercent = $scope.calcParams.batteryUseablePart[1];
            var brickProtectionSOCPercent = $scope.calcParams.batteryUseablePart[0];
            var usablePercent = maxSOCToUsePercent - brickProtectionSOCPercent;
            var reserveKWh = $scope.calcParams.reserveKm * $scope.consumptionKWhPerKm;

            function calcUsableCapacityKWh(fullCapacityKWh, usablePercent) {
                var cap = fullCapacityKWh;
                $scope.useableCapacityFactor = usablePercent / 100;
                cap = cap * $scope.useableCapacityFactor;
                cap = cap - reserveKWh;
                return cap;
            }
            var useableCapacityKWh = calcUsableCapacityKWh(capacityKWh, usablePercent);
            tripSimulation.minutes[0].chargeKWh = calcUsableCapacityKWh(tripSimulation.minutes[0].chargeKWh,
                $scope.calcParams.firstCharge - brickProtectionSOCPercent);

            while (currentDistance < $scope.totalDistance && currentMinute < maxTimeMinutes) {
                var currentMinuteState = tripSimulation.minutes[currentMinute];
                var nextMinuteState = {};
                currentChargeLastsForKm = currentMinuteState.chargeKWh / $scope.consumptionKWhPerKm;
                nextMinuteState.minute = currentMinuteState.minute + 1;
                if (currentMinuteState.mode === 'DRIVING') {
                    nextMinuteState.distance = currentMinuteState.distance + distanceKmPerMinute;
                    nextMinuteState.chargeKWh = currentMinuteState.chargeKWh - energyConsumptionKWhPerMinute;
                    powerPoints.push(-$scope.consumptionKWhPerKm * speedKmh);
                    if (nextMinuteState.chargeKWh > 0) {
                        nextMinuteState.mode = 'DRIVING';
                    } else {
                        nextMinuteState.mode = 'CHARGING';
                        $scope.numStops++;
                    }
                } else {
                    nextMinuteState.distance = currentMinuteState.distance;
                    var energyPerMinute = (chargeKW / 60);
                    if (currentMinuteState.chargeKWh > (0.7 * capacityKWh) && chargeKW > (1.2 * capacityKWh)) {
                        var SOC = (brickProtectionSOCPercent + currentMinuteState.chargeKWh) / capacityKWh;
                        var potent = 16;
                        var f1 = 10 * SOC;
                        var f2 = Math.pow(f1, potent) * 7;
                        var f3 = Math.pow(10, potent);
                        var f4 = f3 - f2;
                        var f3a = Math.pow(10, potent);
                        var f5 = f4 / f3a;
                        var easeOffFactor = Math.max(0.1, Math.min(0.999, f5));

                        console.log('minute ' + currentMinute + ', SOC: ' + SOC + ', easeOffFactor: ' + easeOffFactor);
                        energyPerMinute = energyPerMinute * easeOffFactor;
                    }
                    nextMinuteState.chargeKWh = currentMinuteState.chargeKWh + energyPerMinute;
                    var chargingDone = nextMinuteState.chargeKWh >= useableCapacityKWh;
                    var chargingSufficient = currentChargeLastsForKm >= ($scope.totalDistance - currentDistance);

                    if (chargingDone
                        || chargingSufficient) {
                        nextMinuteState.mode = 'DRIVING';
                    } else {
                        nextMinuteState.mode = 'CHARGING';
                    }
                    powerPoints.push(chargeKW);
                }
                currentDistance = nextMinuteState.distance;
                currentMinute++;
                //console.log(JSON.stringify(nextMinuteState));
                tripSimulation.minutes.push(nextMinuteState);
                distancePoints.push(nextMinuteState.distance);
                energyPoints.push(nextMinuteState.chargeKWh + (brickProtectionSOCPercent * capacityKWh / 100) + reserveKWh);
            }
            $scope.totalDistance = currentDistance;
            $scope.totalDuration = Math.round(currentMinute / 6) / 10;
            $scope.calculatedDayRange = nextMinuteState.distance;
            if ($scope.dayRangeCircle) {
                $scope.dayRangeCircle.setRadius($scope.calculatedDayRange * 1000);
                $scope.dayRangeCircle.setMap($scope.map);
            }

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
                            padding: 10
                        },
                        formatter: function() {
                            return this.series.name + '<br>' + Math.round(this.point.x / 6) / 10 + 'h: ' + Math.round(this.point.y * 10) / 10;
                        }
                    },
                    yAxis: {
                        max: Math.max($scope.totalDistance, 1000),
                        tickInterval: 100,
                        title: {text: 'Distance [km]'}
                    },
                    xAxis: {
                        max: 1440,
                        title: {text: 'Time [h]'},
                        tickInterval: 360,
                        labels: {
                            formatter: function () {
                                return this.value / 60;
                            }
                        }
                    },
                    legend: {
                        enabled: true
                    }
                },

                //The below properties are watched separately for changes.

                //Series object (optional) - a list of series using normal highcharts series options.
                series: [
                    {
                        data: distancePoints,
                        name: 'Distance [km]',
                        color: 'black',
                        animation: false
                    },
                    {
                        data: energyPoints,
                        name: 'Energy [kWh]',
                        color: '#8888bb',
                        animation: false
                    },
                    {
                        data: powerPoints,
                        name: 'Power [kW]',
                        color: '#bb6666',
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
        }

        var debouncedRecalc = _.debounce(doRecalc, 500, {leading: false, trailing: true});

        $scope.recalcRange = function () {
            doRecalc();
        };

        $scope.slider = {
            batteryRange: {
            range: true
        }};
        $scope.calcParams = {};
        $scope.calcParams.batteryUseablePart = [10,90];
        $scope.calcParams.reserveKm = 50;
        $scope.calcParams.chargingPower = 0;
        $scope.calcParams.firstCharge = 100;
        $scope.calcParams.drivingSpeed = 70;
        $scope.calcParams.distanceToTravel = 800;

/*        $scope.$watch('calcParams.batteryUseablePart', debouncedRecalc);
        $scope.$watch('calcParams.chargingPower', debouncedRecalc);
        $scope.$watch('calcParams.firstCharge', debouncedRecalc);
        $scope.$watch('calcParams.drivingSpeed', debouncedRecalc);*/

        queryCars()
            .then(queryPlugs)
            .then($scope.recalcRange)
            .then(resolvePosition)
            .catch(function (reason) {
                console.log('failed to query data: ' + JSON.stringify(reason));
            });


    });