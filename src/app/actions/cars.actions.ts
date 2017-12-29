import { Action } from '@ngrx/store';
import { Car } from '../models/car.model';

export enum CarActionTypes {
  Load = '[Car] Load',
  LoadComplete = '[Car] Load Complete',
  LoadError = '[Car] Load Error',
}

export class Load implements Action {
  readonly type = CarActionTypes.Load;

  constructor() {}
}

export class LoadComplete implements Action {
  readonly type = CarActionTypes.LoadComplete;

  constructor(public payload: Car[]) {}
}

export class LoadError implements Action {
  readonly type = CarActionTypes.LoadError;

  constructor(public payload: string) {}
}
