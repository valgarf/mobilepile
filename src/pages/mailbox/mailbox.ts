import {Component, ChangeDetectionStrategy } from '@angular/core';
import {NavController, NavParams, } from 'ionic-angular';
import {observable, action} from 'mobx'

import * as Lib from '@root/lib'
import {Store, Search, Tag, Message} from '@root/store'
import {MailViewPage} from '../mailview/mailview'
import {ThreadViewPage} from '../threadview/threadview'


/**
 * This page shows a mailbox or a search. In both cases the resulting threads are presented in a list of mail_info components
 *
 */
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
    // obtain query from navigation parameters and get a search object from the store
    let tag: Tag = navParams.get('tag')
    let query: string
    if (tag != null) {
      this.name = tag.name
      query = tag.search_expression
    }
    else {
      query = navParams.get('search')
      if (query == null) {
        query = 'in:Inbox'
        this.name = 'Inbox'
      }
      else {
        this.name = 'Search: ' + query
      }
    }
    this.search = store.search.create(query, 'rev-freshness')
  }

  @action loadMore(infiniteScroll) {
    this.search.loadMore(20).then(() => infiniteScroll.complete()).catch(this.store.state.handleError)
  }

  /**
   * Some mail in the list has been clicked and should be opened.
   * Opens the mail if it is a single mail. If it belongs to a thread, open a ThreadView
   *
   * @param  {Message} mail: The message to open
   */
  open(mail: Message) {
    Lib.log.trace(['message', 'open', 'data'], 'Mail to be opened:', mail)
    if (mail.thread.entries.length > 1) {
      this.navCtrl.push(ThreadViewPage, { thread: mail.thread })
    }
    else {
      this.navCtrl.push(MailViewPage, { mid: mail.ID })
    }
  }
}
