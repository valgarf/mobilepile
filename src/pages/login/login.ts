import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';

import {Store} from '@root/store'
import * as Lib from '@root/lib'


@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {

  url: string = ''; //'http://localhost:33411'
  password: string = ''; //'testingonly'
  allowSubmission = true

  constructor(public navCtrl: NavController, private store: Store) {
    Lib.bindMethods(this)
    this.url = this.store.state.url
    this.password = this.store.state.password
  }

  ionViewCanLeave(): boolean {
    return this.store.state.authenticated
  }

  login() {
    if (!this.allowSubmission) {
      return
    }
    this.allowSubmission = false

    let self = this
    this.store.state.url = this.url
    this.store.state.password = this.password
    this.store.state.login()
      .then(() => { self.allowSubmission = true })
      .catch((err) => {
        self.allowSubmission = true
        this.store.state.handleError(err)
      })
  }

}
