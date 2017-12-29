import {Injectable} from '@angular/core';
import {Action} from '@ngrx/store';
import {Actions, Effect} from '@ngrx/effects';
import {Database} from '@ngrx/db';
import {Observable} from 'rxjs/Observable';
import {defer} from 'rxjs/observable/defer';
import {of} from 'rxjs/observable/of';
import {CarActionTypes, Load, LoadComplete, LoadError} from '../actions/cars.actions';
import {catchError, map, toArray} from 'rxjs/operators';
import {Car} from "../models/car.model";

@Injectable()
export class CarsEffects {

  @Effect({ dispatch: false })
  openDB$: Observable<any> = defer(() => {
    return this.db.open('cars_app');
  });

  @Effect()
  loadCars$: Observable<Action> = this.actions$
    .ofType(CarActionTypes.Load)
    .switchMap(() =>
      this.db
        .query('cars')
        .pipe(
          toArray(),
          map((cars: Car[]) => new LoadComplete(cars)),
          catchError(error => of(new LoadError(error)))
        )
  );

  constructor(private actions$: Actions, private db: Database) {
  }

}
