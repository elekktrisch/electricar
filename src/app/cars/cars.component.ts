import { Component, OnInit } from '@angular/core';
import {AngularFireDatabase, FirebaseListObservable} from 'angularfire2/database';

@Component({
  selector: 'app-cars',
  templateUrl: './cars.component.html',
  providers: [AngularFireDatabase],
  styleUrls: ['./cars.component.css']
})
export class CarsComponent implements OnInit {

  brand: string = "";
  cars: FirebaseListObservable<Car[]>;

  constructor(db: AngularFireDatabase) {
    this.cars = db.list('/cars');
  }

  ngOnInit() {
  }

  addCar(brand: string) {
    this.cars.push({
      brand: brand
    });
    this.brand = "";
  }
}

class Car {
  brand: string;
}
