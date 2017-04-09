import {observable, computed, autorun, action, ObservableMap} from 'mobx'

import * as Lib from '@root/lib'
import {MailpileInterfaces, Server} from '@root/server'
import {Store} from './store'
import {Address} from './addresses'
import {Tag} from './tags'
import {Thread} from './threads'

export class MessageManager {
  @observable all: ObservableMap<Message> = new ObservableMap<Message>();

  constructor(public store: Store, public server: Server) {
    autorun(() => {
      Lib.log.debug(['data', 'change', 'autorun', 'message'], "messages:", this.all.toJS())
    })
  }

  public getByID(id: string): Message {
    return this.all.get(id)
  }

  @action public update(msgmap: { [id: string]: MailpileInterfaces.IMessage | MailpileInterfaces.IMessageMetadata }) {
    Object.keys(msgmap).forEach(id => {
      let msgobj = this.all.get(id)
      let new_msg = msgmap[id]
      if (msgobj == null) {
        msgobj = new Message(id, this);
        this.all.set(id, msgobj);
      }
      msgobj.update(new_msg)
    })
  }

  private _failedDownload = []; //cache all unavailable ids -> prevent retrying
  public async loadMessage(id: string): Promise<void> {
    if (this._failedDownload.indexOf(id) > -1) {
      throw new Lib.DataUnavailableError(`Cannot obtain message with id '${id}' from server`, this.getByID(id), ['message'], null, false, false)
    }
    let result = await this.server.getMessage(id)
    if (result.data == null) {
      this._failedDownload.push(id)
      throw new Lib.DataUnavailableError(`Cannot obtain message with id '${id}' from server`, [result, this.getByID(id)], ['message'], null, false)
    }
    await this.store.updateStore(result.data)
  }
}

export class MessagePart {
  constructor(public charset: string, public data: string, public type: string) {
  }
}

export class MessagePartHTML extends MessagePart { }
export class MessagePartText extends MessagePart { }

function TypeGuardIMessage(arg: any): arg is MailpileInterfaces.IMessage {
  return arg.text_parts !== undefined
}

// function TypeGuardIMessageMetadata(arg: any): arg is MailpileInterfaces.IMessageMetadata {
//   return arg.from !== undefined
// }

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
    return this._manager.store.addresses.getByID(this.fromID)
  }
  @computed get to(): Address[] {
    return this.toIDS.map(id => this._manager.store.addresses.getByID(id))
  }
  @computed get tags(): Tag[] {
    return this.tagIDS.map(id => this._manager.store.tags.getByID(id))
  }
  @computed get thread(): Thread {
    return this._manager.store.threads.getByID(this.threadID)
  }
  @computed get text_complete(): string {
    let result = ""
    for (let text of this.text_parts) {
      result += text.data
    }
    return result
  }
  @computed get html_complete(): string {
    let result = ""
    for (let html of this.html_parts) {
      result += html.data
    }
    return result
  }

  constructor(public ID: string, private _manager: MessageManager) {
  }

  @action update(msg: MailpileInterfaces.IMessage | MailpileInterfaces.IMessageMetadata) {
    if (TypeGuardIMessage(msg)) {
      // I have NO IDEA why the first two lines crash claiming that 'replace' is not a function...
      // (this.html_parts as any).replace(msg.html_parts.map( part => new MessagePartHTML(part.charset, part.data, part.type) ))
      // (this.text_parts as any).replace(msg.text_parts.map( part => new MessagePartText(part.charset, part.data, part.type) ))
      this.html_parts = msg.html_parts.map(part => new MessagePartHTML(part.charset, part.data, part.type))
      this.text_parts = msg.text_parts.map(part => new MessagePartText(part.charset, part.data, part.type))
    }
    else {
      this.subject = msg.subject
      this.snippet = msg.body.snippet
      this.timestamp = new Date(msg.timestamp * 1000);
      this.fromID = msg.from.aid
      this.toIDS = msg.to_aids
      this.mailinglist = msg.body.list
      this.read = !msg.flags.unread
      this.tagIDS = msg.tag_tids
      this.threadID = msg.thread_mid
    }
  }

  public async loadMessage(): Promise<void> {
    await this._manager.loadMessage(this.ID)
  }
}
