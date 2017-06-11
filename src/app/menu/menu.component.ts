import {Component, OnInit} from "@angular/core";
import {MenuItem} from "primeng/primeng";
import {Observable} from "rxjs/Observable";
import {AngularFireAuth} from "angularfire2/auth";
import * as firebase from 'firebase/app';
import {Router} from "@angular/router";

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  providers: [AngularFireAuth],
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {

  user: Observable<firebase.User>;

  items: MenuItem[];

  constructor(public angularFireAuth: AngularFireAuth, private router: Router) {
    this.user = angularFireAuth.authState;
  }

  ngOnInit() {
    this.user.subscribe(user => {
      if (user) {
        this.items = [
          {
            label: "Cars",
            command: this.goToCars.bind(this)
          },
          {
            label: user.displayName,
            items: [{
              label: 'Logout',
              command: this.logout.bind(this)
            }]
          }
        ];
      } else {
        this.items = [{
          label: "Login",
          icon: 'fa fa-lock',
          command: this.login.bind(this)
        }]
      }
    });
  }

  goToCars() {
    this.router.navigateByUrl("/cars");
  }

  login() {
    this.angularFireAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
  }

  logout() {
    this.angularFireAuth.auth.signOut();
  }

}
