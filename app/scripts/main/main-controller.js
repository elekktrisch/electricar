import "angular-ui-bootstrap";

export class MainCtrl {
    constructor($scope, $location, DomainInfo) {
        $scope.loading = false;
        $scope.titlePrefix = DomainInfo.titlePrefix();
        $scope.titlePostfix = DomainInfo.titlePostfix();

        let cars = require("../data/cars.json");
        $scope.cars = _.sortBy(cars, ['battery']).reverse();
        $scope.carsSortedByName = _.sortBy(cars, ['name']);

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

