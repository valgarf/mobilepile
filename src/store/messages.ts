import { observable, computed, autorun, intercept, action, ObservableMap } from 'mobx'
import * as Server from '@root/server'
import { Store } from './store'
import { Address } from './addresses'
import { Tag } from './tags'
import { Thread } from './threads'

export class MessageManager {
  @observable all: ObservableMap<Message> = new ObservableMap<Message>();

  constructor(public store: Store) {
    autorun( () => {
      console.log("MOBX MESSAGES:", this.all.toJS() )
    })
  }

  public getByID(id: string): Message {
    return this.all.get(id)
  }

  @action public update( msgmap: { [id:string]: Server.IMessage | Server.IMessageMetadata }) {
    Object.keys(msgmap).forEach( id => {
      let msgobj = this.all.get(id)
      let new_msg = msgmap[id]
      if (msgobj == null) {
        msgobj = new Message(id, this);
        this.all.set(id, msgobj);
      }
      msgobj.update(new_msg)
    })
  }
}

export class MessagePart {
  constructor(public charset: string, public data: string, public type: string){
  }
}

export class MessagePartHTML extends MessagePart {}
export class MessagePartText extends MessagePart {}

function TypeGuardIMessage(arg: any): arg is Server.IMessage {
  return arg.text_parts !== undefined
}

function TypeGuardIMessageMetadata(arg: any): arg is Server.IMessageMetadata {
  return arg.from !== undefined
}

export class Message {

  @observable html_parts: MessagePartHTML[] = [];
  @observable text_parts: MessagePartText[] = [];

  @observable subject: string = "";
  @observable snippet: string = "";
  @observable timestamp: Date;
  @observable fromID: string = undefined;
  @observable toIDS: string[] = [];
  @observable mailinglist: string = undefined;
  @observable read: boolean;
  @observable tagIDS: string[] = [];
  @observable threadID: string = undefined;

  @computed get from(): Address {
    return this.manager.store.addresses.getByID(this.fromID)
  }
  @computed get to(): Address[] {
    return this.toIDS.map( id => this.manager.store.addresses.getByID(id) )
  }
  @computed get tags(): Tag[] {
    return this.tagIDS.map( id => this.manager.store.tags.getByID(id) )
  }
  @computed get thread(): Thread {
    return this.manager.store.threads.getByID(this.threadID)
  }

  constructor(public ID: string, private manager: MessageManager) {
  }

  @action update(msg: Server.IMessage | Server.IMessageMetadata) {
    if (TypeGuardIMessage(msg)) {
      // I have NO IDEA why the first two lines crash claiming that 'replace' is not a function...
      // (this.html_parts as any).replace(msg.html_parts.map( part => new MessagePartHTML(part.charset, part.data, part.type) ))
      // (this.text_parts as any).replace(msg.text_parts.map( part => new MessagePartText(part.charset, part.data, part.type) ))
      this.html_parts = msg.html_parts.map( part => new MessagePartHTML(part.charset, part.data, part.type) )
      this.text_parts = msg.text_parts.map( part => new MessagePartText(part.charset, part.data, part.type) )
    }
    else {
      this.subject = msg.subject
      this.snippet = msg.body.snippet
      this.timestamp = new Date(msg.timestamp*1000);
      this.fromID = msg.from.aid
      this.toIDS = msg.to_aids
      this.mailinglist = msg.body.list
      this.read = !msg.flags.unread
      this.tagIDS = msg.tag_tids
      this.threadID = msg.thread_mid
    }
  }
}
