import angular from 'angular';
import 'angular-resource';
import {IntroCtrl} from "./intro-controller";

export default angular.module('intro', ['ngResource'])
    .controller("IntroCtrl", IntroCtrl);