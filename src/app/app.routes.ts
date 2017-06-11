import {CarsComponent} from "./cars/cars.component";
import {LoginComponent} from "./login/login.component";
import {Routes} from "@angular/router/router";

export const appRoutes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'cars', component: CarsComponent },
  { path: '**', component: LoginComponent }
];
