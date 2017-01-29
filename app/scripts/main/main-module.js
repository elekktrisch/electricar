import angular from 'angular';
import 'angular-resource';
import {MainCtrl} from "./main-controller";
import {Cars, Circles, DomainInfo, Plugs} from "./main-services";

export default angular.module('main', ['ngResource'])
    .service("Cars", Cars.factory)
    .service("Circles", Circles)
    .service("DomainInfo", DomainInfo.factory)
    .service("Plugs", Plugs.factory)
    .controller("MainCtrl", MainCtrl);