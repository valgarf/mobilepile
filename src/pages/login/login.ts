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

  /**
   * This page can only be closed when we are authenticated. It should do so automatically after successful authentication
   * (see handleAuthNavigation in app/app.component.ts)
   */
  ionViewCanLeave(): boolean {
    return this.store.state.authenticated
  }

  /**
   * Login button pressed. Try to login with given credentials
   */
  login() {
    if (!this.allowSubmission) {
      return
    }
    this.allowSubmission = false // block further clicks on the login button

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
