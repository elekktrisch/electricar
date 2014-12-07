'use strict';

describe('range calculator service', function () {
    var Calculator, RangeCalculator;
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
        "acPhases": 3,
        "rangeParams": {
            "totalWeightKg": 2180,
            "cw": 0.24,
            "frontAreaM2": 2.34,
            "cr": 0.01,
            "averageHvacPower": 800,
            "totalEfficiency": 0.76
        }
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

    beforeEach(inject(function (_Calculator_, _RangeCalculator_) {
        Calculator = _Calculator_;
        RangeCalculator = _RangeCalculator_;
    }));

    describe('for a 1 phase plug and a 3 phase capable car', function () {
        it('should calculate the one phase AC charging power', function () {
            Calculator.calcChargingPowerForCar(scope, t13plug, tesla, 0);
            expect(scope.calcParams.chargingPower).toBe(2300);
        });
    });

    describe('for a 3 phase plug and a 3 phase capable car', function () {
        it('should calculate the 3 phase AC charging power', function () {
            Calculator.calcChargingPowerForCar(scope, cee32, tesla, 0);
            expect(scope.calcParams.chargingPower).toBe(22000);
        });
    });

    describe('for a 3 phase plug and a 1 phase capable car', function () {
        it('should calculate the 1 phase AC charging power', function () {
            Calculator.calcChargingPowerForCar(scope, cee32, ford, 0);
            expect(scope.calcParams.chargingPower).toBe(6600);
        });
    });

    describe('power consumption', function () {
        it('should be quite low for 60km/h', function () {
            var c = RangeCalculator.calcConsumption(tesla, 60, 20, 0, 0);
            expect(Math.round(c)).toBe(7);
        });
        it('should be quite high for 250km/h', function () {
            var c = RangeCalculator.calcConsumption(tesla, 250, 30, 0, 0);
            expect(Math.round(c)).toBe(176);
        });
    });

    describe('range', function () {
        it('should be quite high for 60km/h', function () {
            var r = RangeCalculator.calcRange(tesla, 80, 60, 16, 0, 0);
            expect(Math.round(r)).toBe(626);
        });
        it('should be a bit lower for cold temperatures', function () {
            var r = RangeCalculator.calcRange(tesla, 80, 60, -10, 0, 0);
            expect(Math.round(r)).toBe(399);
        });
        it('should be a bit lower for hot temperatures', function () {
            var r = RangeCalculator.calcRange(tesla, 80, 60, 40, 0, 0);
            expect(Math.round(r)).toBe(479);
        });
        it('should be average for 100kmh', function () {
            var r = RangeCalculator.calcRange(tesla, 80, 100, 20, 0, 0);
            expect(Math.round(r)).toBe(447);
        });
        it('rain should affect range', function () {
            var r = RangeCalculator.calcRange(tesla, 80, 100, 20, 40, 0);
            expect(Math.round(r)).toBe(299);
        });
        it('should be very low for 180km/h', function () {
            var r = RangeCalculator.calcRange(tesla, 80, 180, 16, 0, 0);
            expect(Math.round(r)).toBe(198);
        });
        it('should be half for half the charge', function () {
            var r = RangeCalculator.calcRange(tesla, 40, 180, 16, 0, 0);
            expect(Math.round(r)).toBe(99);
        });
    });

});