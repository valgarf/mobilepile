import { Component } from '@angular/core';
import { NavController, ToastController } from 'ionic-angular';
import {Observable, BehaviorSubject} from 'rxjs/Rx'

import { Server } from '@root/server'
import * as Lib from '@root/lib'

@Component({
  selector: 'page-mailbox',
  templateUrl: 'mailbox.html'
})
export class MailboxPage {

  private _tag : BehaviorSubject<string> = new BehaviorSubject('Inbox')
  get tag(): string {return this._tag.getValue()}
  set tag(value: string) {this._tag.next(value)}
  get tagObs(): Observable<string> {return this._tag}
  mails: [any]

  constructor(public navCtrl: NavController, private server: Server) {
    Lib.bindMethods(this)
  }

}
