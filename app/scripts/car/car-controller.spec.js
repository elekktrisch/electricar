'use strict';

describe('Unit: MainCtrl', function() {
    beforeEach(module('app'));

    var ctrl, scope;
    beforeEach(inject(function($controller, $rootScope) {
        scope = $rootScope.$new();
        ctrl = $controller('MainCtrl', {
            $scope: scope
        });
    }));
});