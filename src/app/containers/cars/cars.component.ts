import {Component, OnInit} from "@angular/core";
import {AngularFireDatabase, AngularFireList} from "angularfire2/database";
import {AngularFireAuth} from "angularfire2/auth";
import "rxjs/add/operator/take";
import "rxjs/add/operator/do";
import {Car} from "../../models/car.model";
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs/Observable';
import {CarActionTypes, Load} from "../../actions/cars.actions";

interface AppState {
  message: string;
  cars: Car[];
}

@Component({
  selector: 'app-cars',
  templateUrl: './cars.component.html',
  styleUrls: ['./cars.component.css']
})
export class CarsComponent implements OnInit {

  brand: string = "";
  cars: AngularFireList<Car>;
  cars$: Observable<any>;
  loading: boolean;
  message$: Observable<string>;

  constructor(private angularFireAuth: AngularFireAuth, private angularFireDatabase: AngularFireDatabase, private store: Store<AppState>) {
    this.message$ = this.store.select('message')
  }

  ngOnInit() {
    this.loading = true;
    // this.store.dispatch(new Load());
    // this.cars$ = this.store.select("cars");

    this.angularFireAuth.authState.subscribe(user => {
      if (user) {
        this.cars = this.angularFireDatabase.list('/cars');
        this.cars$ = this.cars.snapshotChanges();
        this.cars$.subscribe(() => {
          this.loading = false;
        });
      }
    });
  }

  spanishMessage() {
    this.store.dispatch({type: 'SPANISH'})
  }

  frenchMessage() {
    this.store.dispatch({type: 'FRENCH'})
  }

  addCar(brand: string) {
    this.cars.push({
      brand: brand
    });
    this.brand = "abc";
  }

  deleteCar(car: any) {
    this.cars.remove(car.key);
  }

}
