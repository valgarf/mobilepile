import {Component} from '@angular/core';
import {MenuController, NavController} from 'ionic-angular';

import {Observable} from 'rxjs/Rx'
import {observable, computed} from 'mobx'

import {Server, ITag, str2color} from '@root/server'
import * as Lib from '@root/lib'
import * as Comp from '@root/components'
import {Store, Tag, TagDisplayType} from '@root/store'
import {MailboxPage} from '../mailbox/mailbox'

@Component({
  selector: 'page-tagmenu',
  templateUrl: 'tagmenu.html'
})
export class TagmenuPage {

  @computed get tagsCombined() {
    let tags = this.store.tags.root.filter( (t) => t.visible )
    return [
      tags.filter( (t)=> t.display == TagDisplayType.priority ),
      tags.filter( (t)=> t.display != TagDisplayType.priority )
    ]
  }

  constructor(public menuCtrl: MenuController, private server: Server, private store: Store) {
    Lib.bindMethods(this)
  }

  onSelect(tag: Tag) {
    let navCtrl = <NavController>this.menuCtrl.get().content
    navCtrl.setRoot(MailboxPage, {search: tag.search_expression })
    //navCtrl.popToRoot()
  }
}
