import {observable, autorun, action, computed, ObservableMap} from 'mobx'

import {MailpileInterfaces} from '@root/server'

import {Server} from '@root/server'
import {Store} from './store'
import {Message} from './messages'

export class ThreadManager {
  @observable all: ObservableMap<Thread> = new ObservableMap<Thread>();

  constructor(public store: Store, public server: Server) {
    autorun(() => {
      console.log("MOBX THREADS:", this.all.toJS())
    })
  }

  public getByID(id: string): Thread {
    return this.all.get(id)
  }

  @action public update(threadmap: { [id: string]: MailpileInterfaces.IMessageThread }) {
    Object.keys(threadmap).forEach(id => {
      let threadobj = this.all.get(id)
      let new_thread = threadmap[id]
      if (threadobj == null) {
        threadobj = new Thread(id, this);
        this.all.set(id, threadobj);
      }
      threadobj.update(new_thread)
    })
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
      case "": this.type = ThreadEntryType.single;
      case "r": this.type = ThreadEntryType.top;
      case "├": this.type = ThreadEntryType.middle;
      case "└": this.type = ThreadEntryType.bottom;
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

  update(thread: MailpileInterfaces.IMessageThread) {
    this.entries = thread.map(entry => new ThreadEntry(this, entry))
    //TODO this is hacked in here, no chance to update this messages on a regular basis....
    // let promises = []
    for (let entry of this.entries) {
      if (entry.message == null) {
        this.manager.server.getMessage(this.ID).then((result) => this.manager.store.updateStore(result.data)).catch(this.manager.store.state.handleError)
        // let promises.push(download)
      }
    }
  }
}
