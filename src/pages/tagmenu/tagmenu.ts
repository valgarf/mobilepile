import {Component, ChangeDetectionStrategy} from '@angular/core';
import {MenuController, NavController} from 'ionic-angular';
import {computed} from 'mobx'

import * as Lib from '@root/lib'
import {Store, Tag, TagDisplayType} from '@root/store'
import {MailboxPage} from '../mailbox/mailbox'

@Component({
  selector: 'page-tagmenu',
  templateUrl: 'tagmenu.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TagmenuPage {

  @computed get tagsCombined() {
    let tags = this.store.tags.root.filter((t) => t.visible)
    return [
      tags.filter((t) => t.display == TagDisplayType.priority),
      tags.filter((t) => t.display != TagDisplayType.priority)
    ]
  }

  constructor(public menuCtrl: MenuController, private store: Store) {
    Lib.bindMethods(this)
  }

  onSelect(tag: Tag) {
    let navCtrl = <NavController>this.menuCtrl.get().content
    navCtrl.setRoot(MailboxPage, { tag: tag })
    //navCtrl.popToRoot()
  }
}
