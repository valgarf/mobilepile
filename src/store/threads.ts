import {observable, autorun, action, computed, ObservableMap} from 'mobx'

import {MailpileInterfaces} from '@root/server'

import * as Lib from '@root/lib'
import {Server} from '@root/server'
import {Store} from './store'
import {Message} from './messages'

export class ThreadManager {
  @observable all: ObservableMap<Thread> = new ObservableMap<Thread>();

  constructor(public store: Store, public server: Server) {
    autorun(() => {
      Lib.log.debug(['data', 'change', 'autorun', 'thread'], "all threads: ", this.all.toJS())
    })
  }

  public getByID(id: string): Thread {
    return this.all.get(id)
  }

  @action public async update(threadmap: { [id: string]: MailpileInterfaces.IMessageThread }): Promise<void> {
    await Promise.all(Object.keys(threadmap).map(async (id: string): Promise<void> => {
      let threadobj = this.all.get(id)
      let new_thread = threadmap[id]
      if (threadobj == null) {
        threadobj = new Thread(id, this);
        this.all.set(id, threadobj);
      }
      await threadobj.update(new_thread)
    }))
  }
}

export enum ThreadEntryType { single, top, middle, bottom }
export class ThreadEntry {
  messageID: string
  type: ThreadEntryType
  @computed get message(): Message {
    return this.thread.manager.store.messages.getByID(this.messageID)
  }

  constructor(public thread: Thread, threadEntry: MailpileInterfaces.IMessageEntry) {
    this.messageID = threadEntry[0]
    switch (threadEntry[1]) {
      case "": this.type = ThreadEntryType.single; break;
      case "┌": this.type = ThreadEntryType.top; break;
      case "├": this.type = ThreadEntryType.middle; break;
      case "└": this.type = ThreadEntryType.bottom; break;
      default: throw new Lib.UnknownTypeError(`The thread entry type '${threadEntry[1]}' is not known.`, threadEntry, ['thread', 'switch']);
    }
  }
}

export class Thread {

  @observable entries: ThreadEntry[] = []
  @computed get messages(): Message[] {
    return this.entries.map(e => e.message)
  }

  constructor(public ID: string, public manager: ThreadManager) {
  }

  async update(thread: MailpileInterfaces.IMessageThread): Promise<void> {
    this.entries = thread.map(entry => new ThreadEntry(this, entry)) //TODO recreating is obviously wasteful...
    //TODO not very nice, we fetch further data during the update procedure. Would be good to get all the relevant data in the first run
    await Promise.all(this.entries.map(async (e) => {
      if (e.message == null) {
        await this.manager.store.messages.loadMessage(e.messageID)
      }
    }))
  }
}
