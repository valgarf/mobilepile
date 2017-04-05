import {sprintf} from 'sprintf-js'

import { observable, computed, autorun, action, ObservableMap } from 'mobx'
import * as Server from '@root/server'
import {Store} from './store'

export class TagManager {
  @observable all: ObservableMap<Tag> = new ObservableMap<Tag>();
  @observable sortedIDs: string[] = []
  @computed get sorted(): Tag[] {
    return this.sortedIDs.map( id => this.getByID(id))
  }
  @computed get root():Tag[] {
    return this.sorted.filter( tag => tag.is_root )
  }

  constructor(public store: Store, private _server: Server.Server) {
    autorun( () => {
      console.log("MOBX TAGS:", this.root.filter((tag) => tag.visible ))
    })
  }

  getByID(id: string): Tag {
    return this.all.get(id)
  }

  // private _lastRefresh = null //maybe check for changes before updating? might reduce UI updates
  async refresh(): Promise<void> {
    let tagReply = await this._server.tagsOnce()
    //.distinctUntilChanged( (a,b) => JSON.stringify(a)== JSON.stringify(b) ) //anything faster than stringify?
    this.update(tagReply.tags)
  }

  @action public update(taglist: Server.ITag[] | {[tid:string]: Server.ITag}) {
    let updateTag = ( tag: Server.ITag) => {
      let tagobj = this.getByID(tag.tid)
      if (tagobj == null) {
        tagobj = new Tag(tag.tid, this)
        this.all.set(tag.tid, tagobj)
      }
      tagobj.update(tag)
    }

    if (Array.isArray(taglist)) {
      for (let tag of taglist) {
        updateTag(tag)
      }
      (this.sortedIDs as any).replace( taglist.map( tag => tag.tid) )
    }
    else {
        Object.keys(taglist).forEach( id => updateTag(taglist[id]) )
    }
  }
}


// export enum TagType { mailbox, tag, tagged, profile, blank, ham, attribute, forwarded, inbox, read, unread, replied, drafts, outbox}
export enum TagDisplayType {invisible, priority, tag}
export class Tag {

  @observable display: TagDisplayType = TagDisplayType.invisible;
  @observable icon: string = '';
  @observable label: boolean = true; // wether ot not a label is shown
  @observable label_color: string = '#ff0000'; // color of the label in HTML format
  @observable name: string = '';
  @observable parentID: string = "";
  @observable search_terms: string = '';
  @observable slug: string = '';
  @observable open: boolean = false; //wether or not this tag is currently opened in the UI. Move to some UI state?
  @observable type: string; //enum is too much hassle

  @computed get parent(): Tag {
    return this.manager.getByID(this.parentID)
  }
  @computed get children(): Tag[] {
    return this.manager.sorted.filter( child => child.parentID == this.ID )
  };
  @computed get is_root(): boolean {
    return this.parentID == "";
  }
  @computed get visible(): boolean {
    return this.display != TagDisplayType.invisible;
  };
  @computed get search_expression(): string {
    return sprintf(this.search_terms, {slug: this.slug})
  };
  @computed get is_mailbox(): boolean {
    return this.type == "mailbox"
  }

  constructor(public ID: string, private manager: TagManager) {
  }

  @action update(tag: Server.ITag) {
    switch(tag.display) {
      case 'invisible': this.display=TagDisplayType.invisible; break;
      case 'priority': this.display=TagDisplayType.priority; break;
      case 'tag': this.display=TagDisplayType.tag; break;
      default: throw new Error("Tag Display Type not implemented:" + tag.display);
    }
    // switch(tag.type) {
    //   case 'mailbox': this.type=TagType.mailbox; break;
    //   case 'tag': this.type=TagType.tag; break;
    //   case 'profile': this.type=TagType.profile; break;
    //   case 'blank': this.type=TagType.blank; break;
    //   case 'ham': this.type=TagType.ham; break;
    //   case 'attribute': this.type=TagType.attribute; break;
    //   case 'fwded': this.type=TagType.forwarded; break;
    //   case 'inbox': this.type=TagType.inbox; break;
    //   case 'read': this.type=TagType.read; break;
    //   case 'unread': this.type=TagType.unread; break;
    //   case 'replied': this.type=TagType.replied; break;
    //   case 'tagged': this.type=TagType.tagged; break;
    //   case 'drafts': this.type=TagType.drafts; break;
    //   case 'outbox': this.type=TagType.outbox; break;
    //   default: throw new Error("Tag Type not implemented:" + tag.type);
    // }
    this.type = tag.type
    this.icon = tag.icon;
    this.label = tag.label;
    this.label_color = Server.str2color(tag.label_color);
    this.name = tag.name;
    this.search_terms = tag.search_terms;
    this.slug = tag.slug;
    this.parentID = tag.parent;
  }
}
