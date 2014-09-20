'use strict';

angular.module('main')
    .controller('MainCtrl', function ($scope, $window, $location, $anchorScroll) {
        var i = 0;
        $scope.realityFactor = 0.7;
        $scope.plugs = [
            {
                image: 'wall_t15.jpg',
                id: 't15',
                name: 'T15',
                power: [
                    {
                        name: 'Phase 1',
                        voltage: 230,
                        ampere: 10
                    },
                    {
                        name: 'Phase 2',
                        voltage: 0,
                        ampere: 0
                    },
                    {
                        name: 'Phase 3',
                        voltage: 0,
                        ampere: 0
                    },
                    {
                        name: 'DC',
                        voltage: 0,
                        ampere: 0
                    }
                ],
                continuous: false
            },
            {
                image: 'wall_schuko.jpg',
                id: 'schuko',
                name: 'Schuko',
                power: [
                    {
                        name: 'Phase 1',
                        voltage: 230,
                        ampere: 16
                    },
                    {
                        name: 'Phase 2',
                        voltage: 0,
                        ampere: 0
                    },
                    {
                        name: 'Phase 3',
                        voltage: 0,
                        ampere: 0
                    },
                    {
                        name: 'DC',
                        voltage: 0,
                        ampere: 0
                    }
                ],
                continuous: false
            },
            {
                image: 'wall_cee.jpg',
                id: 'cee16',
                name: 'CEE 16',
                power: [
                    {
                        name: 'Phase 1',
                        voltage: 230,
                        ampere: 16
                    },
                    {
                        name: 'Phase 2',
                        voltage: 230,
                        ampere: 16
                    },
                    {
                        name: 'Phase 3',
                        voltage: 230,
                        ampere: 16
                    },
                    {
                        name: 'DC',
                        voltage: 0,
                        ampere: 0
                    }
                ],
                continuous: true
            },
            {
                image: 'wall_cee.jpg',
                id: 'cee32',
                name: 'CEE 32',
                power: [
                    {
                        name: 'Phase 1',
                        voltage: 230,
                        ampere: 32
                    },
                    {
                        name: 'Phase 2',
                        voltage: 230,
                        ampere: 32
                    },
                    {
                        name: 'Phase 3',
                        voltage: 230,
                        ampere: 32
                    },
                    {
                        name: 'DC',
                        voltage: 0,
                        ampere: 0
                    }
                ],
                continuous: true
            },
            {
                image: 'auto_type1.jpg',
                id: 'type1',
                name: 'Type 1',
                power: [
                    {
                        name: 'Phase 1',
                        voltage: 230,
                        ampere: 32
                    },
                    {
                        name: 'Phase 2',
                        voltage: 230,
                        ampere: 32
                    },
                    {
                        name: 'Phase 3',
                        voltage: 230,
                        ampere: 32
                    },
                    {
                        name: 'DC',
                        voltage: 0,
                        ampere: 0
                    }
                ],
                continuous: true
            },
            {
                image: 'wall_type2.jpg',
                id: 'type2',
                name: 'Type 2',
                power: [
                    {
                        name: 'Phase 1',
                        voltage: 230,
                        ampere: 32
                    },
                    {
                        name: 'Phase 2',
                        voltage: 230,
                        ampere: 32
                    },
                    {
                        name: 'Phase 3',
                        voltage: 230,
                        ampere: 32
                    },
                    {
                        name: 'DC',
                        voltage: 0,
                        ampere: 0
                    }
                ],
                continuous: true
            },
            {
                image: 'auto_chademo.jpg',
                id: 'chademo',
                name: 'CHAdeMO',
                power: [
                    {
                        name: 'Phase 1',
                        voltage: 0,
                        ampere: 0
                    },
                    {
                        name: 'Phase 2',
                        voltage: 0,
                        ampere: 0
                    },
                    {
                        name: 'Phase 3',
                        voltage: 0,
                        ampere: 0
                    },
                    {
                        name: 'DC',
                        voltage: 400,
                        ampere: 125
                    }
                ],
                continuous: true
            },
            {
                image: 'auto_ccs.jpg',
                id: 'ccs',
                name: 'CCS',
                power: [
                    {
                        name: 'Phase 1',
                        voltage: 0,
                        ampere: 0
                    },
                    {
                        name: 'Phase 2',
                        voltage: 0,
                        ampere: 0
                    },
                    {
                        name: 'Phase 3',
                        voltage: 0,
                        ampere: 0
                    },
                    {
                        name: 'DC',
                        voltage: 400,
                        ampere: 125
                    }
                ],
                continuous: true
            },
            {
                image: 'tesla-supercharger.jpg',
                id: 'supercharger',
                name: 'Supercharger',
                power: [
                    {
                        name: 'Phase 1',
                        voltage: 0,
                        ampere: 0
                    },
                    {
                        name: 'Phase 2',
                        voltage: 0,
                        ampere: 0
                    },
                    {
                        name: 'Phase 3',
                        voltage: 0,
                        ampere: 0
                    },
                    {
                        name: 'DC',
                        voltage: 400,
                        ampere: 330
                    }
                ],
                continuous: true
            }
        ];

        $scope.cars = [
            {
                id: i++,
                name: 'BMW i3',
                range: 190,
                battery: 18.8,
                acceleration: 7.2,
                maxSpeed: 150,
                plugs: ['t15', 'schuko', 'type2', 'ccs'],
                image: 'bmwi3.jpg',
                logo: 'bmw.png'
            },
            {
                id: i++,
                name: 'Ford Focus Electric',
                range: 162,
                battery: 23,
                acceleration: 11.4,
                maxSpeed: 137,
                plugs: ['t15', 'schuko', 'type1'],
                image: 'ford_focus.jpg',
                logo: 'ford.png'
            },
            {
                id: i++,
                name: 'smart fortwo ed',
                range: 145,
                battery: 17.6,
                acceleration: 11.5,
                maxSpeed: 125,
                plugs: ['t15', 'schuko', 'type2'],
                image: 'smart_ed.jpg'
            },
            {
                id: i++,
                name: 'Mitsubishi iMiEV',
                range: 150,
                battery: 16,
                acceleration: 15.9,
                maxSpeed: 130,
                plugs: ['t15', 'schuko', 'type1', 'chademo'],
                image: 'mitsubishi_imiev.jpg',
                logo: 'mitsubishi.png'
            },
            {
                id: i++,
                name: 'Nissan Leaf',
                range: 199,
                battery: 24,
                acceleration: 11.4,
                maxSpeed: 145,
                plugs: ['t15', 'schuko', 'type1', 'chademo'],
                image: 'nissan_leaf.jpg',
                logo: 'nissan.png'
            },
            {
                id: i++,
                name: 'Renault Kangoo Z.E.',
                range: 120,
                battery: 22,
                acceleration: 20.3,
                maxSpeed: 130,
                plugs: ['t15', 'schuko', 'type1'],
                image: 'renault_kangoo.jpg',
                logo: 'renault.png'
            },
            {
                id: i++,
                name: 'Renault ZOE',
                range: 210,
                battery: 22,
                acceleration: 13.5,
                maxSpeed: 135,
                plugs: ['t15', 'schuko', 'type2'],
                image: 'renault_zoe.jpg',
                logo: 'renault.png'
            },
            {
                id: i++,
                name: 'Tesla Model S',
                range: 502,
                battery: 85,
                acceleration: 4.2,
                maxSpeed: 210,
                plugs: ['t15', 'schuko', 'type2', 'supercharger'],
                image: 'tesla_model_s.png',
                logo: 'tesla.png'
            },
            {
                id: i++,
                name: 'VW e-Golf',
                range: 190,
                battery: 24.2,
                acceleration: 10.4,
                maxSpeed: 140,
                plugs: ['t15', 'schuko', 'type2', 'ccs'],
                image: 'vw_egolf.jpg',
                logo: 'vw.png'
            },
            {
                id: i++,
                name: 'VW e-Up',
                range: 160,
                battery: 18.7,
                acceleration: 12.4,
                maxSpeed: 130,
                plugs: ['t15', 'schuko', 'type2', 'ccs'],
                image: 'vw_eup.png',
                logo: 'vw.png'
            }
        ];

        $scope.rangeCircle = new google.maps.Circle({
            id: "circle",
            name: "circle",
            fillColor: '#0000ff',
            strokeColor: "#0000ff",
            strokeOpacity: "0.8",
            strokeWeight: "2",
            center: {lat: 47.3182, lng: 8.7956},
            radius: 1,
            editable: false
        });

        $scope.returnCircle = new google.maps.Circle({
            id: "circle",
            name: "circle",
            fillColor: '#000000',
            strokeColor: "#000000",
            strokeOpacity: "0.8",
            strokeWeight: "2",
            center: {lat: 47.3182, lng: 8.7956},
            radius: 1,
            editable: false
        });

        $scope.dayRangeCircle = new google.maps.Circle({
            id: "circle",
            name: "circle",
            fillColor: '#00FFff',
            strokeColor: "#00FFff",
            strokeOpacity: "0.8",
            strokeWeight: "2",
            center: {lat: 47.3182, lng: 8.7956},
            radius: 1,
            editable: false
        });

        $scope.maxHoursPerDay = 10;
        $scope.speedKmh = 120;
        $scope.numCharges = 0;
        $scope.stopDuration = 0;
        var calcDayRadius = function(car)
        {
            if(!car.chargePower) {
                return 0;
            }
            var realRange = car.range * $scope.realityFactor
            $scope.stopDuration = car.battery / car.chargePower;
            var chargingPerHour = car.range / $scope.stopDuration * $scope.realityFactor;
            var v1 = $scope.maxHoursPerDay*chargingPerHour;
            var v2 = realRange + v1;
            var zaehler = ($scope.speedKmh*v2);
            var nenner = (realRange*(chargingPerHour+($scope.speedKmh*1)));
            $scope.numCharges = zaehler / nenner;
            var dayRadius = $scope.numCharges * realRange;
            $scope.numStops = Math.max(Math.ceil($scope.numCharges) - 1, 0);
            if($scope.numCharges > 1) {
                $scope.lastStopDuration = -1 * ($scope.numStops - $scope.numCharges) * $scope.stopDuration;
            } else {
                $scope.lastStopDuration = -1;
            }

            $scope.stopsImages = [];
            for(var i = 0; i < $scope.numStops; i++) {
                $scope.stopsImages.push({});
            }

            return dayRadius;
        };


        $scope.scrollTo = function(id) {
            $location.hash(id);
            $anchorScroll();
        };

        $scope.recalcRange = function() {
            var car = $scope.selectedCar;
            $scope.calculatedRange = car.range * $scope.realityFactor;
            $scope.calculatedReturnRange = car.range * $scope.realityFactor / 2;
            $scope.calculatedDayRange = calcDayRadius(car);
            $scope.rangeCircle.setRadius($scope.calculatedRange * 1000);
            $scope.returnCircle.setRadius($scope.calculatedReturnRange * 1000);
            $scope.dayRangeCircle.setRadius($scope.calculatedDayRange * 1000);
            $scope.rangeCircle.setMap($scope.map);
            $scope.returnCircle.setMap($scope.map);
            $scope.dayRangeCircle.setMap($scope.map);
        }

        $scope.select = function (car, doScroll) {
            $scope.selectedCar = car;
            $scope.selectedPlug = undefined;
            car.chargePower = undefined;
            $scope.recalcRange();
            if(doScroll) {
                $scope.scrollTo('cars-list');
            }
        };

        $scope.setPower = function(plug, car) {
            car.chargePower = 0;
            for(var i = 0; i < plug.power.length; i++) {
                var p = plug.power[i];
                car.chargePower += (p.voltage * p.ampere);
            }
            if(!plug.continuous) {
                car.chargePower = car.chargePower * 0.8;
            }
            car.chargePower = Math.floor(car.chargePower / 100) / 10;
            $scope.selectedPlug = plug;
            $scope.recalcRange();
        };

        $scope.supportsPlug = function(plug, car) {
            for(var i = 0; i < car.plugs.length; i++) {
                if(car.plugs[i] === plug.id) {
                    return true;
                }
            }
            return false;
        };

        $scope.select($scope.cars[0]);

        $scope.toggleDetails = function() {
            $scope.showDetails = !$scope.showDetails;
        };
    });

