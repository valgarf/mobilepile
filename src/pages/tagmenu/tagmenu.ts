import {Component} from '@angular/core';
import {MenuController, NavController} from 'ionic-angular';

import {Observable} from 'rxjs/Rx'
import {observable, computed} from 'mobx'
import {sprintf} from 'sprintf-js'

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

  tags: Observable<ITag[]>;
  tagsTree: Observable<Comp.ITagTree[]>;
  tagsAll: Observable<Comp.ITagTree[][]>;
  previousTags: { [tid: string]: Comp.ITagTree } = undefined;

  @computed get tagsCombined() {
    let tags = this.store.tags.root.filter( (t) => t.visible )
    return [
      tags.filter( (t)=> t.display == TagDisplayType.priority ),
      tags.filter( (t)=> t.display != TagDisplayType.priority )
    ]
  }

  constructor(public menuCtrl: MenuController, private server: Server, private store: Store) {
    Lib.bindMethods(this)
    this.tags = server.tags().map(res => res.tags)
    this.tagsTree = this.tags.map( tags => tags.filter( tag => tag.display!="invisible" ) ).map(this.createTagTree)
    this.tagsAll = this.tagsTree.map( tags => [tags.filter( tag => tag.display=="priority" ), tags.filter( tag => tag.display=="tag" )] );
  }

  createTagTree(tags: ITag[]): Comp.ITagTree[] {
    let obj={}
    for (let tag of <Comp.ITagTree[]>tags) {
      tag.children=[]
      tag.open= this.previousTags != undefined && tag.tid in this.previousTags ? this.previousTags[tag.tid].open : false
      obj[tag.tid] = tag
    }
    this.previousTags = obj
    for (let tag of tags) {
      if (tag.parent != "") {
        obj[tag.parent].children.push(tag)
      }
    }
    let rootTags = <Comp.ITagTree[]>tags.filter( tag => tag.parent == "" )
    return rootTags
  }

  onSelect(tag: Comp.ITagTree) {
    let navCtrl = <NavController>this.menuCtrl.get().content
    navCtrl.setRoot(MailboxPage, {search: sprintf(tag.search_terms, tag)})
    //navCtrl.popToRoot()
  }
}
