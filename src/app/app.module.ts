import {BrowserModule} from "@angular/platform-browser";
import {NgModule} from "@angular/core";
import {RouterModule} from "@angular/router";
import {AppComponent} from "./app.component";
import {LoginComponent} from "./login/login.component";
import {CarsComponent} from "./cars/cars.component";
import {AngularFireModule} from "angularfire2";
import {InputTextModule, ButtonModule, MenubarModule, DataGridModule} from "primeng/primeng";
import {MenuComponent} from "./menu/menu.component";
import {appRoutes} from "./app.routes";
import {FormsModule} from "@angular/forms";

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    CarsComponent,
    MenuComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot(appRoutes),
    AngularFireModule.initializeApp({
      apiKey: "AIzaSyAUjHNW2L80OTCrhsUUSmRuT1Qbs68AazI",
      authDomain: "electricar-e92a5.firebaseapp.com",
      databaseURL: "https://electricar-e92a5.firebaseio.com",
      projectId: "electricar-e92a5",
      storageBucket: "electricar-e92a5.appspot.com",
      messagingSenderId: "806992676079"
    }),
    DataGridModule,
    InputTextModule,
    ButtonModule,
    MenubarModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
