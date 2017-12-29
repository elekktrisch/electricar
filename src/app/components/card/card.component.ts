import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {Car} from "../../models/car.model";

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent implements OnInit {

  @Input()
  car: Car;

  @Input()
  index: number;

  @Output()
  deleteClicked: EventEmitter<Car> = new EventEmitter<Car>();

  constructor() { }

  ngOnInit() {
  }

}
