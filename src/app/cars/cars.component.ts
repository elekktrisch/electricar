import {Component, OnInit} from "@angular/core";
import {AngularFireDatabase, FirebaseListObservable} from "angularfire2/database";
import {AngularFireAuth} from "angularfire2/auth";
import "rxjs/add/operator/take";
import "rxjs/add/operator/do";
import {Car} from "./car.model";

@Component({
  selector: 'app-cars',
  templateUrl: './cars.component.html',
  styleUrls: ['./cars.component.css']
})
export class CarsComponent implements OnInit {

  brand: string = "";
  cars: FirebaseListObservable<Car[]>;
  loading: boolean;

  constructor(private angularFireAuth: AngularFireAuth, private angularFireDatabase: AngularFireDatabase) {
  }

  ngOnInit() {
    this.loading = true;
    this.angularFireAuth.authState.subscribe(user => {
      if (user) {
        this.cars = this.angularFireDatabase.list('/cars');
        this.cars.subscribe(() => {
          this.loading = false;
        });
      }
    });
  }

  addCar(brand: string) {
    this.cars.push({
      brand: brand
    });
    this.brand = "";
  }

  delete(car: any) {
    this.cars.remove(car);
  }

}
