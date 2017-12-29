import {Action, ActionReducer, MetaReducer, State} from '@ngrx/store';
import {environment} from "../../environments/environment";

export function simpleReducer(state: string = 'Hello World', action: Action) {
  switch (action.type) {
    case 'SPANISH':
      return state = 'Hola Mundo';
    case 'FRENCH':
      return state = 'Bonjour le monde';
    default:
      return state;
  }
}

export function logger(reducer: ActionReducer<State<any>>): ActionReducer<State<any>> {
  return function(state: State<any>, action: any): State<any> {
    console.log('state', state);
    console.log('action', action);

    return reducer(state, action);
  };
}

export const metaReducers: MetaReducer<State<any>>[] = !environment.production
  ? [logger]
  : [];
