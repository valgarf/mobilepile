import { Component, ChangeDetectionStrategy } from '@angular/core';
import { NavController, NavParams, ToastController } from 'ionic-angular';

import {Observable, BehaviorSubject, AsyncSubject, Subject} from 'rxjs/Rx'
import {observable, when, action} from 'mobx'

import { Server } from '@root/server'
import { Store, Search } from '@root/store'
import * as Lib from '@root/lib'
import * as Comp from '@root/components'
import {MailViewPage} from '../mailview/mailview'

@Component({
  selector: 'page-mailbox',
  templateUrl: 'mailbox.html',
  changeDetection:  ChangeDetectionStrategy.OnPush
})
export class MailboxPage {

  @observable name: string = 'Inbox'
  @observable search: Search = null;

  constructor(public navCtrl: NavController, private navParams: NavParams, private store: Store, private msg: Comp.MessageHandler) {
    Lib.bindMethods(this)
    var self = this
    let query = navParams.get('search') || 'in:Inbox';
    this.search = store.search.create( query, 'rev-freshness' )
  }

  @action loadMore(infiniteScroll) {
    this.search.loadMore(20).then(() => infiniteScroll.complete())
  }

  open(mail) {
    this.navCtrl.push(MailViewPage, {mid: mail})

  }

}
