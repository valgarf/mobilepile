import { Component, ChangeDetectionStrategy } from '@angular/core';
import { NavController, NavParams, ToastController } from 'ionic-angular';
import {Observable, BehaviorSubject, AsyncSubject, Subject} from 'rxjs/Rx'

import { Server } from '@root/server'
import * as Lib from '@root/lib'
import * as Comp from '@root/components'
import {MailViewPage} from '../mailview/mailview'

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

  private _search: string
  private _end : number = 0
  private _step: number = 20
  private _obs: [Observable<[string]>] = <[Observable<[string]>]>[]
  
  private _loadingSubject : Subject<Observable<[string]>> = new Subject<Observable<[string]>>()
  mails: Observable<[string]>


  constructor(public navCtrl: NavController, private navParams: NavParams, private server: Server, private msg: Comp.MessageHandler) {
    Lib.bindMethods(this)
    var self = this
    this._search = navParams.get('search') || 'in:Inbox';
    server.authenticatedObs.subscribe( (res) => {
      if (res) {
        // this.mails = this.mails.retry()
        self.loadMore(null)
      }
    })

    let tmpobs: Observable<[string]> = <Observable<[string]>> this._loadingSubject
      .scan( (acc, cur) => Observable.combineLatest(acc, cur).map((arr) => arr[0].concat(arr[1])) )
      // .scan( (acc, cur) => acc.withLatestFrom(acc).map((arr) => arr[1].concat(arr[0])) )
      .switch()
      // for some reason this fails the typescript

    this.mails = tmpobs.catch( (err) =>  {
        if (err instanceof Error) {
          this.msg.displayError(err)
        }
        return Observable.of([])
      })
      // .map( (lolomails) => [].concat.apply([],lolomails) )
      .do(Lib.logfunc)
  }

  loadMore(infiniteScroll) {
    let newObs = this.server.search(this._search, 'rev-freshness', this._end, this._end + this._step ).map(res => res.thread_ids)
    this._loadingSubject.next(newObs)
    this._end = this._end + this._step
    newObs.first().subscribe( () => {
      if (infiniteScroll) {
        infiniteScroll.complete()
      }
    })
  }

  open(mail) {
    this.navCtrl.push(MailViewPage, {mid: mail})

  }

}
