/*global _:false*/
'use strict';

angular.module('car')
    .controller('CarCtrl', function ($scope, $q, $log, $location, $routeParams, Circles, Cars, Plugs, Calculator) {
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
                $scope.calcParams.reservePercent = 50 / $scope.selectedCar.range * 100;
                return cars;
            }).$promise;
        }

        function chooseBestCharger(plugQueryResult) {
            var bestPlug = $scope.plugs[0];
            var lastPlug = bestPlug;
            var car = $scope.selectedCar;
            for (var i = 0; i < plugQueryResult.length; i++) {
                var p = plugQueryResult[i];
                if (Calculator.supportsPlug(p, car)) {
                    var lastPower = Calculator.calcChargingPowerForCar($scope, bestPlug, car);
                    var newPower = Calculator.calcChargingPowerForCar($scope, p, car);
                    if (newPower > lastPower) {
                        bestPlug = p;
                    } else if (newPower === lastPower && p.mode > lastPlug.mode) {
                        bestPlug = p;
                    }
                    lastPlug = p;
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

        $scope.supportsPlug = function (plug, car) {
            return Calculator.supportsPlug(plug, car);
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


        $scope.setPower = function (plug, car) {
            var chargePower = Calculator.calcChargingPowerForCar($scope, plug, car);
            $scope.calcParams.chargingPower = Math.floor(chargePower / 100) / 10;
            plug.chargingPower = $scope.calcParams.chargingPower;
            $scope.selectedPlug = plug;
            $scope.recalcRange();
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
            //$scope.recalcRange();
        };

        $scope.recalcRange = function () {
            Calculator.recalcRange($scope, $scope.updateRangeCircles);
        };

        $scope.calcParams = {};
        $scope.calcParams.maxBatteryChargePercent = 90;
        $scope.calcParams.maxC = 2.5;
        $scope.calcParams.chargingPower = 0;
        $scope.calcParams.firstCharge = 100;
        $scope.calcParams.drivingSpeed = 100;
        $scope.calcParams.distanceToTravel = 300;
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