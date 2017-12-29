import {CarsComponent} from "./containers/cars/cars.component";
import {LoginComponent} from "./containers/login/login.component";
import {Routes, CanActivate, RouterStateSnapshot, ActivatedRouteSnapshot, Router} from "@angular/router";
import {AngularFireAuth} from "angularfire2/auth";
import {Observable} from "rxjs/Rx";
import "rxjs/add/operator/take";
import "rxjs/add/operator/map";
import "rxjs/add/operator/do";
import {Injectable} from "@angular/core";

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private angularFireAuth: AngularFireAuth, private router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return Observable.from(this.angularFireAuth.authState)
      .take(1)
      .map(state => !!state)
      .do(authenticated => {
        if (!authenticated) {
          this.router.navigateByUrl("/login");
        }
      });
  }
}

export const appRoutes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'cars', component: CarsComponent, canActivate: [AuthGuard] },
  { path: '**', component: LoginComponent }
];
