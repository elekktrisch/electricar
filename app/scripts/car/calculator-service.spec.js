import {Calculator, RangeCalculator, RANGE_CONSTANTS} from "./calculator-service";

const rangeCalculator = RangeCalculator.factory(RANGE_CONSTANTS);
const calculator = Calculator.factory(rangeCalculator, RANGE_CONSTANTS);

describe('range calculator service', function () {
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

    describe('for a 1 phase plug and a 3 phase capable car', function () {
        it('should calculate the one phase AC charging power', function () {
            calculator.calcChargingPowerForCar(scope, t13plug, tesla, 0);
            expect(scope.calcParams.chargingPower).toBe(2300);
        });
    });

    describe('for a 3 phase plug and a 3 phase capable car', function () {
        it('should calculate the 3 phase AC charging power', function () {
            calculator.calcChargingPowerForCar(scope, cee32, tesla, 0);
            expect(scope.calcParams.chargingPower).toBe(22000);
        });
    });

    describe('for a 3 phase plug and a 1 phase capable car', function () {
        it('should calculate the 1 phase AC charging power', function () {
            calculator.calcChargingPowerForCar(scope, cee32, ford, 0);
            expect(scope.calcParams.chargingPower).toBe(6600);
        });
    });

    describe('power consumption', function () {
        it('should be quite low for 60km/h', function () {
            //car, speedKmh, temperature, rain, accelerationBreakingPercent, preHeat, minuteFromStart, altitudeDifferenceM, totalDistance
            var c = rangeCalculator.calcConsumption(tesla, 60, 20, 0, 100, true, 1, 0, 100);
            expect(Math.round(c.totalKW)).toBe(7);
        });
        it('should be quite high for 250km/h', function () {
            var c = rangeCalculator.calcConsumption(tesla, 250, 30, 0, 100, true, 1, 0, 100);
            expect(Math.round(c.totalKW)).toBe(176);
        });
    });

    xdescribe('range', function () {
        it('should be quite high for 60km/h', function () {
            var r = rangeCalculator.calcRange(tesla, 80, 60, 16);
            expect(Math.round(r)).toBe(598);
        });
        it('should be a bit lower for cold temperatures', function () {
            var r = rangeCalculator.calcRange(tesla, 80, 60, -10);
            expect(Math.round(r)).toBe(374);
        });
        it('should be a bit lower for hot temperatures', function () {
            var r = rangeCalculator.calcRange(tesla, 80, 60, 40);
            expect(Math.round(r)).toBe(421);
        });
        it('should be average for 100kmh', function () {
            var r = rangeCalculator.calcRange(tesla, 80, 100, 20);
            expect(Math.round(r)).toBe(446);
        });
        it('rain should affect range', function () {
            var r = rangeCalculator.calcRange(tesla, 80, 100, 20);
            expect(Math.round(r)).toBe(298);
        });
        it('should be very low for 180km/h', function () {
            var r = rangeCalculator.calcRange(tesla, 80, 180, 16);
            expect(Math.round(r)).toBe(197);
        });
        it('should be half for half the charge', function () {
            var r = rangeCalculator.calcRange(tesla, 40, 180, 16, 0);
            expect(Math.round(r)).toBe(99);
        });
    });

    describe('altitude difference', function () {
        it('should low for slow speed', function () {
            var alt = rangeCalculator.calcAltitudeDifferenceForMinute(10, 1000, 500);
            expect(Math.round(alt * 1000) / 1000).toBe(0.333);
        });
        it('should high for high speed', function () {
            var alt = rangeCalculator.calcAltitudeDifferenceForMinute(100, 1000, 500);
            expect(Math.round(alt * 1000) / 1000).toBe(3.333);
        });
        it('default example', function () {
            var alt = rangeCalculator.calcAltitudeDifferenceForMinute(90, 500, 300);
            expect(Math.round(alt * 1000) / 1000).toBe(2.5);
        });
    });
});