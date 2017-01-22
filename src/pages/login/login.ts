import {Component} from '@angular/core';

import {NavController} from 'ionic-angular';

import {Server} from '@root/server'
import * as Lib from '@root/lib'
import * as Comp from '@root/components'

@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {

  url: string = ''
  password: string = ''
  allowSubmission = true

  constructor(public navCtrl: NavController, private server: Server) {
    Lib.bindMethods(this)
  }

  ionViewCanLeave(): boolean {
    return this.server.authenticated
  }

  login() {
    if (! this.allowSubmission) {
      return
    }
    this.allowSubmission=false

    // console.log('LOGIN', this.url, this.password)
    let self = this
    this.server.url = this.url
    this.server.login(this.password)
      .then((() => {self.allowSubmission = true}))
  }

}
