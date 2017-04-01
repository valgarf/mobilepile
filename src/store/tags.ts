import { observable, computed, autorun, action } from 'mobx'
import * as Server from '@root/server'
import {Store} from './store'

export class TagManager {
  @observable all: Tag[] = [];
  @computed get root():Tag[] {
    return this.all.filter( tag => tag.is_root )
  }

  constructor(public store: Store) {
    // autorun( () => {
    //   console.log("MOBX TAGS:", self.root.filter((tag) => tag.visible ))
    // })
  }

  public getByID(id: string): Tag {
    return this.all.find( (tag) => tag.ID == id)
  }

  @action public update(taglist: Server.ITag[]) {
    let tmplist = []
    let tmpmap = {}
    for (let tag of taglist) {
      let tagobj = this.getByID(tag.tid)
      if (tagobj == null) {
        tagobj = new Tag(tag.tid, this)
      }
      tagobj.update(tag)
      tagobj.children = []
      tmplist.push(tagobj)
      tmpmap[tagobj.ID] = tagobj
    }
    for (let tag of tmplist) {
      if (tag.parentID != "") {
        tag.parent = tmpmap[tag.parentID]
        tag.parent.children.push(tag)
      }
    }
    if ((this.all as any).peek() != tmplist) {
      (this.all as any).replace(tmplist) //no types for mobx
    }
  }
}


// export enum TagType { Mailbox, Tag}
export enum TagDisplayType {invisible, priority, tag}
export class Tag {

  @observable display: TagDisplayType = TagDisplayType.invisible;
  @observable icon: string = '';
  @observable label: boolean = true; // wether ot not a label is shown
  @observable label_color: string = '#ff0000'; // color of the label in HTML format
  @observable name: string = '';
  @observable parent: Tag = null;
  @observable parentID: string = "";
  @observable search_terms: string = '';
  @observable slug: string = '';
  @observable children: Tag[] = [];
  @observable open: boolean = false; //wether or not this tag is currently opened in the UI. Move to some UI state?
  // @observable type: TagType;

  @computed get is_root(): boolean {
    return this.parent == null;
  }
  @computed get visible(): boolean {
    return this.display != TagDisplayType.invisible;
  };
  @computed get search_expression(): string {
    return sprintf(this.search_terms, {slug: this.slug})
  };

  constructor(public ID: string, private manager: TagManager) {
  }

  @action update(tag: Server.ITag) {
    switch(tag.display) {
      case 'invisible': this.display=TagDisplayType.invisible; break;
      case 'priority': this.display=TagDisplayType.priority; break;
      case 'tag': this.display=TagDisplayType.tag; break;
      default: throw new Error();
    }
    this.icon = tag.icon;
    this.label = tag.label;
    this.label_color = Server.str2color(tag.label_color);
    this.name = tag.name;
    this.search_terms = tag.search_terms;
    this.slug = tag.slug;
    this.parentID = tag.parent;
  }
}
