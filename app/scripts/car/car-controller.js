/*global _:false*/
'use strict';

angular.module('car')
    .controller('CarCtrl', function ($scope, $q, $log, $location, $routeParams, uiGmapGoogleMapApi, Circles, Cars, Plugs, Calculator, RangeCalculator, Settings) {
        $scope.carId = $routeParams.id;
        function queryCars() {
            return Cars.query(function (cars) {
                $scope.cars = cars;
                for (var x = 0; x < cars.length; x++) {
                    if ($routeParams.id == cars[x].id) {
                        $scope.selectedCar = cars[x];
                    }
                }
                Settings.reservePercent = 50 / $scope.selectedCar.range * 100;
                Settings.carTopSpeed = $scope.selectedCar.maxSpeed;
                return cars;
            }).$promise;
        }

        function chooseBestCharger(plugQueryResult) {
            var bestPlug = $scope.plugs[0];
            var lastPlug = bestPlug;
            var car = $scope.selectedCar;
            for (var i = 0; i < plugQueryResult.length; i++) {
                var p = plugQueryResult[i];
                if (!p.rare && Calculator.supportsPlug(p, car)) {
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
            var zurich = {latitude: 47.3712396, longitude: 8.5366015};
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(_.once(function (position) {
                    var center = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    };
                    deferred.resolve(center);
                }), function (reason) {
                    console.log(JSON.stringify(reason));
                    deferred.resolve(zurich);
                });
            } else {
                console.log('no geolocation found!');
                deferred.resolve(zurich);
            }
            return deferred.promise;
        }

        function drawMap(center) {
            uiGmapGoogleMapApi.then(function (/*maps*/) {
                $scope.map = {center: center, zoom: 5};
            });
            $scope.rangeCircle = Circles.createCircle(1, 'One-Way Range', center, '#00aaaa');
            $scope.returnCircle = Circles.createCircle(2, 'Return Range', center, '#000000');
            $scope.dayRangeCircle = Circles.createCircle(3, 'Trip Distance', center, '#6666ff');
            $scope.positionResolved = true;
            $scope.circles = [
                $scope.rangeCircle,
                $scope.returnCircle,
                $scope.dayRangeCircle
            ];
        }


        $scope.speedKmh = 70;
        $scope.numCharges = 0;
        $scope.stopDuration = 0;


        $scope.setPower = function (plug, car) {
            var chargePower = Calculator.calcChargingPowerForCar($scope, plug, car);
            Settings.chargingPower = Math.floor(chargePower / 100) / 10;
            plug.chargingPower = Settings.chargingPower;
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
            var detourMapFactor = 1000 * (1 - Settings.detourPercent / 100);
            if ($scope.rangeCircle && $scope.returnCircle && $scope.positionResolved) {
                $scope.rangeCircle.radius = $scope.calculatedRange * detourMapFactor;
                $scope.returnCircle.radius = $scope.calculatedReturnRange * detourMapFactor;
            }
            $scope.invalidateResults();
            return detourMapFactor;
        };

        $scope.invalidateResults = function () {
            if ($scope.rangeCircle && $scope.returnCircle && $scope.positionResolved) {
                $scope.dayRangeCircle.radius = 1;
            }
            $scope.resultsValid = false;
            //$scope.recalcRange();
        };

        $scope.recalcRange = function () {
            Calculator.recalcRange($scope, $scope.updateRangeCircles);
        };

        $scope.loadDailyDriving = function () {
            Settings.loadDailyDriving();
            $scope.recalcRange();
        };
        $scope.loadWeekendTrip = function () {
            Settings.loadWeekendTrip();
            $scope.recalcRange();
        };
        $scope.loadLongTrip = function () {
            Settings.loadLongTrip();
            $scope.recalcRange();
        };

        queryCars()
            .then(queryPlugs)
            .then($scope.recalcRange)
            .then(resolvePosition)
            .then(drawMap)
            .then($scope.recalcRange)
            .catch(function (reason) {
                console.log('failed to query data: ' + JSON.stringify(reason));
            });

        $scope.calcParams = Settings;
    });