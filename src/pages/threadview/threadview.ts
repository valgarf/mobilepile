import {Component, ChangeDetectionStrategy } from '@angular/core';
import {NavController, NavParams, } from 'ionic-angular';
import {observable} from 'mobx'

import * as Lib from '@root/lib'
import {Store, Thread, Message} from '@root/store'
import {MailViewPage} from '../mailview/mailview'

/**
 * Shows all messages from a given thread in a list of mail_info components
 */
@Component({
  selector: 'page-threadview',
  templateUrl: 'threadview.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThreadViewPage {

  @observable thread: Thread = null;

  constructor(public navCtrl: NavController, private navParams: NavParams, private store: Store) {
    Lib.bindMethods(this)
    this.thread = navParams.get('thread')
    Lib.log.trace(['new window', 'thread'], 'Opened new Thread View with thread:', this.thread)
  }

  open(mail: Message) {
    this.navCtrl.push(MailViewPage, { mid: mail.ID })
  }
}
