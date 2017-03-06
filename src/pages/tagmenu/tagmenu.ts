import {Component} from '@angular/core';

import {NavController} from 'ionic-angular';

import {Observable} from 'rxjs/Rx'
import {sprintf} from 'sprintf-js'

import {Server, DataStore, ITag, str2color} from '@root/server'
import * as Lib from '@root/lib'
import * as Comp from '@root/components'
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
  constructor(private navCtrl: NavController, private server: Server, private data: DataStore) {
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
    console.log(rootTags)
    return rootTags
  }
  
  onSelect(tag: Comp.ITagTree) {
    this.navCtrl.setRoot(MailboxPage, {search: sprintf(tag.search_terms, tag)})
    this.navCtrl.popToRoot()
  }
}
