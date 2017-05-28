import angular from 'angular';
import 'angular-resource';
import "angular-material";
import "angular-youtube-embed";
import "ngmap";
import {CarCtrl} from "./car-controller";
import {Settings} from "./settings-service";
import {Calculator, RangeCalculator, RANGE_CONSTANTS} from "./calculator-service";


export default angular.module('car', ['ngResource', 'ngMaterial', 'youtube-embed', 'ngMap'])
    .controller("CarCtrl", CarCtrl)
    .service("Calculator", Calculator.factory)
    .service("RangeCalculator", RangeCalculator.factory)
    .service("Settings", Settings.factory)
    .constant('RANGE_CONSTANTS', RANGE_CONSTANTS);