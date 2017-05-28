import "angular-ui-bootstrap";

export class MainCtrl {
    constructor($scope, $location, DomainInfo) {
        $scope.loading = false;
        $scope.discontinuedStamp = require("../../images/discontinued-stamp.png");
        $scope.comingSoonStamp = require("../../images/coming_soon_stamp.png");
        $scope.limitedStockStamp = require("../../images/limited-stock.png");
        $scope.titlePrefix = DomainInfo.titlePrefix();
        $scope.titlePostfix = DomainInfo.titlePostfix();

        $scope.cars = _.sortBy(require("../data/cars.json"), ['battery']).reverse();
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
    }
}

