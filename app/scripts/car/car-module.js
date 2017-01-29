import angular from 'angular';
import 'angular-resource';
import "angular-material";
import "angular-ui-bootstrap";
import "angular-youtube-embed";
import {CarCtrl} from "./car-controller";
import {Settings} from "./settings-service";
import {Calculator, RangeCalculator} from "./calculator-service";

export default angular.module('car', ['ngResource', 'ngMaterial', 'youtube-embed'])
    .controller("CarCtrl", CarCtrl)
    .service("Calculator", Calculator.factory)
    .service("RangeCalculator", RangeCalculator.factory)
    .service("Settings", Settings.factory)
    .constant('RANGE_CONSTANTS', {
        inCarTemperature: 21,
        appliancesPowerKW: 0.5,
        airDensity: 1.25, // ρ = 1.25 kg/m^3: Luftdichte
        g: 9.81 // 9.81 m/s^2: Erdbeschleunigung
    });