
export class MainCtrl {
    constructor($scope, $location, DomainInfo) {
        $scope.loading = false;
        $scope.discontinuedStamp = require("../../images/discontinued-stamp.png");
        $scope.comingSoonStamp = require("../../images/coming_soon_stamp.png");
        $scope.limitedStockStamp = require("../../images/limited-stock.png");
        $scope.titlePrefix = DomainInfo.titlePrefix();
        $scope.titlePostfix = DomainInfo.titlePostfix();

        $scope.filterActive = false;

        $scope.cars = _.sortBy(require("../data/cars.json"), ['battery']).reverse();
        $scope.allCars = [];
        angular.copy($scope.cars, $scope.allCars);
        for(let i = 0; i < $scope.cars.length; i++) {
            let car = $scope.cars[i];
            car.logoPath = require("../../images/logos/" + car.logo);
            car.imagePath = require("../../images/" + car.image);
        }

        $scope.carsSortedByName = _.sortBy($scope.cars, ['name']);

        $scope.select = function (car) {
            if (car.rangeParams) {
                $location.path('/car/' + car.id);
            }
        };

        $scope.isPath = function (path) {
            return $location.path().indexOf(path) !== -1;
        };

        $scope.toggleWidelyAvailable = function() {
            if(!$scope.filterActive) {
                $scope.cars = _.filter($scope.allCars, function (car) {
                    return !car.soon && !car.discontinued && !car.limited;
                });
                $scope.filterActive = true;
            } else {
                angular.copy($scope.allCars, $scope.cars);
                $scope.filterActive = false;
            }
        }
    }
}

