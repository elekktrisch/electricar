import { Component, OnInit } from '@angular/core';
import {AngularFireDatabase, FirebaseListObservable} from 'angularfire2/database';
import {AFUnwrappedDataSnapshot} from "angularfire2/interfaces";

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
    this.cars.subscribe(cars => console.log("cars", cars));
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

class Car{
  brand: string;
}
