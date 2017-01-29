import * as angular from "angular";
import "angular-mocks";

describe('Unit: MainCtrl', function () {
    beforeEach(angular.mock.module('app'));

    var ctrl, scope;
    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        ctrl = $controller('MainCtrl', {
            $scope: scope
        });
    }));
});