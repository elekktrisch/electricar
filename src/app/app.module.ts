import {BrowserModule} from "@angular/platform-browser";
import {NgModule} from "@angular/core";
import {RouterModule} from "@angular/router";
import {AppComponent} from "./app.component";
import {LoginComponent} from "./containers/login/login.component";
import {CarsComponent} from "./containers/cars/cars.component";
import {AngularFireModule} from "angularfire2";
import {MenuComponent} from "./components/menu/menu.component";
import {appRoutes, AuthGuard} from "./app.routes";
import {FormsModule} from "@angular/forms";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {
  MatButtonModule, MatCardModule, MatGridListModule, MatInputModule, MatMenuModule,
  MatProgressSpinnerModule
} from "@angular/material";
import {AngularFireAuthModule} from "angularfire2/auth";
import {AngularFireDatabaseModule} from "angularfire2/database";
import {CardComponent} from './components/card/card.component';
import {CardContainerComponent} from './components/card-container/card-container.component';

import {StoreModule} from '@ngrx/store';
import {metaReducers, simpleReducer} from './reducers/simple.reducer';
import {environment} from "../environments/environment";
import {StoreDevtoolsModule} from "@ngrx/store-devtools";
import {EffectsModule} from "@ngrx/effects";
import {StoreRouterConnectingModule} from "@ngrx/router-store";

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    CarsComponent,
    MenuComponent,
    CardComponent,
    CardContainerComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatCardModule,
    MatGridListModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatMenuModule,
    FormsModule,
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    RouterModule.forRoot(appRoutes),
    AngularFireModule.initializeApp({
      apiKey: "AIzaSyAUjHNW2L80OTCrhsUUSmRuT1Qbs68AazI",
      authDomain: "electricar-e92a5.firebaseapp.com",
      databaseURL: "https://electricar-e92a5.firebaseio.com",
      projectId: "electricar-e92a5",
      storageBucket: "electricar-e92a5.appspot.com",
      messagingSenderId: "806992676079"
    }),
    !environment.production
      ? StoreDevtoolsModule.instrument({maxAge: 25})
      : [],
    EffectsModule.forRoot([]),
    StoreRouterConnectingModule,
    StoreModule.forRoot({message: simpleReducer, metaReducers})
  ],
  providers: [AuthGuard],
  bootstrap: [AppComponent]
})
export class AppModule {
}
