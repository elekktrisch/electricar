'use strict';

angular.module('car')
    .controller('CarCtrl', function ($scope, $location, $routeParams, Circles, Cars, Plugs) {
        var i = 0;
        $scope.realityFactor = 0.8;

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
            var distancePoints = [];
            var car = $scope.selectedCar;
            $scope.calculatedRange = car.range * $scope.realityFactor;
            $scope.calculatedReturnRange = car.range * $scope.realityFactor / 2;
            $scope.rangeCircle.setRadius($scope.calculatedRange * 1000);
            $scope.returnCircle.setRadius($scope.calculatedReturnRange * 1000);
            $scope.rangeCircle.setMap($scope.map);
            $scope.returnCircle.setMap($scope.map);

            if (!car.chargePower) {
                car.chargePower = 0;
            }

            var currentMinute;
            var maxMinutes = 600;
            var speedKmh = 80;
            var chargeKW = car.chargePower;
            var capacityKWh = car.battery;
            var fillupPercent = 80;
            var distanceKmPerMinute = speedKmh / 60;
            var consumptionKWhPerKm = car.battery / car.range;
            var energyConsumptionKWhPerMinute = consumptionKWhPerKm * distanceKmPerMinute;

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

            for(currentMinute = 0; currentMinute < maxMinutes; currentMinute++) {
                var currentMinuteState = tripSimulation.minutes[currentMinute];
                var nextMinuteState = {};
                nextMinuteState.minute = currentMinuteState.minute + 1;
                if(currentMinuteState.mode === 'DRIVING') {
                    nextMinuteState.distance = currentMinuteState.distance + distanceKmPerMinute;
                    nextMinuteState.chargeKWh = currentMinuteState.chargeKWh - energyConsumptionKWhPerMinute;
                    if(nextMinuteState.chargeKWh > 0) {
                        nextMinuteState.mode = 'DRIVING';
                    } else {
                        nextMinuteState.mode = 'CHARGING';
                    }
                } else {
                    nextMinuteState.distance = currentMinuteState.distance;
                    nextMinuteState.chargeKWh = currentMinuteState.chargeKWh + (chargeKW / 60);
                    if(nextMinuteState.chargeKWh >= (capacityKWh * fillupPercent / 100)) {
                        nextMinuteState.mode = 'DRIVING';
                    } else {
                        nextMinuteState.mode = 'CHARGING';
                    }
                }
                console.log(JSON.stringify(nextMinuteState));
                tripSimulation.minutes.push(nextMinuteState);
                distancePoints.push(nextMinuteState.distance);
            }

            if(car.chargePower) {
            $scope.calculatedDayRange = nextMinuteState.distance;
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
                        marginRight: 30
                    },
                    tooltip: {
                        style: {
                            padding: 10,
                            fontWeight: 'bold'
                        }
                    },
                    yAxis: {
                        min: 0,
                        max: 1000,
                        tickInterval: 100,
                        title: {text:'Distance [km]'}
                    },
                    xAxis: {
                        tickInterval: 60,
                        title:  {text:'Time [min]'}
                    },
                    legend: {
                        enabled: false
                    }
                },

                //The below properties are watched separately for changes.

                //Series object (optional) - a list of series using normal highcharts series options.
                series: [{
                    data: distancePoints,
                    color: 'black',
                    animation: false
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
        };

        queryCars()
            .then(queryPlugs)
            .then($scope.recalcRange)
            .catch(function(reason){
                console.log('failed to query data: ' + JSON.stringify(reason));
            });


    });