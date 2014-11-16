/*global _:false*/
'use strict';

angular.module('car')
    .factory('Settings', function () {
        var newSettings = {
            presetTrip: 'weekend',
            resetCommonSettings: function() {
                this.maxBatteryChargePercent = 90;
                this.maxC = 2.5;
                this.chargingLossPercent = 10;
                this.brickProtectionPercent = 3;
            },
            loadDailyDriving: function () {
                this.resetCommonSettings();
                this.firstCharge = 80;
                this.drivingSpeed = 60;
                this.distanceToTravel = 40;
                this.detourPercent = 25;
                this.presetTrip = 'daily';
            },
            loadWeekendTrip: function () {
                this.resetCommonSettings();
                this.firstCharge = 100;
                this.drivingSpeed = 90;
                this.distanceToTravel = 300;
                this.detourPercent = 30;
                this.presetTrip = 'weekend';
            },
            loadLongTrip: function () {
                this.resetCommonSettings();
                this.firstCharge = 100;
                this.drivingSpeed = 100;
                this.distanceToTravel = 700;
                this.detourPercent = 30;
                this.presetTrip = 'long';
            }
        };
        newSettings.loadWeekendTrip();
        return newSettings;
    });