/*global _:false*/
'use strict';

var car = angular.module('car');

car.constant('RANGE_CONSTANTS', {
    inCarTemperature: 21,
    airDensity: 1.25, // ρ = 1.25 kg/m^3: Luftdichte
    g: 9.81 // 9.81 m/s^2: Erdbeschleunigung
});

car.factory('RangeCalculator', function (RANGE_CONSTANTS) {
    return {
        calcConsumption: function (car, speedKmh, temperature, rain, accelerationBreakingPercent, preHeat, minuteFromStart, altitudeDifferenceM, totalDistance) {
            var p = car.rangeParams;
            if (p) {

                var initialCabinConditioningPowerW = 0;
                var maxHeaterPowerW = 6000;
                if (!preHeat && minuteFromStart && minuteFromStart < 20) {
                    initialCabinConditioningPowerW = Math.abs(temperature - RANGE_CONSTANTS.inCarTemperature) * 250;
                }
                var hvacFactor = Math.abs(temperature - RANGE_CONSTANTS.inCarTemperature) * 1.3;
                var hvacPowerW = Math.min(maxHeaterPowerW, (hvacFactor * p.averageHvacPower / 5) + initialCabinConditioningPowerW);

                var speedMs = speedKmh / 3600 * 1000;
                rain = rain || 0;
                var rainDragFactor = 1 + rain / 80;

                var airDrag = 0.5 * RANGE_CONSTANTS.airDensity * p.frontAreaM2 * p.cw * Math.pow(speedMs, 3);
                var rollDrag = p.cr * p.totalWeightKg * RANGE_CONSTANTS.g * speedMs;
                var drivingPowerW = initialCabinConditioningPowerW + hvacPowerW + ((airDrag + rollDrag) * rainDragFactor / p.totalEfficiency);

                var drivingPowerKW = drivingPowerW / 1000 * (accelerationBreakingPercent) / 100;
                //console.log('POWER: ' + Math.round(drivingPowerKW) + 'kW');

                var altDiffInOneMin = this.calcAltitudeDifferenceForMinute(speedKmh, altitudeDifferenceM, totalDistance);
                var potentialEnergyJoule = (p.totalWeightKg + 200) * RANGE_CONSTANTS.g * altDiffInOneMin;
                var potentialEnergyKWh = potentialEnergyJoule / 3600000;
                var uphillPowerKW = Math.max(-60, potentialEnergyKWh * 60) * Math.pow(accelerationBreakingPercent / 100, 2);

                return drivingPowerKW + uphillPowerKW;
            }
            return 1000;
        },

        calcRange: function (car, useableChargeKWh, speedKmh, consumptionkW) {
            var sustainableForNumHours = useableChargeKWh / consumptionkW;
            var rangeKm = sustainableForNumHours * speedKmh;
            //console.log('RANGE: ' + Math.round(rangeKm) + 'km');
            return rangeKm;
        },

        calcAltitudeDifferenceForMinute: function(speedKmh, altitudeDifferenceTotalM, totalDistanceKm) {
            var totalDistanceM = totalDistanceKm * 1000;
            var distanceInOneMinuteM = speedKmh / 60 * 1000;
            return altitudeDifferenceTotalM * distanceInOneMinuteM / totalDistanceM;
        }
    }
});

car.factory('Calculator', function (RangeCalculator) {
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
            if (car.onBoardChargerKW
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
            //console.log('============calculating range...');
            //var deferred = $q.defer();
            $scope.calculating = true;
            if ($scope.calcParams.reservePercent > $scope.calcParams.maxBatteryChargePercent) {
                $scope.calcParams.reservePercent = Math.max(0, $scope.calcParams.maxBatteryChargePercent - 10);
            }
            if ($scope.calcParams.reservePercent > $scope.calcParams.firstCharge) {
                $scope.calcParams.reservePercent = Math.max(0, $scope.calcParams.firstCharge - 10);
            }
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

            var speedKmh = $scope.calcParams.drivingSpeed;
            var chargeKW = $scope.calcParams.chargingPower;
            var capacityKWh = car.battery;
            var maxSOC = $scope.calcParams.maxBatteryChargePercent / 100;
            var maxStoredEnergykWh = maxSOC * car.battery;
            var distanceKmPerMinute = speedKmh / 60;

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

            var batteryLowSOC = $scope.calcParams.reservePercent + $scope.calcParams.brickProtectionPercent;
            var reserveKWh = batteryLowSOC * $scope.selectedCar.battery / 100;
            tripSimulation.minutes[0].chargeKWh = capacityKWh * $scope.calcParams.firstCharge / 100;
            //console.log('first charge: ' + Math.round(firstChargeKWh) + 'kWh');
            $scope.numStops = 0;

            while (currentDistance < $scope.totalDistance && currentMinute < maxTimeMinutes) {
                var consumptionkW = RangeCalculator.calcConsumption(car,
                    $scope.speedKmh,
                    $scope.calcParams.temperature,
                    $scope.calcParams.rain,
                    $scope.calcParams.accelerationBreaking,
                    $scope.calcParams.preHeatCabin,
                    currentMinute,
                    $scope.calcParams.altitudeDifferenceM,
                    $scope.totalDistance
                );
                $scope.consumptionKWhPerKm = consumptionkW / speedKmh;

                var energyConsumptionKWhPerMinute = consumptionkW / 60;

                var currentMinuteState = tripSimulation.minutes[currentMinute];
                var nextMinuteState = {};
                currentChargeLastsForKm = RangeCalculator.calcRange(car,
                    currentMinuteState.chargeKWh - reserveKWh,
                    speedKmh,
                    consumptionkW
                );
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
                        var f3 = Math.pow(10, potent) * Math.max(1, car.onBoardChargerKW / chargeKW * 10);
                        var fx = 0.3 * f2;
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
            $scope.totalConsumptionPerKm = $scope.totalEnergyConsumptionKWh * 1000 / $scope.totalDistance;
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
                    states: {hover: {enabled: false}},
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
                        states: {hover: {enabled: false}},
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
                        states: {hover: {enabled: false}},
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
                        states: {hover: {enabled: false}},
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