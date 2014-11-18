'use strict';

describe('range calculator service', function () {
    var Calculator;
    var t13plug = {
        "image": "wall_t13.jpg",
        "id": "t13",
        "mode": "2",
        "name": "T13",
        "power": [
            {
                "name": "Phase 1",
                "voltage": 230,
                "ampere": 10
            },
            {
                "name": "Phase 2",
                "voltage": 0,
                "ampere": 0
            },
            {
                "name": "Phase 3",
                "voltage": 0,
                "ampere": 0
            },
            {
                "name": "DC",
                "voltage": 0,
                "ampere": 0
            }
        ],
        "continuous": true
    };

    var supercharger = {
        "image": "tesla-supercharger.jpg",
        "id": "supercharger",
        "name": "Supercharger",
        "mode": "4",
        "power": [
            {
                "name": "Phase 1",
                "voltage": 0,
                "ampere": 0
            },
            {
                "name": "Phase 2",
                "voltage": 0,
                "ampere": 0
            },
            {
                "name": "Phase 3",
                "voltage": 0,
                "ampere": 0
            },
            {
                "name": "DC",
                "voltage": 400,
                "ampere": 330
            }
        ],
        "continuous": true
    };

    var cee32 = {
        "image": "wall_cee.jpg",
        "id": "cee32",
        "name": "CEE 32",
        "mode": "2",
        "power": [
            {
                "name": "Phase 1",
                "voltage": 230,
                "ampere": 32
            },
            {
                "name": "Phase 2",
                "voltage": 230,
                "ampere": 32
            },
            {
                "name": "Phase 3",
                "voltage": 230,
                "ampere": 32
            },
            {
                "name": "DC",
                "voltage": 0,
                "ampere": 0
            }
        ],
        "continuous": true
    };

    var tesla = {
        "onBoardChargerKW": 22,
        "battery": 85,
        "acPhases": 3
    };

    var ford = {
        "id": "focusEL",
        "onBoardChargerKW": 6.6,
        "battery": 23,
        "acPhases": 1,
        "plugs": ["t13", "schuko", "caravan", "cee16", "cee32", "type1"]
    };

    var scope = {
        calcParams: {}
    };

    beforeEach(module('car'));

    beforeEach(inject(function (_Calculator_) {
        Calculator = _Calculator_;
    }));

    describe('for a 1 phase plug and a 3 phase capable car', function () {
        it('should calculate the one phase AC charging power', function () {
            Calculator.calcChargingPowerForCar(scope, t13plug, tesla);
            expect(scope.calcParams.chargingPower).toBe(2300);
        });
    });

    describe('for a 3 phase plug and a 3 phase capable car', function () {
        it('should calculate the 3 phase AC charging power', function () {
            Calculator.calcChargingPowerForCar(scope, cee32, tesla);
            expect(scope.calcParams.chargingPower).toBe(22000);
        });
    });

    describe('for a 3 phase plug and a 1 phase capable car', function () {
        it('should calculate the 1 phase AC charging power', function () {
            Calculator.calcChargingPowerForCar(scope, cee32, ford);
            expect(scope.calcParams.chargingPower).toBe(6600);
        });
    });

});