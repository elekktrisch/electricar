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

                $scope.slider = {
                    reserveKm: {
                        range: false,
                        max: $scope.selectedCar.range,
                        start: $scope.invalidateResults
                    }
                };
                return cars;
            }).$promise;
        }

        function chooseBestCharger(plugQueryResult) {
            var bestPlug = $scope.plugs[0];
            var car = $scope.selectedCar;
            for (var i = 0; i < plugQueryResult.length; i++) {
                var p = plugQueryResult[i];
                if ($scope.supportsPlug(p, car)) {
                    var lastPower = calcChargingPowerForCar(bestPlug, car);
                    var newPower = calcChargingPowerForCar(p, car);
                    if (newPower > lastPower) {
                        bestPlug = p;
                    }
                }
            }
            return bestPlug;
        }

        function queryPlugs() {
            return Plugs.query(function (result) {
                $scope.plugs = result;
                $scope.setPower(chooseBestCharger(result), $scope.selectedCar);
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

        $scope.positionResolved = false;
        function resolvePosition() {
            var deferred = $q.defer();
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(_.once(function (position) {
                    var center = {lat: position.coords.latitude, lng: position.coords.longitude};
                    $scope.rangeCircle = Circles.createCircle(center, '#0000ff');
                    $scope.returnCircle = Circles.createCircle(center, '#000000');
                    $scope.dayRangeCircle = Circles.createCircle(center, '#00FFff');
                    $scope.positionResolved = true;
                    //$scope.map.setCenter(center);
                    deferred.resolve(center);
                }), function (reason) {
                    var center = {lat: 47.3712396, lng: 8.5366015};
                    $scope.rangeCircle = Circles.createCircle(center, '#0000ff');
                    $scope.returnCircle = Circles.createCircle(center, '#000000');
                    $scope.dayRangeCircle = Circles.createCircle(center, '#00FFff');
                    $scope.positionResolved = true;
                    $scope.map.setCenter(center);
                    deferred.resolve(reason);
                });
            } else {
                var center = {lat: 47.3712396, lng: 8.5366015};
                $scope.rangeCircle = Circles.createCircle(center, '#0000ff');
                $scope.returnCircle = Circles.createCircle(center, '#000000');
                $scope.dayRangeCircle = Circles.createCircle(center, '#00FFff');
                $scope.positionResolved = true;
                $scope.map.setCenter(center);
                deferred.resolve('no navigator found');
            }
            return deferred.promise;
        }


        $scope.speedKmh = 70;
        $scope.numCharges = 0;
        $scope.stopDuration = 0;


        function calcChargingPowerForCar(plug, car) {
            var chargePower = 0;
            for (var i = 0; i < plug.power.length; i++) {
                var p = plug.power[i];
                if (plug.power[i].name === 'DC' || i < car.acPhases) {
                    chargePower += (p.voltage * p.ampere);
                }
            }
            if (!plug.continuous) {
                chargePower = chargePower * 0.8;
            }
            return chargePower;
        }

        $scope.setPower = function (plug, car) {
            var chargePower = calcChargingPowerForCar(plug, car);
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

        $scope.totalChargingTimeHours = 0;
        $scope.totalEnergyConsumptionKWh = 0;


        $scope.updateRangeCircles = function () {
            $scope.calculatedRange = $scope.selectedCar.range;
            $scope.calculatedReturnRange = $scope.selectedCar.range / 2;
            var detourMapFactor = 1000 * (1 - $scope.calcParams.detourPercent / 100);
            if ($scope.rangeCircle && $scope.returnCircle && $scope.positionResolved) {
                $scope.rangeCircle.setRadius($scope.calculatedRange * detourMapFactor);
                $scope.returnCircle.setRadius($scope.calculatedReturnRange * detourMapFactor);
                $scope.rangeCircle.setMap($scope.map);
                $scope.returnCircle.setMap($scope.map);
            }
            $scope.invalidateResults();
            return detourMapFactor;
        };

        $scope.invalidateResults = function () {
            if ($scope.rangeCircle && $scope.returnCircle && $scope.positionResolved) {
                $scope.dayRangeCircle.setRadius(1);
                $scope.dayRangeCircle.setMap($scope.map);
            }
            $scope.resultsValid = false;
        };

        function doRecalc() {
            $scope.calculating = true;
            //console.log('calculating... ' + new Date());
            $scope.totalDistance = $scope.calcParams.distanceToTravel;
            var totalChargingTimeMinutes = 0;
            $scope.totalEnergyConsumptionKWh = 0;
            var distancePoints = [];
            var energyPoints = [];
            var powerPoints = [];
            var car = $scope.selectedCar;

            if ($scope.calcParams.drivingSpeed > car.maxSpeed) {
                $scope.calcParams.drivingSpeed = car.maxSpeed;
            }
            $scope.speedKmh = $scope.calcParams.drivingSpeed;
            var detourMapFactor = $scope.updateRangeCircles();
            $scope.resultsValid = true;

            if (!$scope.calcParams.chargingPower) {
                $scope.calcParams.chargingPower = 0;
            }

            var currentMinute;
            var speedKmh = $scope.calcParams.drivingSpeed;
            var chargeKW = $scope.calcParams.chargingPower;
            var capacityKWh = car.battery;
            var maxSOC = $scope.calcParams.maxBatteryChargePercent / 100;
            var maxStoredEnergykWh = maxSOC * car.battery;
            var distanceKmPerMinute = speedKmh / 60;
            $scope.consumptionKWhPerKm = car.battery / car.range;

            var dragFactor = Math.max(1, Math.pow(1.4, ($scope.speedKmh / 90)));
            var tweakCorrectionFactor = 0.90;
            $scope.consumptionKWhPerKm = $scope.consumptionKWhPerKm * dragFactor * tweakCorrectionFactor;
            //console.log('drag: ' + dragFactor + ' -> consumption: ' + $scope.consumptionKWhPerKm + 'kWh/km');

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

            var maxSOCToUsePercent = $scope.calcParams.maxBatteryChargePercent;
            var batteryLowSOC = ($scope.calcParams.reserveKm * $scope.consumptionKWhPerKm / $scope.selectedCar.battery * 100) + $scope.calcParams.brickProtectionPercent;
            var usablePercent = maxSOCToUsePercent - batteryLowSOC;

            var reserveKWh = batteryLowSOC * $scope.selectedCar.battery / 100;

            function calcUsableCapacityKWh(fullCapacityKWh, usablePercent) {
                var cap = fullCapacityKWh;
                $scope.useableCapacityFactor = usablePercent / 100;
                cap = cap * $scope.useableCapacityFactor;
                cap = cap - reserveKWh;
                return cap;
            }

            var useableCapacityKWh = calcUsableCapacityKWh(capacityKWh, usablePercent);
            tripSimulation.minutes[0].chargeKWh = calcUsableCapacityKWh(tripSimulation.minutes[0].chargeKWh,
                $scope.calcParams.firstCharge - $scope.calcParams.brickProtectionPercent);

            while (currentDistance < $scope.totalDistance && currentMinute < maxTimeMinutes) {
                var currentMinuteState = tripSimulation.minutes[currentMinute];
                var nextMinuteState = {};
                currentChargeLastsForKm = currentMinuteState.chargeKWh / $scope.consumptionKWhPerKm;
                nextMinuteState.minute = currentMinuteState.minute + 1;
                if (currentMinuteState.mode === 'DRIVING') {
                    nextMinuteState.distance = currentMinuteState.distance + distanceKmPerMinute;
                    nextMinuteState.chargeKWh = currentMinuteState.chargeKWh - energyConsumptionKWhPerMinute;
                    $scope.totalEnergyConsumptionKWh += energyConsumptionKWhPerMinute + (energyConsumptionKWhPerMinute * $scope.calcParams.chargingLossPercent / 100);
                    powerPoints.push(-$scope.consumptionKWhPerKm * speedKmh);
                    if (nextMinuteState.chargeKWh > 0) {
                        nextMinuteState.mode = 'DRIVING';
                    } else {
                        nextMinuteState.mode = 'CHARGING';
                        $scope.numStops++;
                    }
                } else {
                    nextMinuteState.distance = currentMinuteState.distance;
                    var SOC = currentMinuteState.chargeKWh / capacityKWh;
                    var C = chargeKW / capacityKWh;
                    var energyPerMinute = C * capacityKWh / 60;
                    var maxC = $scope.calcParams.maxC;
                    if (C > 0.1) {

                        var potent = 6;
                        var f1 = 12 * SOC;
                        var f2 = Math.pow(f1, potent);
                        var f3 = Math.pow(10, potent);
                        var fx = 0.5 * f2;
                        var f4 = fx + f3 - f2;
                        var f5 = f4 / f3;
                        var easeOffFactor = Math.max(0.001, Math.min(0.999, f5));
                        var easeOffC = Math.max(0.05, Math.min(maxC, C * easeOffFactor));

                        energyPerMinute = Math.min(easeOffC * capacityKWh, chargeKW) / 60;
                        //console.log('minute ' + currentMinute + ', SOC: ' + SOC + ', easeOffC: ' + easeOffC);
                    }
                    energyPerMinute = Math.min(energyPerMinute, maxC * capacityKWh / 60);
                    energyPerMinute = energyPerMinute - (energyPerMinute * $scope.calcParams.chargingLossPercent / 100);
                    nextMinuteState.chargeKWh = currentMinuteState.chargeKWh + energyPerMinute;
                    var chargingDone = nextMinuteState.chargeKWh >= maxStoredEnergykWh;
                    var chargingSufficientForTrip = currentChargeLastsForKm >= ($scope.totalDistance - currentDistance);
                    var chargingSufficientForTime = (currentChargeLastsForKm / $scope.calcParams.drivingSpeed * 60) >= (1440 - currentMinute);

                    if (chargingDone
                        || chargingSufficientForTrip
                        || chargingSufficientForTime) {
                        nextMinuteState.mode = 'DRIVING';
                    } else {
                        nextMinuteState.mode = 'CHARGING';
                    }
                    totalChargingTimeMinutes++;
                    powerPoints.push(energyPerMinute * 60);
                }
                currentDistance = nextMinuteState.distance;
                currentMinute++;
                //console.log(JSON.stringify(nextMinuteState));
                tripSimulation.minutes.push(nextMinuteState);
                distancePoints.push(nextMinuteState.distance);
                energyPoints.push(nextMinuteState.chargeKWh);
            }
            $scope.totalDistance = Math.round(currentDistance * 10) / 10;
            $scope.totalDuration = Math.round(currentMinute / 6) / 10;
            $scope.totalChargingTimeHours = Math.round(totalChargingTimeMinutes / 6) / 10;
            $scope.totalEnergyConsumptionKWh = Math.round($scope.totalEnergyConsumptionKWh * 10) / 10;
            $scope.totalAverageSpeedKmh = Math.round(currentDistance / $scope.totalDuration * 10) / 10;
            $scope.calculatedDayRange = nextMinuteState.distance;
            if ($scope.dayRangeCircle && $scope.positionResolved) {
                $scope.dayRangeCircle.setRadius($scope.calculatedDayRange * detourMapFactor);
                $scope.dayRangeCircle.setMap($scope.map);
            }

            $scope.chartConfig = {
                //This is not a highcharts object. It just looks a little like one!
                options: {
                    //This is the Main Highcharts chart config. Any Highchart options are valid here.
                    //will be ovverriden by values specified below.
                    chart: {
                        animation: false,
                        type: 'spline',
                        backgroundColor: 'rgba(255,255,255,0.7)',
                        marginTop: 20,
                        marginRight: 30,
                        height: 380,
                        zoomType: 'xy'
                    },
                    tooltip: {
                        style: {
                            padding: 5
                        },
                        formatter: function () {
                            var s = '<b>' + Math.round(this.x / 6) / 10 + ' hours:</b>';

                            $.each(this.points, function () {
                                s += '<br/>' + this.series.name + ': <b>' +
                                    Math.round(this.y * 10) / 10 + '</b>';
                            });
                            s += '<br><span style="color:blue;">Hint: Zoom by marking with the Mouse</span>';

                            return s;
                        },
                        shared: true
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
                        name: 'Driving Distance [km]',
                        color: 'black',
                        animation: false,
                        tooltip: {
                            valueSuffix: ' km'
                        }
                    },
                    {
                        data: energyPoints,
                        name: 'Stored Energy [kWh]',
                        color: '#8888bb',
                        animation: false,
                        tooltip: {
                            valueSuffix: ' kWh'
                        }
                    },
                    {
                        data: powerPoints,
                        name: 'Power [kW]',
                        color: '#bb6666',
                        animation: false,
                        tooltip: {
                            valueSuffix: ' kW'
                        }
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
            $scope.calculating = false;
        }

        var debouncedRecalc = _.debounce(doRecalc, 500, {leading: false, trailing: true});

        $scope.recalcRange = function () {
            doRecalc();
        };

        $scope.calcParams = {};
        $scope.calcParams.maxBatteryChargePercent = 90;
        $scope.calcParams.maxC = 2.5;
        $scope.calcParams.reserveKm = 50;
        $scope.calcParams.chargingPower = 0;
        $scope.calcParams.firstCharge = 100;
        $scope.calcParams.drivingSpeed = 100;
        $scope.calcParams.distanceToTravel = 700;
        $scope.calcParams.detourPercent = 30;
        $scope.calcParams.chargingLossPercent = 10;
        $scope.calcParams.brickProtectionPercent = 3;

        queryCars()
            .then(queryPlugs)
            .then($scope.recalcRange)
            .then(resolvePosition)
            .then($scope.recalcRange)
            .catch(function (reason) {
                console.log('failed to query data: ' + JSON.stringify(reason));
            });


    });