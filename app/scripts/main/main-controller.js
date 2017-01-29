export class MainCtrl {
    constructor($scope, $location, Cars, DomainInfo) {
        $scope.titlePrefix = DomainInfo.titlePrefix();
        $scope.titlePostfix = DomainInfo.titlePostfix();

        Cars.query(function (cars) {
            $scope.cars = _.sortBy(cars, ['battery']).reverse();
            $scope.carsSortedByName = _.sortBy(cars, ['name']);
        }, function (reason) {
            console.log('failed to load cars: ' + JSON.stringify(reason));
        });

        $scope.select = function (car) {
            $location.path('/car/' + car.id);
        };

        $scope.isPath = function(path) {
            return $location.path().indexOf(path) !== -1;
        };
    }
}

