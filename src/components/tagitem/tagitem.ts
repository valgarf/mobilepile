import {Component, Input, Output, EventEmitter} from '@angular/core';

import {NavController} from 'ionic-angular';

import {Observable} from 'rxjs/Rx'
import {observable, computed} from 'mobx'

import {Server, DataStore, ITag, str2color} from '@root/server'
import {Store, Tag} from '@root/store'
import * as Lib from '@root/lib'
import * as Comp from '@root/components'


export interface ITagTree extends ITag {
  children: ITagTree[],
  open: boolean
}


@Component({
  selector: 'tagitem',
  templateUrl: 'tagitem.html'
})
export class TagitemComponent{
  @Input() tag: Tag;
  @Input() level: number;
  @Output() select: EventEmitter<Tag> = new EventEmitter<Tag>();

  constructor() {
  }

  get leftPadding(): string {
    let ex = this.level*1.5
    return ex.toString()+'ex'
  }


  @computed get icon(): string {
    return 'assets/icon/'+this.tag.icon.substring(5)+'-inverted.svg'
  }

  @computed get arrow():string {
    let arrtype = this.tag.open ? 'down' : 'right';
    return 'assets/icon/arrow-'+arrtype+'-inverted.svg'
  }

  @computed get visibility():string {
    return this.tag.children.length>0 ? 'visible' : 'hidden'
  }

  open() {
    if (this.tag.children.length == 0) {
      this.tag.open = false
    }
    else {
      this.tag.open = !this.tag.open
    }
  }
}
