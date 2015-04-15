/*global $:false*/
'use strict';

var car = angular.module('car');

car.constant('RANGE_CONSTANTS', {
    inCarTemperature: 21,
    appliancesPowerKW: 0.5,
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
                var rollDrag = p.cr * p.totalWeightKg * RANGE_CONSTANTS.g * speedMs * rainDragFactor;
                var drivingPowerW = initialCabinConditioningPowerW + hvacPowerW + ((airDrag + rollDrag) / p.totalEfficiency);

                var drivingPowerKW = drivingPowerW / 1000 * accelerationBreakingPercent / 100;
                if(car.options && car.options.extras) {
                    for (var i = 0; i < car.options.extras.length; i++) {
                        var extra = car.options.extras[i];
                        if(extra.selected) {
                            drivingPowerKW = drivingPowerKW * extra.consumptionFactor;
                        }
                    }
                }
                //console.log('POWER: ' + Math.round(drivingPowerKW) + 'kW');

                var altDiffInOneMin = this.calcAltitudeDifferenceForMinute(speedKmh, altitudeDifferenceM, totalDistance);
                var potentialEnergyJoule = (p.totalWeightKg + 200) * RANGE_CONSTANTS.g * altDiffInOneMin;
                var potentialEnergyKWh = potentialEnergyJoule / 3600000;
                var correctionFactor = 1.3;
                var uphillPowerKW = Math.max(-60, potentialEnergyKWh * 60) * Math.pow(accelerationBreakingPercent / 100, 2) * correctionFactor;

                return {
                    hvacPowerW: hvacPowerW,
                    airDragW: airDrag,
                    rollDragW: rollDrag,
                    uphillPowerW: uphillPowerKW * 1000,
                    totalKW: drivingPowerKW + uphillPowerKW
                };
            }
            return 1000;
        },

        calcRange: function (car, useableChargeKWh, speedKmh, consumptionkW) {
            var sustainableForNumHours = useableChargeKWh / consumptionkW;
            var rangeKm = sustainableForNumHours * speedKmh;
            //console.log('RANGE: ' + Math.round(rangeKm) + 'km');
            return rangeKm;
        },

        calcAltitudeDifferenceForMinute: function (speedKmh, altitudeDifferenceTotalM, totalDistanceKm) {
            var totalDistanceM = totalDistanceKm * 1000;
            var distanceInOneMinuteM = speedKmh / 60 * 1000;
            return altitudeDifferenceTotalM * distanceInOneMinuteM / totalDistanceM;
        }
    };
});

car.factory('Calculator', function (RangeCalculator, RANGE_CONSTANTS) {
    return {
        trip: {
            fullCharges: {
                count: 0,
                minutesPerCharge: 0
            },
            lastChargeMinutes: 0
        },

        getOnboardChargerPower: function (car) {
            var onBoardChargerKW = car.onBoardChargerKW;
            if (car.options && car.options.chargers) {
                var chargers = car.options.chargers;
                for (var i = 0; i < chargers.length; i++) {
                    var charger = chargers[i];
                    if (charger.selected && charger.onBoardChargerKW > onBoardChargerKW) {
                        onBoardChargerKW = charger.onBoardChargerKW;
                    }
                }
            }
            return onBoardChargerKW;
        },

        getNumSupportedAcPhases: function (car) {
            var acPhases = car.acPhases;
            if (car.options && car.options.chargers) {
                var chargers = car.options.chargers;
                for (var i = 0; i < chargers.length; i++) {
                    var charger = chargers[i];
                    if (charger.selected && charger.acPhases > acPhases) {
                        acPhases = charger.acPhases;
                    }
                }
            }
            return acPhases;
        },

        calcChargingPowerForCar: function ($scope, plug, car) {
            var chargePower = 0;
            for (var i = 0; i < plug.power.length; i++) {
                var p = plug.power[i];
                var acPhases = this.getNumSupportedAcPhases(car);
                if (plug.power[i].name === 'DC' || i < acPhases) {
                    chargePower += (p.voltage * p.ampere);
                }
            }
            if (!plug.continuous) {
                chargePower = chargePower * 0.8;
            }
            var onBoardChargerKW = this.getOnboardChargerPower(car);
            if (onBoardChargerKW &&
                plug.mode < 4 &&
                chargePower > (1000 * onBoardChargerKW)) {
                chargePower = onBoardChargerKW * 1000;
            }
            $scope.calcParams.chargingPower = chargePower;
            return chargePower;
        },

        supportsPlug: function (plug, car) {
            var i;
            for (i = 0; i < car.plugs.length; i++) {
                if (car.plugs[i] === plug.id) {
                    return true;
                }
            }
            if (car.options && car.options.chargers) {
                var chargers = car.options.chargers;
                for (i = 0; i < chargers.length; i++) {
                    if (chargers[i].plug === plug.id) {
                        return chargers[i].selected === true;
                    }
                }
            }
            return false;
        },

        getBatteryCapacity: function (car) {
            var capacityKWh = (car.useableBatteryKw || car.battery);
            if (car.options && car.options.batteries) {
                for (var i = 0; i < car.options.batteries.length; i++) {
                    var battery = car.options.batteries[i];
                    if (battery.selected && battery.capacityKw > capacityKWh) {
                        capacityKWh = battery.capacityKw;
                    }
                }
            }
            return capacityKWh;
        },

        recalcRange: function ($scope, updateRangeCirclesCallback) {
            //console.log('============calculating range...');
            //var deferred = $q.defer();
            $scope.firstChargeRange = undefined;
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
            var capacityKWh = this.getBatteryCapacity(car);
            var maxSOC = $scope.calcParams.maxBatteryChargePercent / 100;
            var maxStoredEnergykWh = maxSOC * capacityKWh;
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

            $scope.consumptionTotals = {
                hvacPowerW: 0,
                airDragW: 0,
                rollDragW: 0,
                uphillPowerW: 0,
                totalKW: 0
            };

            var nextMinuteState = {};
            while (currentDistance < $scope.totalDistance && currentMinute < maxTimeMinutes) {
                var consumption = RangeCalculator.calcConsumption(car,
                    $scope.speedKmh,
                    $scope.calcParams.temperature,
                    $scope.calcParams.rain,
                    $scope.calcParams.accelerationBreaking,
                    $scope.calcParams.preHeatCabin,
                    currentMinute,
                    $scope.calcParams.altitudeDifferenceM,
                    $scope.totalDistance
                );
                $scope.consumptionTotals.hvacPowerW += consumption.hvacPowerW;
                $scope.consumptionTotals.airDragW += consumption.airDragW;
                $scope.consumptionTotals.rollDragW += consumption.rollDragW;
                $scope.consumptionTotals.uphillPowerW += consumption.uphillPowerW;
                $scope.consumptionTotals.totalKW += consumption.totalKW;

                $scope.consumptionKWhPerKm = consumption.totalKW / speedKmh;

                var energyConsumptionKWhPerMinuteAppliances = RANGE_CONSTANTS.appliancesPowerKW / 60;
                var energyConsumptionKWhPerMinute = (consumption.totalKW / 60) + energyConsumptionKWhPerMinuteAppliances;

                var currentMinuteState = tripSimulation.minutes[currentMinute];
                currentChargeLastsForKm = RangeCalculator.calcRange(car,
                    currentMinuteState.chargeKWh - reserveKWh,
                    speedKmh,
                    consumption.totalKW
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
                        if ($scope.numStops === 0) {
                            $scope.firstChargeRange = nextMinuteState.distance;
                        }
                        nextMinuteState.mode = 'CHARGING';
                        $scope.numStops++;
                    }
                } else {
                    nextMinuteState.distance = currentMinuteState.distance;
                    var SOC = currentMinuteState.chargeKWh / capacityKWh;
                    var C = chargeKW / capacityKWh;
                    var energyPerMinute = C * capacityKWh / 60;
                    var maxC = $scope.calcParams.maxC;
                    if (C > 0.5) {
                        var easeOffC = C;
                        if(SOC > 0.5) {
                            easeOffC = C * (0.5 / SOC);

                            energyPerMinute = Math.min(easeOffC * capacityKWh, chargeKW) / 60;
                        }
                        console.log('minute ' + currentMinute + ', SOC: ' + SOC + ', easeOffC: ' + easeOffC);
                    }
                    energyPerMinute = Math.min(energyPerMinute, maxC * capacityKWh / 60);
                    energyPerMinute = energyPerMinute - (energyPerMinute * $scope.calcParams.chargingLossPercent / 100);
                    nextMinuteState.chargeKWh = currentMinuteState.chargeKWh + energyPerMinute;
                    var chargingDone = nextMinuteState.chargeKWh > maxStoredEnergykWh;
                    var chargingSufficientForTrip = currentChargeLastsForKm > (($scope.totalDistance - currentDistance) * 1.05);
                    var chargingSufficientForTime = (currentChargeLastsForKm / $scope.calcParams.drivingSpeed * 60) > (1440 - currentMinute);

                    if (chargingDone ||
                        chargingSufficientForTrip ||
                        chargingSufficientForTime) {
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
            $scope.toKwh = function (powerW) {
                return powerW / 1000 / 60;
            };

            $scope.consumptionChartConfig = {
                options: {
                    chart: {
                        animation: false,
                        type: 'bar',
                        height: 150,
                        backgroundColor: 'rgba(255,255,255,0.0)'
                    },
                    exporting: {
                        enabled: false
                    },
                    title: {
                        text: ''
                    },
                    xAxis: {
                        enabled: false,
                        categories: ['']
                    },
                    yAxis: {
                        min: -30,
                        tickInterval: 10,
                        title: {
                            text: ''
                        }
                    },
                    tooltip: {
                        pointFormat: '<span>{series.name}</span>: {point.y:.0f}kWh ({point.percentage:.0f}%)<br/>',
                        style: {
                            color: '#333333',
                            fontSize: '10px',
                            padding: '2px',
                            margin: 0
                        },
                        borderColor: 'black',
                        headerFormat: ''
                    },
                    labels: {
                        enabled: true
                    },
                    plotOptions: {
                        bar: {
                            stacking: 'percent',
                            borderColor: 'rgba(255,255,255,0.0)'
                        }
                    }
                },
                series: [{
                    name: 'Cabin Conditioning',
                    color: '#df724c',
                    animation: false,
                    data: [$scope.toKwh($scope.consumptionTotals.hvacPowerW)]
                }, {
                    name: 'Air Drag',
                    color: '#444488',
                    animation: false,
                    data: [$scope.toKwh($scope.consumptionTotals.airDragW)]
                }, {
                    name: 'Roll Drag',
                    color: '#555555',
                    animation: false,
                    data: [$scope.toKwh($scope.consumptionTotals.rollDragW)]
                }, {
                    name: 'Altitude Difference',
                    color: '#30a893',
                    animation: false,
                    data: [$scope.toKwh($scope.consumptionTotals.uphillPowerW)]
                }]
            };

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
                            };
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
                        data: powerPoints,
                        name: 'Power [kW]',
                        color: '#8888bb',
                        animation: false,
                        lineWidth: 1,
                        marker: {
                            enabled: false
                        },
                        states: {hover: {enabled: false}},
                        tooltip: {
                            valueSuffix: ' kW'
                        }
                    },
                    {
                        data: energyPoints,
                        name: 'Stored Energy [kWh]',
                        color: '#bb6666',
                        animation: false,
                        marker: {
                            enabled: false
                        },
                        states: {hover: {enabled: false}},
                        tooltip: {
                            valueSuffix: ' kWh'
                        }
                    }
                ],
                //Title configuration (optional)
                title: {
                    text: ''
                }
            };
            $scope.calculating = false;
            //}, 0);
            //return deferred.promise;
        }
    };
});