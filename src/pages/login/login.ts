import { Component } from '@angular/core';

import { NavController, ToastController } from 'ionic-angular';

import { Server } from '@root/server'
import * as Lib from '@root/lib'

@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {

  url: string = ''
  password: string = ''

  constructor(public navCtrl: NavController, private toastCtrl: ToastController, private server: Server) {
    Lib.bindMethods(this)
    server.errorMessageObs.subscribe(this.showErrors)
  }

  ionViewCanLeave(): boolean {
    return this.server.authenticated
  }

  login() {
    console.log('LOGIN', this.url, this.password)
    this.server.url = this.url
    this.server.login(this.password)
  }

  showErrors(msg) {
    if (msg!='') {
      let toast = this.toastCtrl.create({
         message: msg,
         duration: 3000
      })
      toast.present()
    }
  }

}
