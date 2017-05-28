export class CarCtrl {
    constructor($scope, $q, $location, $routeParams, /*uiGmapGoogleMapApi,*/ Circles, Calculator, Settings) {
        $scope.carId = $routeParams.id;
        $scope.googleMapsUrl = "https://maps.googleapis.com/maps/api/js?key=AIzaSyDQAddfsGAlCCbkoevn5OF1JD2HbeVN9fQ";
        function queryCars() {
            let cars = require("../data/cars.json");
            $scope.cars = _.sortBy(cars, ['battery']);
            for (let x = 0; x < cars.length; x++) {
                if ($routeParams.id === cars[x].id) {
                    $scope.selectedCar = cars[x];
                    if (!$scope.selectedCar.rangeParams) {
                        $location.path("/main");
                    }
                    $scope.selectedCarImage = require(`../../images/${$scope.selectedCar.image}`);
                }
            }
            Settings.reservePercent = 50 / $scope.selectedCar.range * 100;
            Settings.carTopSpeed = $scope.selectedCar.maxSpeed;
            return Promise.resolve($scope.cars);
        }

        function chooseBestCharger(plugQueryResult) {
            let bestPlug = $scope.plugs[0];
            let lastPlug = bestPlug;
            let car = $scope.selectedCar;
            for (let i = 0; i < plugQueryResult.length; i++) {
                let p = plugQueryResult[i];
                let chargePower = Calculator.calcChargingPowerForCar($scope, p, car);
                p.chargingPower = Math.floor(chargePower / 100) / 10;

                if (!p.rare && Calculator.supportsPlug(p, car)) {
                    let lastPower = Calculator.calcChargingPowerForCar($scope, bestPlug, car);
                    let newPower = Calculator.calcChargingPowerForCar($scope, p, car);
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
            $scope.plugs = require("../data/plugs.json");
            $scope.setPower(chooseBestCharger($scope.plugs), $scope.selectedCar);
            return Promise.resolve($scope.plugs);
        }

        $scope.overview = function () {
            $location.path('/main');
        };

        $scope.select = function (car) {
            $location.path('/car/' + car.id);
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
            let deferred = $q.defer();
            let zurich = {latitude: 47.3712396, longitude: 8.5366015};
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(_.once(function (position) {
                    let center = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    };
                    deferred.resolve([center.latitude, center.longitude]);
                }), function (reason) {
                    console.log(JSON.stringify(reason));
                    deferred.resolve([zurich.latitude, zurich.longitude]);
                });
            } else {
                console.log('no geolocation found!');
                deferred.resolve([zurich.latitude, zurich.longitude]);
            }
            return deferred.promise;
        }

        function drawMap(center) {
            $scope.rangeCircle = Circles.createCircle(1, 'One-Way Range', center, '#00aaaa');
            $scope.returnCircle = Circles.createCircle(2, 'Return Range', center, '#000000');
            $scope.dayRangeCircle = Circles.createCircle(3, 'Trip Distance', center, '#6666ff');
            $scope.positionResolved = true;
            $scope.circles = [
                $scope.rangeCircle,
                $scope.returnCircle,
                $scope.dayRangeCircle
            ];
            $scope.map = {center: center, zoom: 5};
        }


        $scope.speedKmh = 70;
        $scope.numCharges = 0;
        $scope.stopDuration = 0;


        $scope.setPower = (plug) => {
            $scope.selectedPlug = plug;
            Settings.chargingPower = plug.chargingPower;
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
            let detourMapFactor = 1000 * (1 - Settings.detourPercent / 100);
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

        $scope.recalcChargingAndRange = function () {
            queryPlugs()
                .then($scope.recalcRange);
        };

        queryCars()
            .then($scope.recalcChargingAndRange)
            .then(resolvePosition)
            .then(drawMap)
            .then($scope.recalcRange)
            .catch(function (reason) {
                console.log('failed to query data: ' + JSON.stringify(reason));
            });

        $scope.calcParams = Settings;
    }
}