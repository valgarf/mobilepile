import {Component, Input, Output, EventEmitter} from '@angular/core';

import {NavController} from 'ionic-angular';

import {Observable} from 'rxjs/Rx'

import {Server, DataStore, ITag, str2color} from '@root/server'
import * as Lib from '@root/lib'
import * as Comp from '@root/components'


export interface ITagTree extends ITag {
  children: ITagTree[],
  open: boolean
}

@Component({
  selector: 'taglist',
  templateUrl: 'taglist.html'
})
export class TaglistComponent{
  @Input() tags: ITagTree[];
  @Input() level: number;
  @Output() select: EventEmitter<ITagTree> = new EventEmitter<ITagTree>();
  
  constructor() {
  }
  
  get leftPadding(): string {
    let ex = this.level*1.5
    return ex.toString()+'ex'
  }
  
  getColor(tag: ITag): string {
    return str2color(tag.label_color)
  }
  
  getIcon(tag: ITag): string {
    return 'assets/icon/'+tag.icon.substring(5)+'-inverted.svg'
  }
  
  getArrow(tag: ITagTree):string {
    let arrtype = tag.open ? 'down' : 'right';
    return 'assets/icon/arrow-'+arrtype+'-inverted.svg'
  }
  
  getVisibility(tag: ITagTree):string {
    return tag.children.length>0 ? 'visible' : 'hidden'
  }
  
  open(tag: ITagTree) {
    if (tag.children.length == 0) {
      tag.open = false
    }
    else {
      tag.open = !tag.open
    }
  }
}
