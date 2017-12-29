import {Component, OnInit, Input, Output, EventEmitter} from "@angular/core";
import {Observable} from "rxjs/Rx";
import {Car} from "../../models/car.model";

@Component({
  selector: 'app-card-container',
  templateUrl: './card-container.component.html',
  styleUrls: ['./card-container.component.css']
})
export class CardContainerComponent implements OnInit {

  @Input()
  cars: Observable<Car[]>;

  @Input()
  loading: boolean;

  @Output()
  deleteClicked: EventEmitter<Car> = new EventEmitter<Car>();

  constructor() {
  }

  ngOnInit() {
  }

}
