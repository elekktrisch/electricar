import {Component, OnInit, Input, Output, EventEmitter} from "@angular/core";
import {Observable} from "rxjs/Rx";
import {Car} from "../../models/car.model";

@Component({
  selector: 'app-card-list',
  templateUrl: './card-list.component.html',
  styleUrls: ['./card-list.component.css']
})
export class CardListComponent implements OnInit {

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
