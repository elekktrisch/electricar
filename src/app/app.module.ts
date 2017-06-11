import {BrowserModule} from "@angular/platform-browser";
import {NgModule} from "@angular/core";
import {RouterModule} from "@angular/router";
import {AppComponent} from "./app.component";
import {LoginComponent} from "./login/login.component";
import {CarsComponent} from "./cars/cars.component";
import {AngularFireModule} from "angularfire2";
import {MenuComponent} from "./menu/menu.component";
import {appRoutes, AuthGuard} from "./app.routes";
import {FormsModule} from "@angular/forms";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {MdButtonModule, MdCardModule, MdGridListModule, MdProgressSpinnerModule} from "@angular/material";
import {AngularFireAuthModule} from "angularfire2/auth";
import {AngularFireDatabaseModule} from "angularfire2/database";


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    CarsComponent,
    MenuComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MdButtonModule,
    MdCardModule,
    MdGridListModule,
    MdProgressSpinnerModule,
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
    })
  ],
  providers: [AuthGuard],
  bootstrap: [AppComponent]
})
export class AppModule {
}
