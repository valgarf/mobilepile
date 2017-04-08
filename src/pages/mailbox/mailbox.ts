import {Component, ChangeDetectionStrategy } from '@angular/core';
import {NavController, NavParams, } from 'ionic-angular';
import {observable, action} from 'mobx'

import * as Lib from '@root/lib'
import { Store, Search } from '@root/store'
import {MailViewPage} from '../mailview/mailview'

@Component({
  selector: 'page-mailbox',
  templateUrl: 'mailbox.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MailboxPage {

  @observable name: string = 'Inbox'
  @observable search: Search = null;

  constructor(public navCtrl: NavController, private navParams: NavParams, private store: Store) {
    Lib.bindMethods(this)
    let query = navParams.get('search') || 'in:Inbox';
    this.search = store.search.create(query, 'rev-freshness')
  }

  @action loadMore(infiniteScroll) {
    this.search.loadMore(20).then(() => infiniteScroll.complete())
  }

  open(mail) {
    this.navCtrl.push(MailViewPage, { mid: mail })
  }
}
