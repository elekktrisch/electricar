export class Settings {
    static factory() {
        var newSettings = {
            presetTrip: 'weekend',
            resetCommonSettings: function () {
                this.maxBatteryChargePercent = 90;
                this.maxC = 2.5;
                this.chargingLossPercent = 10;
                this.brickProtectionPercent = 3;
                this.temperature = 16;
                this.rain = 1;
                this.preHeatCabin = true;
                this.altitudeDifferenceM = 0;
            },
            loadDailyDriving: function () {
                this.resetCommonSettings();
                this.firstCharge = 80;
                this.drivingSpeed = 75;
                this.distanceToTravel = 40;
                this.detourPercent = 25;
                this.presetTrip = 'daily';
                this.accelerationBreaking = 120;
            },
            loadWeekendTrip: function () {
                this.resetCommonSettings();
                this.firstCharge = 100;
                this.drivingSpeed = 90;
                this.distanceToTravel = 300;
                this.detourPercent = 30;
                this.presetTrip = 'weekend';
                this.accelerationBreaking = 110;
            },
            loadLongTrip: function () {
                this.resetCommonSettings();
                this.firstCharge = 100;
                this.drivingSpeed = 110;
                this.distanceToTravel = 700;
                this.detourPercent = 30;
                this.presetTrip = 'long';
                this.accelerationBreaking = 100;
            }
        };
        newSettings.loadWeekendTrip();
        return newSettings;
    }
}