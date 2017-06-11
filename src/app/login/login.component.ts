import {Component} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {AngularFireAuth} from 'angularfire2/auth';
import * as firebase from 'firebase/app';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  providers: [AngularFireAuth],
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  user: Observable<firebase.User>;

  constructor(public angularFireAuth: AngularFireAuth) {
    this.user = angularFireAuth.authState;
  }

  login() {
    this.angularFireAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
  }

}
