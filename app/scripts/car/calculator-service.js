/*global _:false*/
'use strict';

angular.module('car')
    .factory('Calculator', function ($q) {
        return {
            trip: {
                fullCharges: {
                    count: 0,
                    minutesPerCharge: 0
                },
                lastChargeMinutes: 0
            },

            calcChargingPowerForCar: function ($scope, plug, car) {
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
                if(car.onBoardChargerKW
                    && plug.mode < 4
                    && chargePower > (1000 * car.onBoardChargerKW)) {
                    chargePower = car.onBoardChargerKW * 1000;
                }
                $scope.calcParams.chargingPower = chargePower;
                return chargePower;
            },

            supportsPlug: function (plug, car) {
                for (var i = 0; i < car.plugs.length; i++) {
                    if (car.plugs[i] === plug.id) {
                        return true;
                    }
                }
                return false;
            },

            recalcRange: function ($scope, updateRangeCirclesCallback) {
                //var deferred = $q.defer();
                //setTimeout(function () {
                $scope.calculating = true;
                if ($scope.calcParams.reservePercent > $scope.calcParams.maxBatteryChargePercent) {
                    $scope.calcParams.reservePercent = Math.max(0, $scope.calcParams.maxBatteryChargePercent - 10);
                }
                if ($scope.calcParams.reservePercent > $scope.calcParams.firstCharge) {
                    $scope.calcParams.reservePercent = Math.max(0, $scope.calcParams.firstCharge - 10);
                }
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
                var detourMapFactor = updateRangeCirclesCallback();
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
                var batteryLowSOC = $scope.calcParams.reservePercent;
                var usablePercent = maxSOCToUsePercent - batteryLowSOC;

                var reserveKWh = batteryLowSOC * $scope.selectedCar.battery / 100;

                function calcUsableCapacityKWh(fullCapacityKWh, usablePercent) {
                    var cap = fullCapacityKWh;
                    $scope.useableCapacityFactor = usablePercent / 100;
                    cap = cap * $scope.useableCapacityFactor;
                    return cap;
                }

                var useableCapacityKWh = calcUsableCapacityKWh(capacityKWh, usablePercent);
                tripSimulation.minutes[0].chargeKWh = calcUsableCapacityKWh(tripSimulation.minutes[0].chargeKWh,
                    $scope.calcParams.firstCharge - $scope.calcParams.brickProtectionPercent);

                while (currentDistance < $scope.totalDistance && currentMinute < maxTimeMinutes) {
                    var currentMinuteState = tripSimulation.minutes[currentMinute];
                    var nextMinuteState = {};
                    currentChargeLastsForKm = (currentMinuteState.chargeKWh - reserveKWh) / $scope.consumptionKWhPerKm;
                    nextMinuteState.minute = currentMinuteState.minute + 1;
                    if (currentMinuteState.mode === 'DRIVING') {
                        nextMinuteState.distance = currentMinuteState.distance + distanceKmPerMinute;
                        nextMinuteState.chargeKWh = currentMinuteState.chargeKWh - energyConsumptionKWhPerMinute;
                        $scope.totalEnergyConsumptionKWh += energyConsumptionKWhPerMinute + (energyConsumptionKWhPerMinute * $scope.calcParams.chargingLossPercent / 100);
                        powerPoints.push(-$scope.consumptionKWhPerKm * speedKmh);
                        var lowBatt = nextMinuteState.chargeKWh < (batteryLowSOC * $scope.selectedCar.battery / 100);
                        if (!lowBatt) {
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
                        var chargingDone = nextMinuteState.chargeKWh > maxStoredEnergykWh;
                        var chargingSufficientForTrip = currentChargeLastsForKm > (($scope.totalDistance - currentDistance) * 1.05);
                        var chargingSufficientForTime = (currentChargeLastsForKm / $scope.calcParams.drivingSpeed * 60) > (1440 - currentMinute);

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
                    $scope.dayRangeCircle.radius = $scope.calculatedDayRange * detourMapFactor;
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
                            marginTop: 120,
                            marginRight: 30,
                            height: 500,
                            zoomType: 'xy'
                        },
                        marker: {
                            enabled: false
                        },
                        states: { hover: { enabled: false } },
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
                            crosshairs: true,
                            shared: true,
                            positioner: function (labelWidth, labelHeight, point) {
                                return {
                                    x: point.plotX,
                                    y: 10
                                }
                            }
                        },
                        yAxis: {
                            max: Math.max($scope.totalDistance, 300),
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
                            marker: {
                                enabled: false
                            },
                            states: { hover: { enabled: false } },
                            tooltip: {
                                valueSuffix: ' km'
                            }
                        },
                        {
                            data: energyPoints,
                            name: 'Stored Energy [kWh]',
                            color: '#8888bb',
                            animation: false,
                            marker: {
                                enabled: false
                            },
                            states: { hover: { enabled: false } },
                            tooltip: {
                                valueSuffix: ' kWh'
                            }
                        },
                        {
                            data: powerPoints,
                            name: 'Power [kW]',
                            color: '#bb6666',
                            animation: false,
                            marker: {
                                enabled: false
                            },
                            states: { hover: { enabled: false } },
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
                //}, 0);
                //return deferred.promise;
            }
        };
    });