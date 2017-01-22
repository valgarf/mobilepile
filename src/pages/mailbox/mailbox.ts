import { Component, ChangeDetectionStrategy } from '@angular/core';
import { NavController, ToastController } from 'ionic-angular';
import {Observable, BehaviorSubject} from 'rxjs/Rx'

import { Server } from '@root/server'
import * as Lib from '@root/lib'
import * as Comp from '@root/components'

@Component({
  selector: 'page-mailbox',
  templateUrl: 'mailbox.html',
  // changeDetection:  ChangeDetectionStrategy.OnPush
})
export class MailboxPage {

  private _tag : BehaviorSubject<string> = new BehaviorSubject('Inbox')
  get tag(): string {return this._tag.getValue()}
  set tag(value: string) {this._tag.next(value)}
  get tagObs(): Observable<string> {return this._tag}

  mails: Observable<[string]>

  constructor(public navCtrl: NavController, private server: Server, private msg: Comp.MessageHandler) {
    Lib.bindMethods(this)
    server.authenticatedObs.subscribe( (res) => {
      if (res) {
        // this.mails = this.mails.retry()
        this.mails = server.search()
          .map(res => res.thread_ids)
          .catch( (err) =>  {
            if (err instanceof Error) {
              this.msg.displayError(err)
            }
            return Observable.of([])
          })
      }
    })
  }

}
