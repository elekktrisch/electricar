import angular from 'angular';
import 'angular-resource';
import {MainCtrl} from "./main-controller";
import {Circles, DomainInfo} from "./main-services";

export default angular.module('main', ['ngResource'])
    .service("Circles", Circles)
    .service("DomainInfo", DomainInfo.factory)
    .controller("MainCtrl", MainCtrl);